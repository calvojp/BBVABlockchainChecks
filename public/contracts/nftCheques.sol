// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/ArrayUtils.sol"; 

contract NFTCheque is ERC721 {
    using ArrayUtils_uint256 for uint256[];

    uint256 private _totalCheques;
    IERC20 public pesosArgentinosToken;
    uint32 public maxTimeDeferred = 365 days;
    uint32 public timeToWithdrawGeneral = 30 days;
    uint32 public timeToWithdrawCertified = 5 days;
    uint32 public timeToRemedy = 1 days;
    uint256 public maxAmount;

    enum ChequeType {Simple, Certified, Deferred}
    enum ChequeState { /*Estados aptos para cobro*/
                        EMITTED //Emitido || Se creó el cheque
                        ,ACCEPTED //Aceptado || Se aceptó el cheque
                        ,DUE //Cheque en DUE || Primer rechazo del cheque (Da tiempo a normalizar)
                        
                        /*Estados FINALES*/
                        ,CANCELLED //Cancelado || Se cancela el cheque. SI ES CERTIFICADO EL EMISOR PUEDE RECUPERAR EL DINERO
                        ,CASHED //Cobrado || Se cobró el cheque
                        ,RETRIEVED //Recuperado (CERTIFICADOS) || Se recuperó el dinero de certificación
                        ,REJECTED //Rechazado || Se rechazó el cheque
                    }

    struct ChequeInfo {
        uint256 chequeId;
        address issuer;
        //address recipient;
        uint256 amount;
        uint32 dateFrom;
        //bool isCashed;
        ChequeState state;
        bool isCertified;
    }

    //INFORMACIÓN GENERAL DE CHEQUES
    mapping(uint256 => ChequeInfo) public chequeRepo;
    mapping(address => uint256[]) public chequesByRecipient;
    mapping(address => uint256[]) public chequesByIssuer;
    mapping(address => uint256[]) public activeChequesByIssuer;
    mapping(address => uint256[]) public activeChequesByRecipient;
    mapping(address => uint256[]) public rejectedChequesByRecipient;
    mapping(uint256 => uint32) public dueDate;
    mapping(address => uint256) public totalDebt;

    //PARA TRANSFERENCIA DE CHEQUES
    mapping(uint256 => address) private potentialOwner;
    mapping(address => uint256[]) public potentialCheques;

    //PARA CHEQUES DIVIDIDOS
    mapping(uint256 => uint256) private childToParent;
    mapping(uint256 => uint256[]) public parentToChildren;
    mapping(uint256 => uint256) public availableChequeValue;

    event Minted(uint256 indexed chequeId, address indexed to, uint256 amount);
    event Offered(uint256 indexed chequeId, address indexed to);
    event Accepted(uint256 indexed chequeId, address indexed receiver);
    event Cashed(uint256 indexed chequeId, address indexed to, uint256 amount);
    event Due(uint256 indexed chequeId);
    event Retrieved(uint256 indexed chequeId, address indexed reclaimer, uint256 amount);
    event Split(uint256 indexed parentChequeId, uint256 indexed childChequeId, address indexed to, uint256 amount);
    event Cancelled(uint256 indexed chequeId, address indexed canceller);
    event Rejected(uint256 indexed chequeId);
    event Remedied(uint256 indexed chequeId);

    error Unauthorized();
    error OnlyEmittedOrAccepted();
    error OnlyEmitted();
    error OnlyNonCertified();
    error OnlyIssuer();
    error Expired();
    error InactiveCheque();
    error RecipientInvalid();
    error InvalidAmount();
    error IncompatibleCheque();
    error CertifiedCannotDefer();
    error ChequeNotReady();
    error SplittedNotAllowed();
    error UseOfferInstead();
    error ExceedsLimit();
    error ArgExceedsLimit(uint256 arg, uint256 limit);
    
    constructor(address _pesosArgentinosToken) ERC721("Crypto Cheques", "cCheq") {
        pesosArgentinosToken = IERC20(_pesosArgentinosToken);
    }

    modifier onlyChequeHolder(uint256 _chequeId) {
        if(ownerOf(_chequeId) != msg.sender) revert Unauthorized();
        _;
    }

    modifier onlyValidCheque(uint256 _chequeId) {
        _onlyValidCheque(_chequeId);
        _;
    }

    modifier validateChequeHeader(address _recipient, uint256 _amount){
        _validateChequeHeader(_recipient, _amount);
        _;
    }

    function transferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public virtual override {
        revert UseOfferInstead();
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/
    ) public virtual override {
        revert UseOfferInstead();
    }

    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*tokenId*/,
        bytes memory /*data*/
    ) public virtual override {
        revert UseOfferInstead();
    }

    function mint(address _recipient, uint256 _amount, uint32 _deferralSeconds, bool _isCertified)
        public validateChequeHeader(_recipient, _amount) {
        if(_isCertified){
            if(_deferralSeconds > 0) {
                revert CertifiedCannotDefer();
            }
        } else {
            if(_deferralSeconds > maxTimeDeferred){
                revert ArgExceedsLimit(uint256(_deferralSeconds), uint256(maxTimeDeferred));
            }
        }
        uint256 chequeId = _totalCheques + 1;
        _totalCheques = chequeId;

        _safeMint(_recipient, chequeId);

        chequeRepo[chequeId] = ChequeInfo(
                                chequeId
                                ,msg.sender
                                ,_amount
                                ,uint32(block.timestamp) + _deferralSeconds
                                ,ChequeState.EMITTED
                                ,_isCertified);
        availableChequeValue[chequeId] = _amount;
        _mapIssuedCheque(chequeId, msg.sender, _recipient);
        pesosArgentinosToken.transferFrom(msg.sender, address(this), _amount);

        emit Minted(chequeId, _recipient, _amount);
    }

    function accept(uint256 _chequeId) public {
        if(msg.sender == ownerOf(_chequeId)){
            if(chequeRepo[_chequeId].state != ChequeState.EMITTED){
                revert OnlyEmitted();
            }
            _acceptEmitted(_chequeId);
        } else if (msg.sender == potentialOwner[_chequeId]) {
            _acceptTransfer(_chequeId);
        } else {
            revert Unauthorized();
        }
        _mapAcceptedCheque(_chequeId, msg.sender);
        emit Accepted(_chequeId, msg.sender);
    }

    function cancel(uint256 _chequeId) public onlyValidCheque(_chequeId) {
        if(chequeRepo[_chequeId].state == ChequeState.EMITTED){
            if(msg.sender != chequeRepo[_chequeId].issuer && msg.sender != ownerOf(_chequeId)){
                revert Unauthorized();
            }

        } else if (chequeRepo[_chequeId].state == ChequeState.ACCEPTED){
            if(msg.sender != ownerOf(_chequeId)){
                revert Unauthorized();
            }

        } else {
            revert IncompatibleCheque();

        }
        _cancel(_chequeId);
    }

    function splitCheque(uint256 _parentId, uint256 _amount, address _recipient) public onlyChequeHolder(_parentId) onlyValidCheque(_parentId) validateChequeHeader(_recipient, _amount){
        ChequeInfo memory parentCheque = chequeRepo[_parentId];
        if(parentCheque.isCertified){
            revert OnlyNonCertified();
        }
        if(availableChequeValue[_parentId] < _amount){
            revert InvalidAmount();
        }

        uint256 childId = _parameterizedMint(msg.sender, _recipient, _amount, parentCheque.dateFrom, false);

        _mapSplitCheque(_parentId, childId, msg.sender, _recipient);
        availableChequeValue[_parentId] -= _amount;
        emit Split(_parentId, childId, _recipient, _amount);

    }

    function offer(address _to, uint256 _chequeId) public onlyChequeHolder(_chequeId) onlyValidCheque(_chequeId){
        if(parentToChildren[_chequeId].length > 0){
            revert SplittedNotAllowed();
        }
        if(potentialOwner[_chequeId] != address(0)){
            potentialCheques[potentialOwner[_chequeId]].removeValue(_chequeId);
        }
        potentialOwner[_chequeId] = _to;
        potentialCheques[_to].push(_chequeId);
        
    }

    function withdraw(uint256 _chequeId) public onlyChequeHolder(_chequeId) onlyValidCheque(_chequeId) {

        if(chequeRepo[_chequeId].dateFrom > block.timestamp){
            revert ChequeNotReady();
        }
        
        if(chequeRepo[_chequeId].isCertified){
            _simpleWithdraw(_chequeId, address(this));
        } else {
            if(pesosArgentinosToken.allowance(chequeRepo[_chequeId].issuer, address(this)) < chequeRepo[_chequeId].amount
            || pesosArgentinosToken.balanceOf(chequeRepo[_chequeId].issuer) < chequeRepo[_chequeId].amount) {
                chequeRepo[_chequeId].state = ChequeState.DUE;
                dueDate[_chequeId] = uint32(block.timestamp);
                emit Due(_chequeId);
                return;
            }   
            _splitWithdraw(_chequeId, chequeRepo[_chequeId].issuer);
        }
    }

    function reject(uint256 _chequeId) public onlyChequeHolder(_chequeId) {
        if(!(chequeRepo[_chequeId].state == ChequeState.DUE && dueDate[_chequeId] + timeToRemedy < block.timestamp)){
            revert ChequeNotReady();
        }
        _reject(_chequeId);
    }

    function remedy(uint256 _chequeId) public {
        if(msg.sender != chequeRepo[_chequeId].issuer){
            revert OnlyIssuer();
        }
        if(chequeRepo[_chequeId].state != ChequeState.DUE){
            revert IncompatibleCheque();
        }
        if(dueDate[_chequeId] + timeToRemedy < block.timestamp) {
            _reject(_chequeId);
        } else {
            _splitWithdraw(_chequeId, msg.sender);
            emit Remedied(_chequeId);
        }
    }

    function retrieve(uint256 _chequeId) public {
        ChequeInfo storage cheque = chequeRepo[_chequeId];
        if(cheque.issuer != msg.sender){
            revert Unauthorized();
        }
        if(!cheque.isCertified 
            || !(cheque.state == ChequeState.EMITTED || cheque.state == ChequeState.CANCELLED || cheque.dateFrom + timeToWithdrawCertified < block.timestamp)){
            revert IncompatibleCheque();
        }
        cheque.state = ChequeState.RETRIEVED;
        
        pesosArgentinosToken.transferFrom(address(this), cheque.issuer, cheque.amount);
        _mapCashedCheque(_chequeId);

        emit Retrieved(_chequeId, cheque.issuer, cheque.amount);
        _burn(_chequeId);
    }

    function isChequeValid(uint256 _chequeId) public view returns (bool) {
        return (chequeRepo[_chequeId].amount != 0 
                && (chequeRepo[_chequeId].state == ChequeState.EMITTED
                || chequeRepo[_chequeId].state == ChequeState.ACCEPTED)
            );
    }

    function _simpleWithdraw(uint256 _chequeId, address from) internal {
        uint256 amount = chequeRepo[_chequeId].amount;
        chequeRepo[_chequeId].state = ChequeState.CASHED;

        pesosArgentinosToken.transferFrom(from, ownerOf(_chequeId), amount);
        _mapCashedCheque(_chequeId);

        emit Cashed(_chequeId, ownerOf(_chequeId), amount);
        _burn(_chequeId);
    }

    /*function _certifiedWithdraw(uint256 _chequeId) internal {
        uint256 amount = chequeRepo[_chequeId].amount;
        chequeRepo[_chequeId].state = ChequeState.CASHED;

        pesosArgentinosToken.transferFrom(address(this), ownerOf(_chequeId), amount);
        _mapCashedCheque(_chequeId);

        emit Cashed(_chequeId, ownerOf(_chequeId), amount);
        _burn(_chequeId);
    }*/

    function _splitWithdraw(uint256 _chequeId, address _from) internal {
        ChequeInfo storage cheque = chequeRepo[_chequeId];
        uint256[] memory children = parentToChildren[_chequeId];

        _simpleWithdraw(_chequeId, _from);
        for(uint i = 0; i < children.length; i++){
            ChequeState _state = chequeRepo[children[i]].state;
            if(_state == ChequeState.EMITTED || _state == ChequeState.ACCEPTED) _simpleWithdraw(children[i], chequeRepo[children[i]].issuer);
        }

        emit Cashed(_chequeId, ownerOf(_chequeId), cheque.amount);
    }

    function _reject(uint256 _chequeId) internal {
        chequeRepo[_chequeId].state = ChequeState.REJECTED;
        _mapCashedCheque(_chequeId);
        rejectedChequesByRecipient[chequeRepo[_chequeId].issuer].push(_chequeId);
        emit Rejected(_chequeId);
    }

    function _parameterizedMint(
          address _issuer
        , address _recipient
        , uint256 _amount
        , uint32 _dateFrom
        , bool _isCertified
        ) internal virtual returns (uint256) {
        
        uint256 chequeId = _totalCheques + 1;
        _totalCheques = chequeId;

        _safeMint(_recipient, chequeId);
        chequeRepo[chequeId] = ChequeInfo(
                                chequeId
                                ,_issuer
                                ,_amount
                                ,_dateFrom
                                , ChequeState.EMITTED
                                ,_isCertified
                                );
        availableChequeValue[chequeId] = _amount;
        totalDebt[_issuer] += _amount;

        return chequeId;
    }

    function _acceptEmitted(uint256 _chequeId) internal {
        chequeRepo[_chequeId].state = ChequeState.ACCEPTED;
    }

    function _acceptTransfer(uint256 _chequeId) internal {
        if(chequeRepo[_chequeId].state == ChequeState.EMITTED){
            chequeRepo[_chequeId].state = ChequeState.ACCEPTED;   
        }
        _safeTransfer(ownerOf(_chequeId), potentialOwner[_chequeId], _chequeId,"");
    }

    function _mapIssuedCheque(uint256 _chequeId, address _issuer, address _to) internal virtual {
        chequesByIssuer[_issuer].push(_chequeId);
        activeChequesByIssuer[_issuer].push(_chequeId);
        potentialCheques[_to].push(_chequeId);
        totalDebt[_issuer] += chequeRepo[_chequeId].amount;
    }

    function _mapAcceptedCheque(uint256 _chequeId, address _recipient) internal virtual {
        chequesByRecipient[_recipient].push(_chequeId);
        activeChequesByRecipient[_recipient].push(_chequeId);
        potentialCheques[_recipient].removeValue(_chequeId);
    }    

    function _mapSplitCheque(uint256 _parentId, uint256 _childId, address _issuer, address _recipient) internal virtual{
        parentToChildren[_parentId].push(_childId);
        childToParent[_childId] = _parentId;
        _mapIssuedCheque(_childId, _issuer, _recipient);
    }

    function _mapCashedCheque(uint256 _chequeId) internal virtual{
        address issuer = chequeRepo[_chequeId].issuer;
        
        if(!activeChequesByIssuer[issuer].removeValue(_chequeId)){
            revert InactiveCheque();
        }

        //Se elimina la relación activa con el receptor actual
        if(chequeRepo[_chequeId].state == ChequeState.EMITTED){
            potentialCheques[ownerOf(_chequeId)].removeValue(_chequeId);
        } else {
            activeChequesByRecipient[ownerOf(_chequeId)].removeValue(_chequeId);
        }

        //Si hay un dueño potencial del cheque distinto del dueño actual, se elimina la relación
        if(potentialOwner[_chequeId] != ownerOf(_chequeId)){
            potentialCheques[potentialOwner[_chequeId]].removeValue(_chequeId);
        }

        totalDebt[issuer] -= chequeRepo[_chequeId].amount;
    }

    function _cancel(uint256 _chequeId) internal virtual {
        ChequeInfo storage cheque = chequeRepo[_chequeId];

        //Si el cheque es certificado, se devuelve la guita. Sino, se refleja estado cancelado
        if(cheque.isCertified){
            pesosArgentinosToken.transferFrom(address(this), cheque.issuer, cheque.amount);
            cheque.state = ChequeState.RETRIEVED;
            emit Retrieved(_chequeId, cheque.issuer, cheque.amount);
        } else {
            cheque.state = ChequeState.CANCELLED;
        }
        
        _removeChildren(childToParent[_chequeId], _chequeId);
        _mapCashedCheque(_chequeId);
        _burn(_chequeId);
    }

    function _removeChildren(uint256 _parentId, uint256 _childId) internal{
        if(parentToChildren[_parentId].removeValue(_childId)){
            availableChequeValue[_parentId] += chequeRepo[_childId].amount;
            totalDebt[chequeRepo[_parentId].issuer] += chequeRepo[_childId].amount;
        }
        
    }

    function _onlyValidCheque(uint256 _chequeId) private view {
        if(chequeRepo[_chequeId].state == ChequeState.EMITTED || chequeRepo[_chequeId].state == ChequeState.ACCEPTED){
            revert OnlyEmittedOrAccepted();
        }
        if(chequeRepo[_chequeId].dateFrom + (chequeRepo[_chequeId].isCertified ? timeToWithdrawCertified: timeToWithdrawGeneral) > block.timestamp){
            revert Expired();
        }
    }

    function _validateChequeHeader(address _recipient, uint256 _amount) private view {
        if(!(_recipient != address(0) && _recipient != msg.sender)){
            revert RecipientInvalid();
        }
        if(_amount == 0){
            revert InvalidAmount();
        }
        if(_amount > maxAmount - totalDebt[msg.sender]){
            revert ExceedsLimit();
        }
        
    }

}