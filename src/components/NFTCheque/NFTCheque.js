import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import './NFTCheque.scss';
import { nftChequeAbi, nftChequeAddress, connectMetaMask } from '../../web3Config';


export const NFTCheque = () => {
	const [web3, setWeb3] = useState(null);
	const [account, setAccount] = useState(null);
	const [nftChequeContract, setNftChequeContract] = useState(null);
	const [totalCheques, setTotalCheques] = useState(0);
  
	const initializeMetaMask = async () => {
	  const { web3Instance, account, nftChequeContract } = await connectMetaMask();
	  setWeb3(web3Instance);
	  setAccount(account);
	  setNftChequeContract(nftChequeContract);
	};
  
	const updateTotalCheques = async (contract) => {
	  const total = await contract.methods.totalCheques().call();
	  console.log("total", total);
	  setTotalCheques(total);
	};
  
	useEffect(() => {
	  if (!web3) {
		initializeMetaMask();
	  } else if (nftChequeContract) {
		updateTotalCheques(nftChequeContract);
	  }
	}, [web3, nftChequeContract]);
  
	useEffect(() => {
	  if (nftChequeContract) {
		updateTotalCheques(nftChequeContract);
	  }
	}, [nftChequeContract]);
  
	return (
	  <div className="nft-cheque">
		<h2>Total Cheques BBVA Blockchain</h2>
		<div className="total-cheques">
		  <span>{totalCheques}</span>
		</div>
	  </div>
	);
  };