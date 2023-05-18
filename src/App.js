// import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import AboutUs from './components/AboutUs/AboutUs.js';
// import ChequeEmitter from './components/ChequeEmitter/ChequeEmitter.js';
// import ChequesList from './components/ChequesList/ChequesList.js';
// import ChequeWithdraw from './components/ChequeWithdraw/ChequeWithdraw.js';
// import Login from './components/Login/Login.js';
// import { NavBar } from './components/NavBar/NavBar';
// import { NFTCheque } from './components/NFTCheque/NFTCheque.js';

// import './components/NFTCheque/NFTCheque.scss';

// function App() {
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [clientName, setClientName] = useState("");

//   const handleLogin = (loggedIn, clientName) => {
//     setLoggedIn(loggedIn);
//     setClientName(clientName);
//   };

//   return (
//     <Router>
//       <div className="App">
//         <NavBar
//           loggedIn={loggedIn}
//           clientName={clientName}
//           logo="https://www.bbva.com/wp-content/uploads/2019/04/Logo-BBVA.jpg"
//           link1="Cheques"
//           link2="Emitir"
//           link3="Iniciar sesión"
//           ruta1="/"
//           ruta2="/services"
//           ruta3="/contact"
//         />
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <div>
//                 <NFTCheque />
//                 <ChequesList />
//               </div>
//             }
//           />

//           <Route
//             path="/services"
//             element={
//               <div>
//                 <ChequeEmitter />
//                 {/* descomentar */}
//                 {/* <ChequeWithdraw /> */}
//               </div>
//             }
//           />

//           {/* <Route path="/contact" element={<AboutUs />} /> */}
//           <Route
//             path="/contact"
//             element={<Login onLogin={handleLogin} />}
//           />

//           <Route
//             path="/myaccount"
//             element={ <ChequeWithdraw />}
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutUs from './components/AboutUs/AboutUs.js';
import ChequeEmitter from './components/ChequeEmitter/ChequeEmitter.js';
import ChequesList from './components/ChequesList/ChequesList.js';
import ChequeWithdraw from './components/ChequeWithdraw/ChequeWithdraw.js';
import Login from './components/Login/Login.js';
import { NavBar } from './components/NavBar/NavBar';
import { NFTCheque } from './components/NFTCheque/NFTCheque.js';
import Footer from './components/Footer/Footer'; // <- Importa el componente Footer aquí

import './components/NFTCheque/NFTCheque.scss';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [clientName, setClientName] = useState("");

  const handleLogin = (loggedIn, clientName) => {
    setLoggedIn(loggedIn);
    setClientName(clientName);
  };

  return (
    <Router>
      <div className="App">
        <NavBar
          loggedIn={loggedIn}
          clientName={clientName}
          logo="https://www.bbva.com/wp-content/uploads/2019/04/Logo-BBVA.jpg"
          link1="Cheques"
          link2="Emitir"
          link3="Iniciar sesión"
          ruta1="/"
          ruta2="/services"
          ruta3="/contact"
        />
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <NFTCheque />
                <ChequesList />
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
            path="/myaccount"
            element={ <ChequeWithdraw />}
          />
        </Routes>
        <Footer /> {/* <- Coloca el componente Footer aquí */}
      </div>
    </Router>
  );
}

export default App;
