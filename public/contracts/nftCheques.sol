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

    enum ChequeType { Simple, Certified, Deferred }

    struct ChequeInfo {
        uint256 chequeId;
        address issuer;
        //address recipient;
        uint256 amount;
        uint32 dateFrom;
        bool isCashed;
        bool isCertified;
    }

    //INFORMACIÓN GENERAL DE CHEQUES
    mapping(uint256 => ChequeInfo) public chequeRepo;
    mapping(address => uint256[]) private chequesByRecipient;
    mapping(address => uint256[]) private chequesByIssuer;
    mapping(address => uint256[]) private activeChequesByIssuer;
    mapping(address => uint256[]) private activeChequesByRecipient;

    //PARA CHEQUES DIVIDIDOS
    mapping(uint256 => uint256) private childToParent;
    mapping(uint256 => uint256[]) private parentToChildren;
    mapping(uint256 => uint256) private availableChequeValue;


    event Minted(uint256 indexed chequeId, address indexed to, uint256 amount);
    event Withdrawn(uint256 indexed chequeId, address indexed to, uint256 amount);
    event Split(uint256 indexed parentChequeId, uint256 indexed childChequeId, address indexed to, uint256 amount);

    constructor(address _pesosArgentinosToken) ERC721("Crypto Cheques", "cCheq") {
        pesosArgentinosToken = IERC20(_pesosArgentinosToken);
    }

    modifier onlyChequeHolder(uint256 _chequeId) {
        require(ownerOf(_chequeId) == msg.sender, "Solo el titular del cheque puede realizar esta accion.");
        _;
    }

    modifier onlyValidCheque(uint256 _chequeId) {
        require(!chequeRepo[_chequeId].isCashed, "El cheque ya fue cobrado");
        require(chequeRepo[_chequeId].dateFrom + 30 days > block.timestamp, "Cheque vencido");
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

        uint256 chequeId = _totalCheques + 1;
        _totalCheques = chequeId;

        _safeMint(_recipient, chequeId);

        chequeRepo[chequeId] = ChequeInfo(
                                chequeId
                                ,msg.sender
                                ,_amount
                                ,_deferralSeconds + uint32(block.timestamp)
                                ,false
                                ,_isCertified);
        availableChequeValue[chequeId] = _amount;
        _mapNewCheque(chequeId, msg.sender, _recipient);

        emit Minted(chequeId, _recipient, _amount);
    }

    /*function splitCheque(uint256 _chequeId, uint256[] memory _amounts) public onlyChequeHolder(_chequeId) onlyValidCheque(_chequeId) {
        require(!chequeRepo[_chequeId].isCertified, "No se puede dividir un cheque certificado");
        uint256 total = 0;

        for (uint256 i = 0; i < _amounts.length; i++) {
            total += _amounts[i];
        }
        require(total == chequeRepo[_chequeId].amount, "La suma de las partes debe ser igual a la cantidad total del cheque");
        
        for (uint256 i = 0; i < _amounts.length; i++) {
            mint(chequeRepo[_chequeId].chequeType, chequeRepo[_chequeId].recipient, _amounts[i], chequeRepo[_chequeId].cashDate);
            chequeRepo[_chequeId].childCheques.push(_totalCheques);
        }
        
        _burn(_chequeId);
        emit Split(_chequeId, chequeRepo[_chequeId].childCheques);
    }*/

    function splitCheque(uint256 _parentId, uint256 _amount, address _recipient) public onlyChequeHolder(_parentId) onlyValidCheque(_parentId) validateChequeHeader(_recipient, _amount){
        ChequeInfo memory parentCheque = chequeRepo[_parentId];
        require(!parentCheque.isCertified, "No se puede dividir un cheque certificado");
        require(availableChequeValue[_parentId] >= _amount, "Saldo insuficiente");

        uint256 childId = _parameterizedMint(msg.sender, _recipient, _amount, parentCheque.dateFrom, false);

        _mapSplitCheque(_parentId, childId, msg.sender, _recipient);
        availableChequeValue[_parentId] -= _amount;
        emit Split(_parentId, childId, _recipient, _amount);

    }

    function transfer(address to, uint256 _chequeId) public onlyChequeHolder(_chequeId) {
        safeTransferFrom(msg.sender, to, _chequeId);
    }

    function withdraw(uint256 _chequeId) public onlyChequeHolder(_chequeId) onlyValidCheque(_chequeId) {
        require(chequeRepo[_chequeId].dateFrom <= block.timestamp, "No se ha iniciado el periodo de cobro del cheque");
        if(parentToChildren[_chequeId].length == 0){
            _simpleWithdraw(_chequeId);
        } else {
            _splitWithdraw(_chequeId);
        }
    }

    function isChequeValid(uint256 _chequeId) public view returns (bool) {
        return (chequeRepo[_chequeId].amount != 0 && !chequeRepo[_chequeId].isCashed);
    }

    function totalCheques() public view returns (uint256) {
        return _totalCheques;
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
        chequeRepo[_chequeId].isCashed = true;

        address issuer = chequeRepo[_chequeId].issuer;
        pesosArgentinosToken.transferFrom(issuer, ownerOf(_chequeId), amount);
        _mapCashedCheque(_chequeId);

        emit Withdrawn(_chequeId, msg.sender, amount);
        _burn(_chequeId);
    }

    function _splitWithdraw(uint256 _chequeId) internal {
        ChequeInfo storage cheque = chequeRepo[_chequeId];
        uint256 amount = cheque.amount;
        uint256[] memory children = parentToChildren[_chequeId];

        _simpleWithdraw(_chequeId);
        for(uint i = 0; i < children.length; i++){
            //if(!chequeRepo[_chequeId].isCashed) _simpleWithdraw(children[i]);
        }

        emit Withdrawn(_chequeId, msg.sender, amount);
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
                                ,false
                                ,_isCertified
                                );
        availableChequeValue[chequeId] = _amount;

        return chequeId;
    }

    function _mapNewCheque(uint256 _chequeId, address _issuer, address _recipient) internal virtual {
        chequesByRecipient[_recipient].push(_chequeId);
        chequesByIssuer[_issuer].push(_chequeId);
        activeChequesByRecipient[_recipient].push(_chequeId);
        activeChequesByIssuer[_issuer].push(_chequeId);
    }

    function _mapSplitCheque(uint256 _parentId, uint256 _childId, address _issuer, address _recipient) internal virtual{
        parentToChildren[_parentId].push(_childId);
        childToParent[_childId] = _parentId;
        _mapNewCheque(_childId, _issuer, _recipient);
    }

    function _mapCashedCheque(uint256 _chequeId) internal virtual{
        address recipient = ownerOf(_chequeId);
        address issuer = chequeRepo[_chequeId].issuer;
        require(activeChequesByRecipient[recipient].removeValue(_chequeId),"El cheque no se encuentra activo");
        require(activeChequesByIssuer[issuer].removeValue(_chequeId),"El cheque no se encuentra activo");
    }

}


