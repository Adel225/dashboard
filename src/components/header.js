import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    sessionStorage.removeItem('token');
    navigate('/login');
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