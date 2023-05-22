// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTCheque is ERC721, Ownable {
    uint256 private _totalCheques;
    IERC20 public pesosArgentinosToken;

    enum ChequeType { Simple, Certified, Deferred }

    struct ChequeIn/fo {
        address payable recipient;
        uint256 amount;
        address issuer;
        ChequeType chequeType;
        bool isCashed;
        uint256 cashDate;
        uint256[] childCheques;
    }

    mapping(uint256 => ChequeInfo) public chequeInfo;

    event Minted(uint256 indexed chequeId, address indexed to, uint256 amount);
    event Withdrawn(uint256 indexed chequeId, address indexed to, uint256 amount);
    event Split(uint256 indexed parentChequeId, uint256[] indexed childChequeIds);

    constructor(address _pesosArgentinosToken) ERC721("NFTCheque", "NFTC") {
        pesosArgentinosToken = IERC20(_pesosArgentinosToken);
    }

    modifier onlyChequeHolder(uint256 _chequeId) {
        require(ownerOf(_chequeId) == msg.sender, "Solo el titular del cheque puede realizar esta accion.");
        _;
    }

    function mint(ChequeType _chequeType, address recipient, uint256 _amount, uint256 _cashDate) public {
        require(recipient != address(0), "El destinatario no puede ser la direccion cero.");
        require(_amount > 0, "La cantidad debe ser mayor que 0.");
        require(_chequeType != ChequeType.Deferred || (_chequeType == ChequeType.Deferred && _cashDate > block.timestamp), "La fecha de cobro debe ser futura para un cheque diferido");

        uint256 chequeId = _totalCheques + 1;
        _totalCheques = chequeId;

        _safeMint(recipient, chequeId);
        chequeInfo[chequeId] = ChequeInfo(payable(recipient), _amount, msg.sender, _chequeType, false, _cashDate, new uint256[](0));

        emit Minted(chequeId, recipient, _amount);
    }

    function splitCheque(uint256 _chequeId, uint256[] memory _amounts) public onlyChequeHolder(_chequeId) {
        require(!chequeInfo[_chequeId].isCashed, "El cheque ya fue cobrado");
        require(chequeInfo[_chequeId].chequeType != ChequeType.Certified, "No se puede dividir un cheque certificado");
        uint256 total = 0;

        for (uint i = 0; i < _amounts.length; i++) {
            total += _amounts[i];
        }
        require(total == chequeInfo[_chequeId].amount, "La suma de las partes debe ser igual a la cantidad total del cheque");
        
        for (uint i = 0; i < _amounts.length; i++) {
            mint(chequeInfo[_chequeId].chequeType, chequeInfo[_chequeId].recipient, _amounts[i], chequeInfo[_chequeId].cashDate);
            chequeInfo[_chequeId].childCheques.push(_totalCheques);
        }
        
        _burn(_chequeId);
        emit Split(_chequeId, chequeInfo[_chequeId].childCheques);
    }

    function transfer(address to, uint256 _chequeId) public onlyChequeHolder(_chequeId) {
        safeTransferFrom(msg.sender, to, _chequeId);
    }

    function withdraw(uint256 _chequeId) public {
        require(chequeInfo[_chequeId].amount != 0, "Este cheque no tiene un NFT asociado.");
        require(msg.sender == chequeInfo[_chequeId].recipient, "Solo el destinatario del cheque puede retirar fondos.");
        require(!chequeInfo[_chequeId].isCashed, "El cheque ya fue cobrado");
        require(chequeInfo[_chequeId].chequeType != ChequeType.Deferred || (chequeInfo[_chequeId].chequeType == ChequeType.Deferred && block.timestamp >= chequeInfo[_chequeId].cashDate), "No se puede cobrar un cheque diferido antes de la fecha de cobro");

        uint256 amount = chequeInfo[_chequeId].amount;
        chequeInfo[_chequeId].amount = 0;
        chequeInfo[_chequeId].isCashed = true;

        address issuer = chequeInfo[_chequeId].issuer;
        pesosArgentinosToken.transferFrom(issuer, chequeInfo[_chequeId].recipient, amount);

        _burn(_chequeId);

        emit Withdrawn(_chequeId, chequeInfo[_chequeId].recipient, amount);
    }

    function isChequeValid(uint256 _chequeId) public view returns (bool) {
        return (chequeInfo[_chequeId].amount != 0 && !chequeInfo[_chequeId].isCashed);
    }

    function totalCheques() public view returns (uint256) {
        return _totalCheques;
    }

    function getChequesByRecipient(address recipient) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_totalCheques);
        uint256 counter = 0;

        for (uint256 i = 1; i <= _totalCheques; i++) {
            if (chequeInfo[i].recipient == recipient) {
                result[counter] = i;
                counter++;
            }
        }

        uint256[] memory finalResult = new uint256[](counter);
        for (uint256 j = 0; j < counter; j++) {
            finalResult[j] = result[j];
        }

        return finalResult;
    }

    function getRecipientByChequeId(uint256 _chequeId) public view returns (address) {
        return chequeInfo[_chequeId].recipient;
    }

    function getAmountByChequeId(uint256 _chequeId) public view returns (uint256) {
        return chequeInfo[_chequeId].amount;
    }

    function getIssuerByChequeId(uint256 _chequeId) public view returns (address) {
        return chequeInfo[_chequeId].issuer;
    }

    function getChildCheques(uint256 _chequeId) public view returns (uint256[] memory) {
        return chequeInfo[_chequeId].childCheques;
    }
}


