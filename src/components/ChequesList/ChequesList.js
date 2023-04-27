import React, { useState, useEffect } from 'react';
import { connectMetaMask } from '../../web3Config';
import './ChequesList.scss';
import Swal from 'sweetalert2';

// ... (imports)

const ChequesList = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [nftChequeContract, setNftChequeContract] = useState(null);
    const [searchAddress, setSearchAddress] = useState('');
    const [cheques, setCheques] = useState([]);
  
    useEffect(() => {
      const init = async () => {
        const { web3Instance, account, nftChequeContract } = await connectMetaMask();
        setWeb3(web3Instance);
        setAccount(account);
        setNftChequeContract(nftChequeContract);
      };
      init();
    }, []);
  

    const handleReset = () => {
        setSearchAddress('');
        setCheques([]);
      };


    const handleSearch = async (e) => {
      e.preventDefault();
  
      if (!nftChequeContract || !web3) {
        alert('Por favor, conecta a MetaMask primero');
        return;
      }
  
      try {
        const chequeIds = await nftChequeContract.methods
          .getChequesByRecipient(searchAddress)
          .call({ from: account });

        console.log("antes del if")
        if (chequeIds.length <= 0){
          Swal.fire({
            icon: 'error',
            title: 'Error.',
            text: 'No se encontro ningun cheque relacionado a esa dirección',
            footer: '<a href="">Por qué tengo este problema?</a>'
            });
            return
          }
        
        const chequesData = await Promise.all(
          chequeIds.map(async (chequeId) => {
            const amount = await nftChequeContract.methods
              .getAmountByChequeId(chequeId)
              .call({ from: account });
  
            return {
              id: chequeId,
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
        await nftChequeContract.methods.withdraw(chequeId).send({ from: account });
        alert('Fondos retirados con éxito');
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
        <h2>Buscar cheques por dirección</h2>
        <input
          className="input"
          type="text"
          placeholder="Dirección de búsqueda"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
        <div className="form-buttons">
          <button className="button" type="submit">
            Buscar cheques
          </button>
          <button className="button reset-button" type="button" onClick={handleReset}>
            Reiniciar
          </button>
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
                {/* Importe: <span>{web3.utils.fromWei(cheque.amount, 'ether')} ETH</span> */}
                AR$ <span>{cheque.amount}</span>
              </p>
            </div>
            <div className="cheque-footer">
              <button
                className="button withdraw-button"
                onClick={() => handleWithdraw(cheque.id)}
              >
                Retirar fondos
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
  
  export default ChequesList;
  