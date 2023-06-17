import React, { useState, useEffect } from 'react';
import { nftChequeAbi, nftChequeAddress, erc20TokenAddress, erc20TokenAbi,  connectMetaMask, decryptWallet, connectWalletToProvider, getContract} from '../../web3Config';
import './ChequesList.scss';
import Swal from 'sweetalert2';
import axios from 'axios';
import { JsonRpcProvider } from '@ethersproject/providers';


const ChequesList = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [searchAddress, setSearchAddress] = useState('');
    const [nftChequeContract, setNftChequeContract] = useState(null);
    const [erc20TokenContract, setErc20TokenContract] = useState(null);
    const [cheques, setCheques] = useState([]);
    const [sessionData, setSessionData] = useState(null);
    const [account, setAccount] = useState('');
  
    useEffect(() => {

      const init = async () => {
        // const { provider, signer, account, nftChequeContract, erc20TokenContract } = await connectMetaMask();
        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setNftChequeContract(nftChequeContract);
        setErc20TokenContract(erc20TokenContract);
      };


      const getSessionData = async () => {
        try {
          const response = await axios.get("http://RamiroPeidro.pythonanywhere.com/session_data", { withCredentials: true });
          setSessionData(response.data);
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error obteniendo datos de la sesion',
            text: 'Por favor, intenta iniciar sesión de nuevo.',
          });
        }
      };

      init();
      getSessionData();
    }, []);
  

    const handleReset = () => {
        setSearchAddress('');
        setCheques([]);
      };


      const handleSearch = async (e) => {
        e.preventDefault();
      
        if (!sessionData) {
          Swal.fire({
            icon: 'error',
            title: 'Error en búsqueda.',
            text: 'Los datos de la sesión no están disponibles. Intenta iniciar sesión de nuevo.',
          });
          return;
        }
        const account = sessionData.address;

        try {
          const provider = new JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
          const nftChequeContract = getContract(nftChequeAddress, nftChequeAbi, provider) 
          const chequeIds = await nftChequeContract.getChequesByRecipient(account);
          
          console.log(chequeIds)
          
          if (chequeIds.length <= 0) {

            Swal.fire({
              icon: 'error',
              title: 'Nada por aquí.',
              text: 'No hay cheques a tu nombre.',
              footer: '<a href="">Por qué tengo este problema?</a>'
            });
            return;
          }
          
          const chequesData = await Promise.all(
            chequeIds.map(async (chequeId) => {
              const amount = await nftChequeContract.getAmountByChequeId(chequeId);
      
              return {
                id: chequeId.toString(),
                amount,
              };
            })
          );
      
          setCheques(chequesData);
        } catch (error) {
          console.error(error);
          Swal.fire({
              icon: 'error',
              title: 'Error.',
              text: 'No se encontro ningun cheque relacionado a esa dirección',
              footer: '<a href="">Por qué tengo este problema?</a>'
          });
        }
      };  

  
    const handleWithdraw = async (chequeId) => {
      try {
        Swal.fire({
          title: "Retirando cheque...",
          text: "Por favor acepta la transacción en MetaMask",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const tx = await nftChequeContract.withdraw(chequeId);
        await tx.wait();

        Swal.close();

        Swal.fire(
          'Finalizado',
          `Cheque retirado con éxito.`,
          'success'
        );

      } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error.',
            text: 'Error al retirar los fondos. Recordá aceptar la transacción en Metamask',
            footer: '<a href="">Por qué tengo este problema?</a>'
        });
      }
    };

  
    return (
      <div className="ChequesList">
        <form className="form" onSubmit={handleSearch}>
          <h2>Mis cheques</h2>

          {/* <input
            className="input"
            type="text"
            placeholder="Dirección de búsqueda"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          /> */}

          <div className="form-buttons">
            <button className="button" type="submit">
              Consultar
            </button>
            {/* <button className="button reset-button" type="button" onClick={handleReset}>
              Reiniciar
            </button> */}
          </div>
        </form>
        <div className="cheque-cards">
          {cheques.map((cheque) => (
            <div key={cheque.id} className="cheque-card">
              <div className="cheque-header">
                <h3>Cheque</h3>
                <h4>ID: {cheque.id}</h4>
              </div>
              <div className="cheque-body">
                <p>
                  {/* Importe: <span>{web3.utils.fromWei(cheque.amount, 'ether')} AR$</span> */}
                  AR$ <span>{cheque.amount / (10 ** 2)}</span>
                </p>
              </div>
              <div className="cheque-footer">
                {cheque.amount > 0 ? (
                  <button
                    className="button withdraw-button"
                    onClick={() => handleWithdraw(cheque.id)}
                  >
                    Cobrar fondos
                  </button>
                ) : (
                  <button className="button withdrawn-button" disabled>
                    Cheque cobrado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    
    };
    
    export default ChequesList;
  
