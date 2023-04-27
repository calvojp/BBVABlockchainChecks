import React, { useState, useEffect } from 'react';
import './ChequeWithdraw.scss';
import Swal from 'sweetalert2';
import { nftChequeAbi, nftChequeAddress, connectMetaMask } from '../../web3Config';

const ChequeWithdraw = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [nftChequeContract, setNftChequeContract] = useState(null);
  const [chequeId, setChequeId] = useState('');

  const initializeMetaMask = async () => {
    const { web3Instance, account, nftChequeContract } = await connectMetaMask();
    setWeb3(web3Instance);
    setAccount(account);
    setNftChequeContract(nftChequeContract);
  };

  const verifyAndWithdraw = async (e) => {
    e.preventDefault();
    if (!nftChequeContract || !web3) {
      alert('Por favor, conecta a MetaMask primero');
      return;
    }

    try {
      const chequeRecipient = await nftChequeContract.methods
        .getAdressByChequeId(chequeId)
        .call({ from: account });

        console.log("account: ", account)
        console.log("chequeRecipient", chequeRecipient)

      if (chequeRecipient.toLowerCase() !== account.toLowerCase()) {
        Swal.fire({
          icon: 'error',
          title: 'No puedes retirar este cheque',
          text: 'Unicamente el beneficiario del cheque puede retirarlo',
        });
        return;
      }

      await nftChequeContract.methods.withdraw(chequeId).send({ from: account });
      Swal.fire('Finalizado', 'Fondos retirados con éxito.', 'success');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al retirar los fondos',
        text: 'Algo salió mal',
        footer: '<a href="">Por qué tengo este problema?</a>',
      });
      console.log(error);
    }
  };

  useEffect(() => {
    initializeMetaMask();
  }, []);

  return (
    <div className="ChequeWithdraw">
      <form className="form" onSubmit={verifyAndWithdraw}>
        <h2>Retirar Cheque</h2>
        <input
          className="input"
          type="number"
          placeholder="ID del cheque"
          value={chequeId}
          onChange={(e) => setChequeId(e.target.value)}
        />
        <button className="button" type="submit">
          Retirar Fondos
        </button>
      </form>
    </div>
  );
};

export default ChequeWithdraw;
