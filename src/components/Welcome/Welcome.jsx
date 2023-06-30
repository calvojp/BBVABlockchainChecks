import React, { useState } from "react";
import "./Welcome.scss";
import logo from "/Users/ramiropeidro/Desktop/reactCheques/my-app/src/assets/images/BBVA_WHITE.png";
import axios from 'axios';
import Swal from 'sweetalert2';
import { Navigate } from 'react-router-dom';

function Welcome({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [isRightPanelActive, setRightPanelActive] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        console.log("ejecutando")
        try {
            const response = await axios.post("http://RamiroPeidro.pythonanywhere.com/login", {
              username,
              password,
            }, { withCredentials: true });;
              
            if (response.data.status === "success") {
              setLoggedIn(true);
            //   setWelcomeMessage(response.data.message);
              localStorage.setItem('loggedIn', true);
      
                try {
                  const clientsResponse = await axios.get("http://RamiroPeidro.pythonanywhere.com/clientes", 
                  {withCredentials: true} );
                  if (clientsResponse.data && clientsResponse.data.length > 0) {
                    onLogin(true, clientsResponse.data[0].NOMBRE); 
                  } else {
                    onLogin(true, "");
                    Swal.fire({
                      icon: 'error',
                      title: 'Credenciales incorrectas',
                      text: 'Vuelve a intentar',
                      footer: '<a href="">Por qué tengo este problema?</a>'
                  });
                  }
                } catch (error) {
                  console.error("Error al obtener el nombre del cliente:", error);
                  onLogin(true, "");
                }
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Credenciales incorrectas',
                  text: 'Vuelve a intentar',
                  footer: '<a href="">Por qué tengo este problema?</a>'
              });
                setLoggedIn(false);
                setWelcomeMessage(response.data.message);
                onLogin(false, "");
              }
            } catch (error) {
              console.error("Error en el inicio de sesión:", error);
              setLoggedIn(false);
              setWelcomeMessage("Error en el inicio de sesión. Por favor, inténtalo de nuevo.");
            }
    };

    if (loggedIn) {
        return <Navigate to="/list" />
      }

    const handleSignUpClick = () => {
        setRightPanelActive(true);
    };

    const handleSignInClick = () => {
        setRightPanelActive(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // implement handleSubmit function
    };

    return (
        <div className="general">
        <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
            <div className="form-container sign-up-container">
                <form onSubmit={handleSubmit}>
                    <h1>Crear cuenta</h1>
                    <div className="social-container">
                        <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                        <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                    <span></span>
                    <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    <input type="number" placeholder="DNI" />
                    <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
                    <button>Registrarse</button>
                </form>
            </div>
            <div className="form-container sign-in-container">
                <form onSubmit={handleLogin}>
                    <h1>Iniciar sesión</h1>
                    <div className="social-container">
                        <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                        <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                    <span></span>
                    <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
                    <a href="#">Olvidaste tu contraseña?</a>
                    <button>Iniciar sesión</button>
                </form>
            </div>
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Que lindo verte!</h1>
                        <p></p>
                        <button className="ghost" id="signIn" onClick={handleSignInClick}>Iniciar sesión</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Bienvenido de nuevo!</h1>
                        <p></p>
                        <button className="ghost" id="signUp" onClick={handleSignUpClick}>Crear cuenta</button>
                    </div>
                </div>
            </div>
            <img src={logo} alt="BBVA logo" className="logo" />
            <img src={logo} alt="BBVA logo" className="logo2" />
        </div>
        </div>
    );
}

export default Welcome;
