// Navbar.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light py-1 border-bottom border-dark">
      <div className="container">
        <a className="navbar-brand" href="/">EduPlanr</a>
        <button className="navbar-toggler" style={{ marginRight: '15px' }} type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ml-auto text-center">
            {!isLoggedIn && (
              <>
                <a className="nav-item nav-link" href="/login">Log In</a>
                <a className="nav-item nav-link" href="/signup">Sign Up</a>
              </>
            )}
            {isLoggedIn && (
              <>
                <a className="nav-item nav-link" href="/settings">Settings</a>
                <button className="nav-item nav-link btn" onClick={handleLogout}>Log Out</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;