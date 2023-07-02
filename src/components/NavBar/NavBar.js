import React, { useState } from 'react';
import { IoMdClose, IoMdMenu } from 'react-icons/io';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './NavBar.scss';

export const NavBar = ({
  loggedIn,
  clientName,
  logo,
  link1,
  link2,
  link3,
  ruta1,
  ruta2,
  ruta3,
  onLogout,
}) => {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate(); // usa useNavigate en lugar de useHistory

  const handleMenuOnClick = () => {
    setMenu(!menu);
  };

  const handleLogoutClick = () => {
    onLogout();
    setMenu(false);
    navigate('/'); 
  };

  return (
    <header>
      <div className="logo">
        <Link to="/" className="nav-link">
          <img className="img-fluid" src={logo} alt="logo" />
        </Link>
      </div>

      <nav className={menu ? 'nav show' : 'nav'} id="nav-menu">
        <IoMdClose id="header-close" onClick={handleMenuOnClick} />

        <ul className="nav-list">
          <li className="nav-item">
            <NavLink exact to={ruta1} className="nav-link" activeClassName={'activeLink'}>
              {link1}
            </NavLink>
          </li>

          {loggedIn ? (
            <>
              <li className="nav-item">
                <NavLink exact to={"/micuenta"} className="nav-link" activeClassName={'activeLink'}>
                  Mis cheques
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink exact to={ruta2} className="nav-link" activeClassName={'activeLink'}>
                {link2}
              </NavLink>
              </li>
              <li className="nav-item">
                <div onClick={handleLogoutClick} className="nav-link">
                  Cerrar sesión
                </div>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <NavLink exact to={ruta3} className="nav-link" activeClassName={'activeLink'}>
                {link3}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <IoMdMenu id="header-toggle" onClick={handleMenuOnClick} />
    </header>
  );
};

