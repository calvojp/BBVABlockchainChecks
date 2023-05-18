import React from 'react';
import './Footer.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    return (
        <div className="Footer">
            <div className="Footer__container">
                <div className="Footer__brand">
                    <img
                        src="https://www.bbva.com/wp-content/uploads/2019/04/Logo-BBVA.jpg"
                        alt="BBVA Logo"
                    />
                    <p>BBVA Cheque Emitter © 2023</p>
                </div>

                <div className="Footer__links">
                    <a href="/terms">Términos de Servicio</a>
                    <a href="/privacy">Política de Privacidad</a>
                </div>

                <div className="Footer__social">
                    <a href="https://www.facebook.com/BBVAWorld/">
                        <FontAwesomeIcon icon={faFacebookF} />
                    </a>
                    <a href="https://twitter.com/bbva">
                        <FontAwesomeIcon icon={faTwitter} />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Footer;
