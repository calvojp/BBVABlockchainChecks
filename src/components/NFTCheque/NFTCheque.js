import React, { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import './NFTCheque.scss';
import { nftChequeAbi, nftChequeAddress, connectMetaMask } from '../../web3Config';

export const NFTCheque = () => {
  const [account, setAccount] = useState(null);
  const [nftChequeContract, setNftChequeContract] = useState(null);
  const [totalCheques, setTotalCheques] = useState(0);

  const initializeMetaMask = async () => {
    const { ethersInstance, account, nftChequeContract } = await connectMetaMask();
    setAccount(account);
    setNftChequeContract(nftChequeContract);
  };

  const updateTotalCheques = async (contract) => {
    const total = await contract.totalCheques();
    console.log("total", total);
    setTotalCheques(total.toString()); // Convert BigNumber to string
  };

  useEffect(() => {
    initializeMetaMask();
  }, []);

  useEffect(() => {
    if (nftChequeContract) {
      updateTotalCheques(nftChequeContract);
    }
  }, [nftChequeContract]);

  return (
    <div className="nft-cheque">
      <h2>Total Cheques</h2>
      <div className="total-cheques">
        <span>{totalCheques}</span>
      </div>
    </div>
  );
};

