import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutUs from './components/AboutUs/AboutUs.js';
import ChequeEmitter from './components/ChequeEmitter/ChequeEmitter.js';
import ChequesList from './components/ChequesList/ChequesList.js';
import ChequeWithdraw from './components/ChequeWithdraw/ChequeWithdraw.js';
import Login from './components/Login/Login.js';
import { NavBar } from './components/NavBar/NavBar';
import { NFTCheque } from './components/NFTCheque/NFTCheque.js';
import Footer from './components/Footer/Footer'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import './components/NFTCheque/NFTCheque.scss';
import { Playground } from './components/storybook/Playground.tsx';
// import ChequesIndex from './components/storybook/Playground.js';

axios.defaults.withCredentials = true;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [clientName, setClientName] = useState("");


  useEffect(() => {
    // Intenta obtener 'loggedIn' del almacenamiento local
    const savedLoggedIn = JSON.parse(localStorage.getItem('loggedIn'));

    // Si 'loggedIn' estaba en el almacenamiento local, actualiza el estado
    if (savedLoggedIn) {
        setLoggedIn(true);
    }
}, []);


  const handleLogin = (loggedIn, clientName) => {
    setLoggedIn(loggedIn);
    setClientName(clientName);
  };

  const handleLogout = async () => {
    try {
      console.log("estoy entrando al logout de appjs")
      const response = await axios.post('https://ramiropeidro.pythonanywhere.com/logout', {}, {
        withCredentials: true
      });
  
      if (response.data.status === "success") {
        setLoggedIn(false);
        setClientName("");
        // También asegúrate de eliminar 'loggedIn' del almacenamiento local cuando el usuario cierre sesión
        localStorage.removeItem('loggedIn');
      } else {
        console.error("Error al cerrar la sesión:", response.data.message);
      }
    } catch (error) {
      console.error("Error al enviar la petición al servidor:", error);
    }
  };
  

  

  return (
    <Router>
      <div className="App">
        <NavBar
          loggedIn={loggedIn}
          clientName={clientName}
          logo="https://www.bbva.com.ar/content/dam/public-web/global/images/logos/logo_bbva_blanco.svg"
          // link1="Cheques"
          link2="Emitir"
          link3="Iniciar sesión"
          // ruta1="/"
          ruta2="/services"
          ruta3="/contact"
          onLogout={handleLogout}
        />
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <Playground />  
                {/* <ChequesIndex/> */}
                {/* descomentar */}
                {/* <ChequeWithdraw /> */}
              </div>
            }
          />

          <Route
            path="/services"
            element={
              <div>
                <ChequeEmitter />
                {/* descomentar */}
                {/* <ChequeWithdraw /> */}
              </div>
            }
          />

          {/* <Route path="/contact" element={<AboutUs />} /> */}
          <Route
            path="/contact"
            element={<Login onLogin={handleLogin} />}
          />

          <Route
            path="/micuenta"
            element={
              <div>
                {/* <ChequeWithdraw /> */}
                <ChequesList />
                {/* <ChequesIndex /> */}
              </div>
            }
            
          />
        </Routes>
        {/* <Footer />  */}
      </div>
    </Router>
  );
}

export default App;
