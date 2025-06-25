import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/api';
import './Styles/Header.css';

function Header() {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authchange', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authchange', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="header-title">Poll Creator</Link>
        </div>
        <div className="header-right">
          {authenticated ? (
            <>
              <span className="user-name">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="header-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
          <Link to="/login" className="header-link">Login</Link>
          <Link to="/signup" className="header-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 