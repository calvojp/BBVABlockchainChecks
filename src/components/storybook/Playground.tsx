import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu, menuClasses, MenuItemStyles} from 'react-pro-sidebar';
import { Switchs } from './components/Switchs.tsx';
import { SidebarHeader } from './components/SidebarHeader.tsx';
import { Diamond } from './icons/Diamond.tsx';
import { BarChart } from './icons/BarChart.tsx';
import { Global } from './icons/Global.tsx';
import { InkBottle } from './icons/InkBottle.tsx';
import { Book } from './icons/Book.tsx';
import { Calendar } from './icons/Calendar.tsx';
import { ShoppingCart } from './icons/ShoppingCart.tsx';
import { Service } from './icons/Service.tsx';
import { SidebarFooter } from './components/SidebarFooter.tsx';
import { Badge } from './components/Badge.tsx';
import { Typography } from './components/Typography.tsx';
import { PackageBadges } from './components/PackageBadges.tsx';
import ChequesList from '../ChequesList/ChequesList';
import ChequeEmitter from '../ChequeEmitter/ChequeEmitter';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';



type Theme = 'light' | 'dark';

const themes = {
  light: {
    sidebar: {
      backgroundColor: '#ffffff',
      color: '#607489',
    },
    menu: {
      menuContent: '#fbfcfd',
      icon: '#0098e5',
      hover: {
        backgroundColor: '#c5e4ff',
        color: '#44596e',
      },
      disabled: {
        color: '#9fb6cf',
      },
    },
  },
  dark: {
    sidebar: {
      backgroundColor: '#0b2948',
      color: '#8ba1b7',
    },
    menu: {
      menuContent: '#082440',
      icon: '#59d0ff',
      hover: {
        backgroundColor: '#00458b',
        color: '#b6c8d9',
      },
      disabled: {
        color: '#3e5e7e',
      },
    },
  },
};

