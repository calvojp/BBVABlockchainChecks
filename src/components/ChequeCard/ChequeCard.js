import React from 'react';
import './ChequeCard.scss';
import { NumerosALetras } from 'numero-a-letras';

const ChequeCard = ({ chequeId, amount, handleWithdraw }) => {

  const monto = amount / (10 ** 2);
  const montoEnLetras = NumerosALetras(monto, {
    plural: 'pesos',
    singular: 'peso',
    centPlural: 'centavos',
    centSingular: 'centavo',
  });
  const montoEnLetrasCapitalizado = (montoEnLetras.charAt(0).toUpperCase() + montoEnLetras.slice(1).replace('undefined', '')).replace('M.N.','');
  const montoFormateado = parseFloat(monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  return (
    <div className="cheque-card">
      <div className="cheque-header">
      {/* <img className="img-fluid" src="https://www.bbva.com/wp-content/uploads/2019/04/Logo-BBVA.jpg"/> */}
        <h3>Cheque</h3>
        <h4>ID: {chequeId} <p>18/05/2023</p></h4>
      </div>
      
      <div className="cheque-body">
        <p>
          ARS <span>{montoFormateado}</span>
        </p>
        {/* <p className="cheque-card-monto-en-letras">{montoEnLetrasCapitalizado}</p> */}
      </div>
      <div className="cheque-body"><p className="cheque-card-monto-en-letras">{montoEnLetrasCapitalizado}</p></div>
      <div className="cheque-footer">
        {amount > 0 ? (
          <button className="button withdraw-button" onClick={() => handleWithdraw(chequeId)}>
            Cobrar fondos
          </button>
        ) : (
          <button className="button withdrawn-button" disabled>
            Cheque cobrado
          </button>
        )}
      </div>
    </div>
  );
};

export default ChequeCard;
