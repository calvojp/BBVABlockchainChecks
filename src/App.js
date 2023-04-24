import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChequeEmitter from './components/ChequeEmitter/ChequeEmitter.js';
import { NavBar } from './components/NavBar/NavBar';
import { NFTCheque} from './components/NFTCheque/NFTCheque.js';

import './components/NFTCheque/NFTCheque.scss';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar
          logo="https://www.bbva.com/wp-content/uploads/2019/04/Logo-BBVA.jpg"
          link1="Cheques"
          link2="Emitir"
          link3="About Us"
          ruta1="/"
          ruta2="/services"
          ruta3="/contact"
        />
        <Routes>
          <Route path="/" element={<NFTCheque />} />
          <Route path="/services" element={<ChequeEmitter />} />
          {/* Agrega más rutas aquí si es necesario */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
