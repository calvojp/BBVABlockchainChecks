import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import { NFTCheque} from './components/NFTCheque/NFTCheque.js';
import './components/NFTCheque/NFTCheque.scss';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar
          logo="https://www.bbva.com/wp-content/uploads/2019/04/Logo-BBVA.jpg"
          link1="Inicio"
          link2="Servicios"
          link3="Contacto"
          ruta1="/"
          ruta2="/services"
          ruta3="/contact"
        />
        <Routes>
          <Route path="/" element={<NFTCheque />} />
          {/* Agrega más rutas aquí si es necesario */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
