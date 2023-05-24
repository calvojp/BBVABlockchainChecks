import React, { useState, useEffect } from 'react';
import { connectMetaMask } from '../../web3Config';
import Swal from 'sweetalert2';

const ChequesList = () => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [nftChequeContract, setNftChequeContract] = useState(null);
    const [cheques, setCheques] = useState([]);
  
    useEffect(() => {
      const init = async () => {
        const { providerInstance, signer, nftChequeContract } = await connectMetaMask();
        setProvider(providerInstance);
        setSigner(signer);
        setNftChequeContract(nftChequeContract);
      };
      init();
    }, []);
  
    const handleSearch = async (e) => {
        e.preventDefault();
          
        if (!nftChequeContract || !signer) {
          alert('Por favor, conecta a MetaMask primero');
          return;
        }
      
        try {
          const accounts = await signer.provider.listAccounts();
          const account = accounts[0];
      
          // Se busca los cheques en la cuenta conectada
          const chequeIds = await nftChequeContract.getChequesByRecipient(account);
          
          if (chequeIds.length <= 0) {
            Swal.fire({
              icon: 'error',
              title: 'Error.',
              text: 'No se encontro ningun cheque relacionado a esa dirección',
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
      <div className="flex flex-col items-center justify-center p-4">
        <form className="w-full max-w-md mt-6" onSubmit={handleSearch}>
          <h2 className="text-2xl text-center text-blue-500 mb-4">Mis cheques</h2>
          <div className="flex items-center border-b border-blue-500 py-2">
            <button
              className="flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"
              type="submit">
              Consultar
            </button>
          </div>
        </form>
        <div className="grid grid-cols-1 gap-4 mt-8">
          {cheques.map((cheque) => (
            <div key={cheque.id} className="flex flex-col border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-blue-500">Cheque</h3>
                <h4 className="text-gray-500">ID: {cheque.id}</h4>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">
                  AR$ <span className="font-bold">{cheque.amount / (10 ** 2)}</span>
                </p>
              </div>
              <div className="mt-2">
                {cheque.amount > 0 ? (
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleWithdraw(cheque.id)}
                  >
                    Cobrar fondos
                  </button>
                ) : (
                  <button
                    className="w-full bg-gray-300 text-white font-bold py-2 px-4 rounded"
                    disabled
                  >
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


// import React, { useState, useEffect } from 'react';
// import { connectMetaMask } from '../../web3Config';
// import './ChequesList.scss';
// import Swal from 'sweetalert2';


// const ChequesList = () => {
//     const [provider, setProvider] = useState(null);
//     const [signer, setSigner] = useState(null);
//     const [nftChequeContract, setNftChequeContract] = useState(null);
//     const [searchAddress, setSearchAddress] = useState('');
//     const [cheques, setCheques] = useState([]);
  
//     useEffect(() => {
//       const init = async () => {
//         const { providerInstance, signer, nftChequeContract } = await connectMetaMask();
//         setProvider(providerInstance);
//         setSigner(signer);
//         setNftChequeContract(nftChequeContract);
//       };
//       init();
//     }, []);
  

//     const handleReset = () => {
//         setSearchAddress('');
//         setCheques([]);
//       };


//       const handleSearch = async (e) => {
//         e.preventDefault();
      
//         if (!nftChequeContract || !signer) {
//           alert('Por favor, conecta a MetaMask primero');
//           return;
//         }
      
//         try {
//           const accounts = await signer.provider.listAccounts();
//           const account = accounts[0];
      
//           // Se busca los cheques en la cuenta conectada
//           const chequeIds = await nftChequeContract.getChequesByRecipient(account);
          
//           if (chequeIds.length <= 0) {
//             Swal.fire({
//               icon: 'error',
//               title: 'Error.',
//               text: 'No se encontro ningun cheque relacionado a esa dirección',
//               footer: '<a href="">Por qué tengo este problema?</a>'
//             });
//             return;
//           }
          
//           const chequesData = await Promise.all(
//             chequeIds.map(async (chequeId) => {
//               const amount = await nftChequeContract.getAmountByChequeId(chequeId);
      
//               return {
//                 id: chequeId.toString(),
//                 amount,
//               };
//             })
//           );
      
//           setCheques(chequesData);
//         } catch (error) {
//           console.error(error);
//           Swal.fire({
//               icon: 'error',
//               title: 'Error.',
//               text: 'No se encontro ningun cheque relacionado a esa dirección',
//               footer: '<a href="">Por qué tengo este problema?</a>'
//           });
//         }
//       };  

  
//     const handleWithdraw = async (chequeId) => {
//       try {
//         Swal.fire({
//           title: "Retirando cheque...",
//           text: "Por favor acepta la transacción en MetaMask",
//           allowOutsideClick: false,
//           showConfirmButton: false,
//           willOpen: () => {
//             Swal.showLoading();
//           },
//         });

//         const tx = await nftChequeContract.withdraw(chequeId);
//         await tx.wait();

//         Swal.close();

//         Swal.fire(
//           'Finalizado',
//           `Cheque retirado con éxito.`,
//           'success'
//         );

//       } catch (error) {
//         console.error(error);
//         Swal.fire({
//             icon: 'error',
//             title: 'Error.',
//             text: 'Error al retirar los fondos. Recordá aceptar la transacción en Metamask',
//             footer: '<a href="">Por qué tengo este problema?</a>'
//         });
//       }
//     };

  
//     return (
//       <div className="ChequesList">
//         <form className="form" onSubmit={handleSearch}>
//           <h2>Mis cheques</h2>
//           {/* <input
//             className="input"
//             type="text"
//             placeholder="Dirección de búsqueda"
//             value={searchAddress}
//             onChange={(e) => setSearchAddress(e.target.value)}
//           /> */}
//           <div className="form-buttons">
//             <button className="button" type="submit">
//               Consultar
//             </button>
//             {/* <button className="button reset-button" type="button" onClick={handleReset}>
//               Reiniciar
//             </button> */}
//           </div>
//         </form>
//         <div className="cheque-cards">
//           {cheques.map((cheque) => (
//             <div key={cheque.id} className="cheque-card">
//               <div className="cheque-header">
//                 <h3>Cheque</h3>
//                 <h4>ID: {cheque.id}</h4>
//               </div>
//               <div className="cheque-body">
//                 <p>
//                   {/* Importe: <span>{web3.utils.fromWei(cheque.amount, 'ether')} AR$</span> */}
//                   AR$ <span>{cheque.amount / (10 ** 2)}</span>
//                 </p>
//               </div>
//               <div className="cheque-footer">
//                 {cheque.amount > 0 ? (
//                   <button
//                     className="button withdraw-button"
//                     onClick={() => handleWithdraw(cheque.id)}
//                   >
//                     Cobrar fondos
//                   </button>
//                 ) : (
//                   <button className="button withdrawn-button" disabled>
//                     Cheque cobrado
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
    
//     };
    
//     export default ChequesList;
  





    
    // const handleSearch = async (e) => {
    //   e.preventDefault();
  
    //   if (!nftChequeContract || !signer) {
    //     alert('Por favor, conecta a MetaMask primero');
    //     return;
    //   }
  
    //   try {
    //     const accounts = await signer.provider.listAccounts();
    //     const account = accounts[0];

    //     console.log("direccion q busco:", searchAddress);
    //     const chequeIds = await nftChequeContract.getChequesByRecipient(searchAddress);
        
    //     if (chequeIds.length <= 0) {
    //       Swal.fire({
    //         icon: 'error',
    //         title: 'Error.',
    //         text: 'No se encontro ningun cheque relacionado a esa dirección',
    //         footer: '<a href="">Por qué tengo este problema?</a>'
    //       });
    //       return;
    //     }
        
    //     const chequesData = await Promise.all(
    //       chequeIds.map(async (chequeId) => {
    //         const amount = await nftChequeContract.getAmountByChequeId(chequeId);
  
    //         return {
    //           id: chequeId.toString(),
    //           amount,
    //         };
    //       })
    //     );
  
    //     setCheques(chequesData);
    //   } catch (error) {
    //     console.error(error);
    //     Swal.fire({
    //         icon: 'error',
    //         title: 'Error.',
    //         text: 'No se encontro ningun cheque relacionado a esa dirección',
    //         footer: '<a href="">Por qué tengo este problema?</a>'
    //     });
    //   }
    // };