import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '../utils/auth';
import '../styles/header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate('/');
  };

  return (
    <div className="header">
      <h1 className="header-name">Mona AboElazm</h1>
      <span className="header-title">DASHBOARD</span>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Header;