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
import Welcome from './components/Welcome/Welcome.jsx';


axios.defaults.withCredentials = true;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    const savedLoggedIn = JSON.parse(localStorage.getItem('loggedIn'));
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
        {loggedIn ? (
          <>
            <NavBar
              loggedIn={loggedIn}
              clientName={clientName}
              logo="https://www.bbva.com.ar/content/dam/public-web/global/images/logos/logo_bbva_blanco.svg"
              link2="Emitir"
              link3="Cerrar sesión"
              ruta2="/services"
              ruta3="/logout"
              onLogout={handleLogout}
            />
            {/* <Topbar /> */}
            <Playground />
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/services" element={<ChequeEmitter />} />
              <Route path="/micuenta" element={<ChequesList />} />
            </Routes>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<Welcome onLogin={handleLogin} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
