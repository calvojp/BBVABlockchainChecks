import React, { useState, useEffect } from 'react';
import './ChequeEmitter.scss';
import Swal from 'sweetalert2';
import { nftChequeAbi, nftChequeAddress, connectMetaMask } from '../../web3Config';
import { Contract } from '@ethersproject/contracts';
import { Stepper, Step, StepLabel, Button, TextField } from '@mui/material';

const steps = ['Emitir Cheque', 'Revisar datos', 'Confirmar'];

const ChequeEmitter = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [nftChequeContract, setNftChequeContract] = useState(null);
  const [erc20TokenContract, setErc20TokenContract] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const init = async () => {
      const { provider, signer, account, nftChequeContract, erc20TokenContract } = await connectMetaMask();
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setNftChequeContract(nftChequeContract);
      setErc20TokenContract(erc20TokenContract);
    };
    init();
  }, []);

  const handleNext = () => {
    if (activeStep === 0 && (recipient === '' || amount === '')) {
      Swal.fire({
        icon: 'error',
        title: 'Datos incompletos.',
        text: 'Por favor, completa todos los campos antes de avanzar.',
      });
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const emitCheque = async (e) => {
    e.preventDefault();
    if (!nftChequeContract || !provider || !erc20TokenContract || !signer) {
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

      const tokenAmount = amount * 10 ** 2;
      await erc20TokenContract.approve(nftChequeContract.address, tokenAmount);

      await nftChequeContract.mint(recipient, tokenAmount);

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

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="step-content">
            <TextField 
              className="input"
              label="Dirección del receptor"
              variant="outlined"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <TextField 
              className="input"
              label="Monto en pesos"
              variant="outlined"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button className="button" variant="contained" color="primary" onClick={handleNext}>
              Siguiente
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <p>
              Receptor: {recipient}
            </p>
            <p>
              Monto: ${amount}
            </p>
            <Button className="button" variant="contained" color="primary" onClick={handleBack}>
              Atrás
            </Button>
            <Button className="button" variant="contained" color="primary" onClick={handleNext}>
              Siguiente
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="step-content">      
            <p>¿Estás seguro de que quieres emitir un cheque por AR${amount}?</p>               
            <p>Receptor: {recipient}</p>            
            <Button className="button" variant="contained" color="primary" onClick={handleBack}>
              Atrás
            </Button>
            <Button className="button" variant="contained" color="primary" onClick={emitCheque}>
              Sí, emitir cheque
            </Button>
          </div>
        );
      default:
        return 'Unknown stepIndex';
    }
  }

  return (
    <div className="ChequeEmitter">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {getStepContent(activeStep)}
    </div>
  );
};

export default ChequeEmitter;
             