// hex to rgba converter
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const Playground: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [toggled, setToggled] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const [rtl, setRtl] = React.useState(false);
  const [hasImage, setHasImage] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>('dark');

  // handle on RTL change event
  const handleRTLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRtl(e.target.checked);
  };

  // handle on theme change event
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.checked ? 'dark' : 'light');
  };

  // handle on image change event
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasImage(e.target.checked);
  };

  const menuItemStyles: MenuItemStyles = {
    root: {
      fontSize: '13px',
      fontWeight: 400,
    },
    icon: {
      color: themes[theme].menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: '#b6b7b9',
    },
    subMenuContent: ({ level }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(themes[theme].menu.menuContent, hasImage && !collapsed ? 0.4 : 1)
          : 'transparent',
    }),
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
      '&:hover': {
        backgroundColor: hexToRgba(themes[theme].menu.hover.backgroundColor, hasImage ? 0.8 : 1),
        color: themes[theme].menu.hover.color,
      },
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };

  return (
    <div style={{ display: 'flex', height: '100%', direction: rtl ? 'rtl' : 'ltr' }}>
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        onBreakPoint={setBroken}
        image="https://user-images.githubusercontent.com/25878302/144499035-2911184c-76d3-4611-86e7-bc4e8ff84ff5.jpg"
        rtl={rtl}
        breakPoint="md"
        backgroundColor={hexToRgba(themes[theme].sidebar.backgroundColor, hasImage ? 0.9 : 1)}
        rootStyles={{
          color: themes[theme].sidebar.color,
        }}
      >

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <SidebarHeader rtl={rtl} style={{ marginBottom: '24px', marginTop: '16px' }} />
          <div style={{ flex: 1, marginBottom: '32px' }}>
            
            <div style={{ padding: '0 24px', marginBottom: '8px' }}>
              <Typography
                variant="body2"
                fontWeight={600}
                style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: '0.5px' }}
              >
                Cheques
              </Typography>
              
            </div>
            <Menu menuItemStyles={menuItemStyles}>
              <SubMenu
                label="Bandeja entrada"
                icon={<BarChart />}
                suffix={
                  <Badge variant="danger" shape="circle">
                    1
                  </Badge>
                }
              >
                <MenuItem>
                    <Link to="/list" style={{ textDecoration: 'none', color: 'inherit' }}>Activos</Link>
                 </MenuItem>
                <MenuItem> Diferidos</MenuItem>
                <MenuItem> Vencidos</MenuItem>
              </SubMenu>

              <SubMenu label="Bandeja de salida" icon={<BarChart />}>
                <MenuItem> Activos</MenuItem>
                <MenuItem> Diferidos</MenuItem>
                <MenuItem> Vencidos</MenuItem>
              </SubMenu>
              <SubMenu label="Emitir" icon={<Calendar />}>
                <MenuItem>
                  <Link to="/emitir" style={{ textDecoration: 'none', color: 'inherit' }}>Convencional</Link>
                </MenuItem>
                <MenuItem> Diferidos</MenuItem>
                <MenuItem>Certificados</MenuItem>
              </SubMenu>
              <SubMenu label="Transferir" icon={<Calendar />}>
                <MenuItem component={<Link to="/services" />}> Grid</MenuItem>
                <MenuItem> Layout</MenuItem>
                <SubMenu label="Forms">
                  <MenuItem> Input</MenuItem>
                  <MenuItem> Select</MenuItem>
                  <SubMenu label="More">
                    <MenuItem> CheckBox</MenuItem>
                    <MenuItem> Radio</MenuItem>
                  </SubMenu>
                </SubMenu>
              </SubMenu>
              <SubMenu label="Cancelar" icon={<Calendar />}>
                <MenuItem> Product</MenuItem>
                <MenuItem> Orders</MenuItem>
                <MenuItem> Credit card</MenuItem>
              </SubMenu>
            </Menu>

            <div style={{ padding: '0 24px', marginBottom: '8px', marginTop: '32px' }}>
              <Typography
                variant="body2"
                fontWeight={600}
                style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: '0.5px' }}
              >
                Consultas
              </Typography>
            </div>

            <Menu menuItemStyles={menuItemStyles}>
              <MenuItem icon={<BarChart />} suffix={<Badge variant="success">New</Badge>}>
                Mis datos
              </MenuItem>
              <MenuItem icon={<Book />}>Consulta destinatarios</MenuItem>
              <MenuItem disabled icon={<Service />}>
                Plazo fijo (proximamente)
              </MenuItem>
            </Menu>

            <div style={{ padding: '7px 24px', marginTop: '20px' }}>
              <div style={{ marginBottom: 16 }}>
                <Switchs
                  id="collapse"
                  checked={!collapsed}
                  onChange={() => setCollapsed(!collapsed)}
               />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Switchs
                 id="theme"
                 checked={theme === 'dark'}
                 onChange={handleThemeChange}
                 label=""
               />
              </div>
            </div>

          </div>
          {/* <SidebarFooter collapsed={collapsed} /> */}
        </div>
      </Sidebar>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center'}}>
        <Routes>
          {/* Other routes... */}
          <Route path="/emitir" element={<ChequeEmitter />} />
          <Route path="/list" element={<ChequesList />} />
          {/* Other routes... */}
        </Routes>
      </div>

    
      {/* <main style={{ display: 'flex', width: '100vw', border: '2px solid red'}}>
        <div style={{ justifyContent: 'center', alignItems: 'center', border: '2px solid red' }}>
          <ChequesList />
        </div>
      </main> */}
    </div>
  );
};


{/* <main>
        <div style={{ padding: '16px 24px', color: '#44596e' }}>
          <div style={{ marginBottom: '16px' }}>
            {broken && (
              <button className="sb-button" onClick={() => setToggled(!toggled)}>
                Toggle
              </button>
            )}
          </div>
          <div style={{ marginBottom: '48px' }}>
            <Typography variant="h4" fontWeight={600}>
              BBVA Block-Cheques
            </Typography>
            <Typography variant="body2">
              React Pro Sidebar provides a set of components for creating high level and
              customizable side navigation
            </Typography>
            <PackageBadges />
          </div>

          <div style={{ padding: '0 8px' }}>
            <div style={{ marginBottom: 16 }}>
              <Switch
                id="collapse"
                checked={collapsed}
                onChange={() => setCollapsed(!collapsed)}
                label="Collapse"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Switch id="rtl" checked={rtl} onChange={handleRTLChange} label="RTL" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Switch
                id="theme"
                checked={theme === 'dark'}
                onChange={handleThemeChange}
                label="Dark theme"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Switch id="image" checked={hasImage} onChange={handleImageChange} label="Image" />
            </div>
          </div>
        </div>
      </main> */}
