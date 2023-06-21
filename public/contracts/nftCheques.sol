// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/ArrayUtils.sol"; 

contract NFTCheque is ERC721, Ownable {
    using ArrayUtils_uint256 for uint256[];

    uint256 private _totalCheques;
    IERC20 public pesosArgentinosToken;
    uint32 public maxTimeDeferred = 365 days;
    uint32 public timeToWithdrawGeneral = 30 days;
    uint32 public timeToWithdrawCertified = 5 days;
    uint32 public timeToRemedy = 1 days;

    enum ChequeType {Simple, Certified, Deferred}
    enum ChequeState { /*Estados aptos para cobro*/
                        EMITTED //Emitido || Se creó el cheque
                        ,ACCEPTED //Aceptado || Se aceptó el cheque
                        ,DUE //Cheque en DUE || Primer rechazo del cheque (Da tiempo a normalizar)
                        ,CANCELLED //Cancelado || Se cancela el cheque. SI ES CERTIFICADO EL EMISOR PUEDE RECUPERAR EL DINERO

                        /*Estados FINALES*/
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
    mapping(address => uint256[]) private potentialCheques;
    mapping(uint256 => uint32) private dueDate;

    //PARA TRANSFERENCIA DE CHEQUES
    mapping(uint256 => address) private potentialOwner;

    //PARA CHEQUES DIVIDIDOS
    mapping(uint256 => uint256) private childToParent;
    mapping(uint256 => uint256[]) private parentToChildren;
    mapping(uint256 => uint256) private availableChequeValue;


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

    constructor(address _pesosArgentinosToken) ERC721("Crypto Cheques", "cCheq") {
        pesosArgentinosToken = IERC20(_pesosArgentinosToken);
    }

    modifier onlyChequeHolder(uint256 _chequeId) {
        require(ownerOf(_chequeId) == msg.sender, "Solo el titular del cheque puede realizar esta accion.");
        _;
    }

    modifier onlyValidCheque(uint256 _chequeId) {
        require(chequeRepo[_chequeId].state == ChequeState.EMITTED || chequeRepo[_chequeId].state == ChequeState.ACCEPTED, "El cheque ya fue cobrado");
        require(chequeRepo[_chequeId].dateFrom + (chequeRepo[_chequeId].isCertified ? timeToWithdrawCertified: timeToWithdrawGeneral) > block.timestamp, "Cheque vencido");
        _;
    }

    modifier validateChequeHeader(address _recipient, uint256 _amount){
        require(_recipient != address(0), "El destinatario no puede ser la direccion cero.");
        require(_recipient != msg.sender, "El destinatario no puede ser el emisor del cheque.");
        require(_amount > 0, "La cantidad debe ser mayor que 0.");
        _;
    }

    function mint(address _recipient, uint256 _amount, uint32 _deferralSeconds, bool _isCertified)
        public validateChequeHeader(_recipient, _amount) {
        if(_isCertified){
            require(_deferralSeconds == 0, "Los cheques certificados no pueden ser diferidos");
        } else {
            require(_deferralSeconds <= maxTimeDeferred, "El tiempo diferido es superior al maximo");
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
            require(chequeRepo[_chequeId].state == ChequeState.EMITTED, "Cheque ya aceptado o invalido");
            _acceptEmitted(_chequeId);
        } else if (msg.sender == potentialOwner[_chequeId]) {
            _acceptTransfer(_chequeId);
        } else {
            revert("No posee permisos sobre el cheque");
        }
        _mapAcceptedCheque(_chequeId, msg.sender);
        emit Accepted(_chequeId, msg.sender);
    }

    function cancel(uint256 _chequeId) public onlyValidCheque(_chequeId) {
        if(chequeRepo[_chequeId].state == ChequeState.EMITTED){
            require(msg.sender == chequeRepo[_chequeId].issuer || msg.sender == ownerOf(_chequeId), "No posee permisos sobre el cheque");
            chequeRepo[_chequeId].state = ChequeState.CANCELLED;
        } else if (chequeRepo[_chequeId].state == ChequeState.ACCEPTED){
            require(msg.sender == ownerOf(_chequeId), "No posee permisos sobre el cheque");
            chequeRepo[_chequeId].state = ChequeState.CANCELLED;
        } else {
            revert("No se puede cancelar el cheque");
        }
    }

    function splitCheque(uint256 _parentId, uint256 _amount, address _recipient) public onlyChequeHolder(_parentId) onlyValidCheque(_parentId) validateChequeHeader(_recipient, _amount){
        ChequeInfo memory parentCheque = chequeRepo[_parentId];
        require(!parentCheque.isCertified, "No se puede dividir un cheque certificado");
        require(availableChequeValue[_parentId] >= _amount, "Saldo insuficiente");

        uint256 childId = _parameterizedMint(msg.sender, _recipient, _amount, parentCheque.dateFrom, false);

        _mapSplitCheque(_parentId, childId, msg.sender, _recipient);
        availableChequeValue[_parentId] -= _amount;
        emit Split(_parentId, childId, _recipient, _amount);

    }

    /*function transfer(address to, uint256 _chequeId) public onlyChequeHolder(_chequeId) {
        safeTransferFrom(msg.sender, to, _chequeId);
    }*/

    function offer(address _to, uint256 _chequeId) public onlyChequeHolder(_chequeId) onlyValidCheque(_chequeId){
        require(parentToChildren[_chequeId].length == 0, "No se puede ofrecer un cheque dividido");
        potentialOwner[_chequeId] = _to;
        potentialCheques[_to].push(_chequeId);
    }

    function withdraw(uint256 _chequeId) public onlyChequeHolder(_chequeId) onlyValidCheque(_chequeId) {
        require(chequeRepo[_chequeId].dateFrom <= block.timestamp, "No se ha iniciado el periodo de cobro del cheque");
        
        if(chequeRepo[_chequeId].isCertified){
            _certifiedWithdraw(_chequeId);
        } else {
            if(pesosArgentinosToken.allowance(chequeRepo[_chequeId].issuer, address(this)) < chequeRepo[_chequeId].amount
            || pesosArgentinosToken.balanceOf(chequeRepo[_chequeId].issuer) < chequeRepo[_chequeId].amount) {
                chequeRepo[_chequeId].state = ChequeState.DUE;
                dueDate[_chequeId] = uint32(block.timestamp);
                emit Due(_chequeId);
                return;
            }   
            _splitWithdraw(_chequeId);
        }

        /*if(parentToChildren[_chequeId].length > 0){
            _splitWithdraw(_chequeId);
        } else if (chequeRepo[_chequeId].isCertified) {
            _certifiedWithdraw(_chequeId);
        } else {
            _simpleWithdraw(_chequeId);
        }*/
    }

    function reject(uint256 _chequeId) public onlyChequeHolder(_chequeId) {
        require(chequeRepo[_chequeId].state == ChequeState.DUE && dueDate[_chequeId] + timeToRemedy< block.timestamp, "Aun no se puede rechazar el cheque");
        _reject(_chequeId);
    }

    function remedy(uint256 _chequeId) public {
        require(chequeRepo[_chequeId].state == ChequeState.DUE, "El cheque no esta en deuda");
        if(dueDate[_chequeId] + timeToRemedy < block.timestamp) {
            _reject(_chequeId);
        } else {
            _splitWithdraw(_chequeId);
            emit Remedied(_chequeId);
        }
    }

    function retrieve(uint256 _chequeId) public {
        ChequeInfo storage cheque = chequeRepo[_chequeId];
        require(cheque.isCertified && cheque.issuer == msg.sender, "No posee fondos a recuperar");
        require(cheque.state == ChequeState.EMITTED || cheque.state == ChequeState.CANCELLED || cheque.dateFrom + timeToWithdrawCertified < block.timestamp, "Cheque no apto para recuperar fondos");
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

    function getChequesByRecipient(address _recipient) public view returns (uint256[] memory) {
        return chequesByRecipient[_recipient];
    }

    function getActiveChequesByRecipient(address _recipient) public view returns (uint256[] memory){
        return activeChequesByRecipient[_recipient];
    }

    function getRecipientByChequeId(uint256 _chequeId) public view returns (address) {
        return ownerOf(_chequeId);
    }

    function getAmountByChequeId(uint256 _chequeId) public view returns (uint256) {
        return chequeRepo[_chequeId].amount;
    }

    function getChequesByIssuer(address _issuer) public view returns (uint256[] memory) {
        return chequesByIssuer[_issuer];
    }

    function getActiveChequesByIssuer(address _issuer) public view returns (uint256[] memory) {
        return activeChequesByIssuer[_issuer];
    }

    function getIssuerByChequeId(uint256 _chequeId) public view returns (address) {
        return chequeRepo[_chequeId].issuer;
    }

    function getChildCheques(uint256 _chequeId) public view returns (uint256[] memory) {
        return parentToChildren[_chequeId];
    }

    function _simpleWithdraw(uint256 _chequeId) internal {
        uint256 amount = chequeRepo[_chequeId].amount;
        chequeRepo[_chequeId].state = ChequeState.CASHED;

        address issuer = chequeRepo[_chequeId].issuer;
        pesosArgentinosToken.transferFrom(issuer, ownerOf(_chequeId), amount);
        _mapCashedCheque(_chequeId);

        emit Cashed(_chequeId, ownerOf(_chequeId), amount);
        _burn(_chequeId);
    }

    function _certifiedWithdraw(uint256 _chequeId) internal {
        uint256 amount = chequeRepo[_chequeId].amount;
        chequeRepo[_chequeId].state = ChequeState.CASHED;

        pesosArgentinosToken.transferFrom(address(this), ownerOf(_chequeId), amount);
        _mapCashedCheque(_chequeId);

        emit Cashed(_chequeId, ownerOf(_chequeId), amount);
        _burn(_chequeId);
    }

    function _splitWithdraw(uint256 _chequeId) internal {
        ChequeInfo storage cheque = chequeRepo[_chequeId];
        uint256 amount = cheque.amount;
        uint256[] memory children = parentToChildren[_chequeId];

        _simpleWithdraw(_chequeId);
        for(uint i = 0; i < children.length; i++){
            ChequeState _state = chequeRepo[children[i]].state;
            if(_state == ChequeState.EMITTED || _state == ChequeState.ACCEPTED) _simpleWithdraw(children[i]);
        }

        emit Cashed(_chequeId, ownerOf(_chequeId), amount);
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

        return chequeId;
    }

    function _acceptEmitted(uint256 _chequeId) internal {
        chequeRepo[_chequeId].state = ChequeState.ACCEPTED;
    }

    function _acceptTransfer(uint256 _chequeId) internal {
        if(chequeRepo[_chequeId].state == ChequeState.EMITTED){
            chequeRepo[_chequeId].state = ChequeState.ACCEPTED;   
        }
        safeTransferFrom(ownerOf(_chequeId), potentialOwner[_chequeId], _chequeId);
    }

    /*function _mapNewCheque(uint256 _chequeId, address _issuer, address _recipient) internal virtual {
        chequesByRecipient[_recipient].push(_chequeId);
        chequesByIssuer[_issuer].push(_chequeId);
        activeChequesByRecipient[_recipient].push(_chequeId);
        activeChequesByIssuer[_issuer].push(_chequeId);
    }*/

    function _mapIssuedCheque(uint256 _chequeId, address _issuer, address _to) internal virtual {
        chequesByIssuer[_issuer].push(_chequeId);
        activeChequesByIssuer[_issuer].push(_chequeId);
        potentialCheques[_to].push(_chequeId);
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
        address recipient = ownerOf(_chequeId);
        address issuer = chequeRepo[_chequeId].issuer;
        require(activeChequesByRecipient[recipient].removeValue(_chequeId),"El cheque no se encuentra activo");
        require(activeChequesByIssuer[issuer].removeValue(_chequeId),"El cheque no se encuentra activo");
    }

}


