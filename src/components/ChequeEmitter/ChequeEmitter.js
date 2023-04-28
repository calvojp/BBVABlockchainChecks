import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import './ChequeEmitter.scss';
import Swal from 'sweetalert2';
import { nftChequeAbi, nftChequeAddress, connectMetaMask } from '../../web3Config';

const ChequeEmitter = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [nftChequeContract, setNftChequeContract] = useState(null);
  const [erc20TokenContract, setErc20TokenContract] = useState(null); // Agregar esto
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const init = async () => {
      const { web3Instance, account, nftChequeContract, erc20TokenContract } = await connectMetaMask();
      setWeb3(web3Instance);
      setAccount(account);
      setNftChequeContract(nftChequeContract);
      setErc20TokenContract(erc20TokenContract); // Agregar esto
    };
    init();
  }, []);

  const emitCheque = async (e) => {
    e.preventDefault();
    if (!nftChequeContract || !web3 || !erc20TokenContract) {
      Swal.fire({
        icon: 'error',
        title: 'Error.',
        text: 'Recuerda conectarte a METAMASK antes.',
        footer: '<a href="">Por qué tengo este problema?</a>'
      })
      return;
    }
    try {
      Swal.fire({
        title: "Emitiendo cheque...",
        text: "Por favor acepta la transacción en MetaMask",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      // Llamar a la función 'approve' del contrato ERC20 antes de emitir el cheque
      const tokenAmount = amount * 10 ** 2;
      //descomentar
      // await erc20TokenContract.methods.approve(nftChequeContract.options.address, tokenAmount).send({ from: account });

      // Emitir el cheque
      await nftChequeContract.methods.mint(recipient, tokenAmount).send({ from: account });

      Swal.close();

      Swal.fire(
        'Finalizado',
        `Cheque por AR$${amount} emitido con éxito.`,
        'success'
      );
      console.log("Se emitio el cheque con exito, destinatario: ", recipient)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error en emisión del cheque.',
        text: 'Algo salió mal',
        footer: '<a href="">Por qué tengo este problema?</a>'
      })

      console.log(error)
    }
  };

  useEffect(() => {
    connectMetaMask();
  }, []);


  return (
    <div className="ChequeEmitter">
      <form className="form" onSubmit={emitCheque}>
        <h2>Emitir Cheque</h2>
        <input
          className="input"
          type="text"
          placeholder="Dirección del receptor"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          className="input"
          type="number"
          placeholder="Monto en pesos"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="button" type="submit">
          Emitir Cheque
        </button>
      </form>
    </div>
  );
};

export default ChequeEmitter;
