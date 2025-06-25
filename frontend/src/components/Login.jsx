import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import './Styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('authchange'));
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-single-card">
        <button className="back-to-polls-btn" onClick={() => navigate('/')} style={{color: '#fff'}}>
          <FiArrowLeft size={18} /> Back to Polls
        </button>
        <h2 className="auth-title">Welcome Back</h2>
        <div className="auth-subtitle">Sign in to your account to continue</div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="modern-auth-form">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <div className="auth-form-actions">
            <Link to="#" className="forgot-link">Forgot Password?</Link>
          </div>
          <button type="submit" className="modern-auth-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="signup-link-message">
          Don't have an account? <Link to="/signup" className="login-link" style={{color: '#fff'}}>Sign up here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 