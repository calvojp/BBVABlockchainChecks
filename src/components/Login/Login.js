import React, { useState } from 'react';
import axios from 'axios';
import './Login.scss';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", {
        username,
        password,
      });
  
      if (response.data.status === "success") {
        setLoggedIn(true);
        setWelcomeMessage(response.data.message);
  
        try {
          const clientsResponse = await axios.get("http://127.0.0.1:5000/clientes");
          if (clientsResponse.data && clientsResponse.data.length > 0) {
            onLogin(true, clientsResponse.data[0].nombre); // Asume que el primer cliente en la respuesta es el cliente actual
          } else {
            onLogin(true, "");
          }
        } catch (error) {
          console.error("Error al obtener el nombre del cliente:", error);
          onLogin(true, "");
        }
      } else {
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
  

  const handleLogout = () => {
    //aca agregar llamo a la api del logout
    setLoggedIn(false);
  };

  return (
    <div className="loginContainer">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Iniciar sesión</button>
      </form>
      <button>Crear cuenta</button>
      {loggedIn ? (
        <>
          <p>{welcomeMessage}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <p>{welcomeMessage}</p>
      )}
    </div>
  );
}

export default Login;
