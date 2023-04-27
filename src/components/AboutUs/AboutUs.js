import React from 'react';
import './AboutUs.scss';

const AboutUs = () => {
  return (
    <div className="AboutUs">
      <h2 className="title">Acerca de nosotros</h2>
      <p className="intro">
        Somos un grupo llamado <strong>To Be Defined</strong>, y nuestro objetivo es
        revolucionar la forma en que se procesan los cheques interbancarios mediante la
        adopción de tecnología blockchain.
      </p>
      <div className="benefits">
        <h3 className="subtitle">Beneficios de migrar los cheques a la blockchain:</h3>
        <div className="benefit">
          <h4 className="benefit-title">Velocidad de procesamiento</h4>
          <p className="benefit-description">
            Al migrar los cheques a la blockchain, eliminamos las demoras en el
            procesamiento de cheques tradicionales, que pueden tardar hasta 48 horas.
            Con nuestra solución, los cheques se procesan de manera rápida y eficiente,
            lo que mejora la experiencia de los usuarios y ahorra tiempo valioso.
          </p>
        </div>
        <div className="benefit">
          <h4 className="benefit-title">Seguridad</h4>
          <p className="benefit-description">
            La tecnología blockchain es altamente segura y ofrece protección contra
            fraudes y falsificaciones. Al usar blockchain para procesar cheques,
            garantizamos que las transacciones sean seguras y confiables, lo que
            aumenta la confianza en el sistema y reduce el riesgo para los usuarios.
          </p>
        </div>
      </div>
      <p className="conclusion">
        Creemos en el poder de la innovación y la tecnología para transformar la
        industria financiera y ofrecer mejores soluciones a nuestros clientes. Nuestra
        solución de cheques basada en blockchain es solo el comienzo de este viaje
        emocionante.
      </p>
    </div>
  );
};

export default AboutUs;
