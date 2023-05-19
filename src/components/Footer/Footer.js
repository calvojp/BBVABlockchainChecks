import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            {/* <p className="lead">BBVA © 2023</p> */}
          </div>
          <div className="col-lg-6 d-flex justify-content-end">
            <a href="https://www.bbva.com.ar/" className="social-media-link mx-2">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="https://www.bbva.com.ar/" className="social-media-link mx-2">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://www.bbva.com.ar/" className="social-media-link mx-2">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://www.bbva.com.ar/" className="social-media-link mx-2">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
