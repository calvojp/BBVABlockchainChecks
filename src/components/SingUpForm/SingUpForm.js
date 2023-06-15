import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import { Wallet } from '@ethersproject/wallet';
import Swal from 'sweetalert2';
import './SingUpForm.scss';
import { MaxUint256 } from '@ethersproject/constants';
import { parseEther } from '@ethersproject/units';
import { nftChequeAbi, nftChequeAddress, erc20TokenAddress, erc20TokenAbi, decryptWallet, connectWalletToProvider, getContract} from '../../web3Config';
import { mnemonicToSeed } from '@ethersproject/hdnode';

function SignUpForm({ open, onClose, closeForm }) {
  const [formValues, setFormValues] = useState({
    dni: "",
    nombre: "",
    cbu: "",
    address: "",
    username: "",
    password: "",
    encryptedMnemonic: "",
  });

  useEffect(() => {
    const generateCBU = () => {
      let cbu = '';
      for(let i = 0; i < 22; i++) {
        cbu += Math.floor(Math.random() * 10);
      }
      return cbu;
    };

    setFormValues(prevState => ({...prevState, cbu: generateCBU()}));
  }, []);

  const handleChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    onClose();

    Swal.fire({
      title: "Creando cuenta",
      text: "Por favor espera",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
          Swal.showLoading();
      },
  });

    const wallet = Wallet.createRandom();

    formValues.address = wallet.address;

    const encryptedWallet = await wallet.encrypt(formValues.password);
    formValues.encryptedMnemonic = encryptedWallet;


    try {
      const existingPrivateKey = "0xbaa13c551a7896d6da63cea744ab54bc789066ea609b553d010939609767dcb0";
      const existingWallet = new Wallet(existingPrivateKey);
      const providerUrl = 'https://api.avax-test.network/ext/bc/C/rpc';
      const signer = connectWalletToProvider(existingWallet, providerUrl);
      const amountToSend = parseEther("0.2");

      await signer.sendTransaction({
        to: wallet.address,
        value: amountToSend
      });

      const walletDecrypted = await decryptWallet(encryptedWallet, formValues.password);

      if (!walletDecrypted) {
          throw new Error("Error al desencriptar el monedero");
      }

      const newSigner = connectWalletToProvider(walletDecrypted, providerUrl); 
      const erc20TokenContract = getContract(erc20TokenAddress, erc20TokenAbi, newSigner);

      await erc20TokenContract.approve(nftChequeAddress, MaxUint256);
      const response = await axios.post('http://localhost:5000/signup', formValues);

      if (response.data.status === "success") {
        Swal.close();
        Swal.fire(
            `Bienvenido ${formValues.nombre}`,
            `Cuenta creada correctamente`,
            'success'
          );
      } else {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error.',
            text: 'Nombre de usuario ya en uso.',
            footer: '<a href="">Por qué tengo este problema?</a>'
          });
        console.error("Error al crear la cuenta:", response.data.message);
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error.',
        text: 'Error al crear la cuenta',
        footer: '<a href="">Por qué tengo este problema?</a>'
      });
      console.error("Error al enviar la petición al servidor:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Crear Cuenta</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className="signUpForm">
          <TextField fullWidth label="DNI" name="dni" value={formValues.dni} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Nombre" name="nombre" value={formValues.nombre} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="CBU" name="cbu" value={formValues.cbu} disabled margin="normal" />
          <TextField fullWidth label="Nombre de usuario" name="username" value={formValues.username} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Contraseña" name="password" type="password" value={formValues.password} onChange={handleChange} margin="normal" />
          <Button type="submit" variant="contained" color="primary" className="submitButton">Crear cuenta</Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="closeButton">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SignUpForm;




// import React, { useState, useEffect } from 'react';
// import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
// import axios from 'axios';
// import { ethers } from 'ethers';
// import Swal from 'sweetalert2';
// import './SingUpForm.scss';
// import { MaxUint256 } from '@ethersproject/constants';
// import { nftChequeAbi, nftChequeAddress, erc20TokenAddress, erc20TokenAbi, decryptWallet, connectWalletToProvider, getContract} from '../../web3Config';



// function SignUpForm({ open, onClose }) {
//   const [formValues, setFormValues] = useState({
//     dni: "",
//     nombre: "",
//     cbu: "",
//     address: "",
//     username: "",
//     password: "",
//     encryptedMnemonic: "",
//   });

//   // Generamos un CBU aleatorio cuando el componente se monta
//   useEffect(() => {
//     const generateCBU = () => {
//       let cbu = '';
//       for(let i = 0; i < 22; i++) {
//         cbu += Math.floor(Math.random() * 10); // genera un dígito aleatorio entre 0 y 9
//       }
//       return cbu;
//     };

//     setFormValues(prevState => ({...prevState, cbu: generateCBU()}));
//   }, []);

//   const handleChange = (event) => {
//     setFormValues({
//       ...formValues,
//       [event.target.name]: event.target.value,
//     });
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     // Generamos la wallet
//     const wallet = ethers.Wallet.createRandom();

//     // Actualizamos los valores del formulario con la dirección
//     formValues.address = wallet.address;

//     // Encriptamos la frase mnemónica y la asignamos al campo correspondiente
//     const encryptedWallet = await wallet.encrypt(formValues.password);
//     formValues.encryptedMnemonic = encryptedWallet;

//     try {

//       const walletDecrypted = await decryptWallet(encryptedWallet, formValues.password);
//         if (!wallet) {
//             throw new Error("Error al desencriptar el monedero");
//         }

//       const signer = connectWalletToProvider(walletDecrypted, 'https://api.avax-test.network/ext/bc/C/rpc'); 
//       console.log(signer)
//       console.log(erc20TokenAddress)
//       console.log(erc20TokenAbi)
//       const erc20TokenContract = getContract(erc20TokenAddress, erc20TokenAbi, signer);
//       console.log("pase el erx20 contract")
      

//       await erc20TokenContract.approve(nftChequeAddress, MaxUint256);
//       const response = await axios.post('http://localhost:5000/signup', formValues);

//       if (response.data.status === "success") {

//         Swal.fire(
//             `Bienvenido ${formValues.nombre}`,
//             `Cuenta creada correctamente`,
//             'success'
//           );

        
//         onClose();


//       } else {
//         Swal.fire({
//             icon: 'error',
//             title: 'Error.',
//             text: 'Nombre de usuario ya en uso.',
//             footer: '<a href="">Por qué tengo este problema?</a>'
//           })
//           onClose();
//         console.error("Error al crear la cuenta:", response.data.message);
//       }
//     } catch (error) {
//       console.error("Error al enviar la petición al servidor:", error);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>Crear Cuenta</DialogTitle>
//       <DialogContent>
//         <form onSubmit={handleSubmit} className="signUpForm">
//           <TextField fullWidth label="DNI" name="dni" value={formValues.dni} onChange={handleChange} margin="normal" />
//           <TextField fullWidth label="Nombre" name="nombre" value={formValues.nombre} onChange={handleChange} margin="normal" />
//           <TextField fullWidth label="CBU" name="cbu" value={formValues.cbu} disabled margin="normal" />
//           <TextField fullWidth label="Nombre de usuario" name="username" value={formValues.username} onChange={handleChange} margin="normal" />
//           <TextField fullWidth label="Contraseña" name="password" type="password" value={formValues.password} onChange={handleChange} margin="normal" />
//           <Button type="submit" variant="contained" color="primary" className="submitButton">Crear cuenta</Button>
//         </form>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} className="closeButton">Cerrar</Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// export default SignUpForm;


