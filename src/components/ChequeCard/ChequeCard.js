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
        <h3>Cheque</h3>
        <h4>ID: {chequeId}</h4>
      </div>
      <div className="cheque-body">
        <p>
          AR <span>{montoFormateado}</span>
        </p>
        <p className="cheque-card-monto-en-letras">{montoEnLetrasCapitalizado}</p>
      </div>
      <div className="cheque-footer">
        {amount > 0 ? (
          <button className="button withdraw-button" onClick={() => handleWithdraw(chequeId)}>
            Retirar fondos
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
