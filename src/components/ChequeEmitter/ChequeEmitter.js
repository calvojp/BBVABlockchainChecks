import React, { useState, useEffect } from 'react';
import './ChequeEmitter.scss';
import Swal from 'sweetalert2';
import { nftChequeAbi, nftChequeAddress, erc20TokenAddress, erc20TokenAbi,  connectMetaMask, decryptWallet, connectWalletToProvider, getContract} from '../../web3Config';
import { Contract } from '@ethersproject/contracts';
import { Stepper, Step, StepLabel, Button, TextField } from '@mui/material';
import { ethers } from 'ethers';



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
      // const { provider, signer, account, nftChequeContract, erc20TokenContract } = await connectMetaMask();
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


const encryptedJson = "{\"address\":\"629461dbe54adc844d373d5ea2e5546548d827a3\",\"id\":\"53bd07c2-03d7-462e-ba0b-0f81da23203b\",\"version\":3,\"Crypto\":{\"cipher\":\"aes-128-ctr\",\"cipherparams\":{\"iv\":\"f528ffc34ba720e4320d2fc8e228acc1\"},\"ciphertext\":\"882f53274c5522ba9942588bf55efa50efca3b3f3efac439f2ca0e17e701be50\",\"kdf\":\"scrypt\",\"kdfparams\":{\"salt\":\"d0d399ac3605ef89d4f407de67766be3f0053eb3160a94d53d4453e5e4c8ed22\",\"n\":131072,\"dklen\":32,\"p\":1,\"r\":8},\"mac\":\"5a4e49be725aa7b3b507fb5486642b25fbe7809e5b57022b843c9586d479b8cf\"},\"x-ethers\":{\"client\":\"ethers/6.3.0\",\"gethFilename\":\"UTC--2023-05-19T04-24-37.0Z--629461dbe54adc844d373d5ea2e5546548d827a3\",\"path\":\"m/44'/60'/0'/0/0\",\"locale\":\"en\",\"mnemonicCounter\":\"69b115cb12cfb0689da4f21e5676981e\",\"mnemonicCiphertext\":\"c1de85666bbf189b73a03c160009a5b6\",\"version\":\"0.1\"}}"


const emitCheque = async (e) => {
    e.preventDefault();
    try {
        const { value: password } = await Swal.fire({
            title: 'Ingresa tu contraseña para confirmar la transacción',
            input: 'password',
            inputPlaceholder: 'Contraseña',
            inputAttributes: {
              autocapitalize: 'off',
              autocorrect: 'off'
            }
        });

        if (!password) {
            Swal.fire('Necesitas proporcionar una contraseña para continuar!');
            return;
        }

        Swal.fire({
            title: "Emitiendo cheque...",
            text: "Por favor espera",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            },
        });

        const wallet = await decryptWallet(encryptedJson, password);
        if (!wallet) {
            throw new Error("Error al desencriptar el monedero");
        }

        console.log("esta es la wallet", wallet)
        


        const signer = connectWalletToProvider(wallet, 'https://api.avax-test.network/ext/bc/C/rpc'); 
        const nftChequeContract = getContract(nftChequeAddress, nftChequeAbi, signer);
        const erc20TokenContract = getContract(erc20TokenAddress, erc20TokenAbi, signer);
        


        console.log("contrato nft funcion: ", nftChequeContract)
        console.log("contrato erc20: ", erc20TokenContract)

        const tokenAmount = amount * 10 ** 2
        await erc20TokenContract.approve(nftChequeContract.address, tokenAmount);
        await nftChequeContract.mint(recipient, tokenAmount);

        Swal.close();
        Swal.fire(
            'Finalizado',
            `Cheque por AR$${amount} emitido con éxito.`,
            'success'
        );

        setActiveStep(0);
        setRecipient('');
        setAmount('');

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en emisión del cheque.',
            text: 'Algo salió mal',
            footer: '<a href="">Por qué tengo este problema?</a>'
        });

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
             
