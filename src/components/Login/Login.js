import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Grid, Typography, Paper } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import SignUpForm from '../SingUpForm/SingUpForm';
import Swal from 'sweetalert2';
import './Login.scss';


function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://RamiroPeidro.pythonanywhere.com/login", {
        username,
        password,
      }, { withCredentials: true });;
        
      if (response.data.status === "success") {
        setLoggedIn(true);
        setWelcomeMessage(response.data.message);
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


const handleLogout = async () => {
  try {
    console.log("estoy entrando a este logout")
    const response = await axios.post('http://RamiroPeidro.pythonanywhere.com/logout', {}, {
      withCredentials: true
    });

    if (response.data.status === "success") {
      setLoggedIn(false);
      onLogin(false, "");
      setLoggedIn(false);
      localStorage.removeItem('loggedIn');
    } else {
      console.error("Error al cerrar la sesión:", response.data.message);
    }
  } catch (error) {
    console.error("Error al enviar la petición al servidor:", error);
  }
};


  const handleOpenSignUp = () => {
    setSignUpOpen(true);
  };

  const handleCloseSignUp = () => {
    setSignUpOpen(false);
  };

  return (
    <Grid container className="loginContainer" justifyContent="center">
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper className="loginPaper" elevation={5}>
          <Typography variant="h4" className="loginTitle">
            Iniciar sesión
          </Typography>
          <LockOutlined className="loginIcon" />
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
            <Button variant="contained" color="primary" type="submit" className="submitBtn">
              Iniciar sesión
            </Button>
          </form>
          {loggedIn ? (
            <>
            <Typography>{welcomeMessage}</Typography>
            <Button onClick={handleLogout} variant="text" className="logoutBtn">
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
          <Button onClick={handleOpenSignUp} variant="text" className="createAccBtn">
            Crear cuenta
          </Button>
          {/* <Typography>{welcomeMessage}</Typography> */}
          <SignUpForm open={signUpOpen} onClose={handleCloseSignUp} closeForm={handleCloseSignUp}/>
          </>
        )}
      </Paper>
    </Grid>
  </Grid>
);
}

export default Login;
