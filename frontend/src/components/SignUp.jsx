import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import './Styles/Auth.css';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      toast.error('Passwords do not match!');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register({ name, email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('authchange'));
      toast.success('Signup successful!');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Signup failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg" style={{height: '1000px'}}>
      <div className="auth-single-card">
        <button className="back-to-polls-btn" onClick={() => navigate('/')} style={{color: '#fff'}}>
          <FiArrowLeft size={18} /> Back to Polls
        </button>
        <h2 className="auth-title">Create Account</h2>
        <div className="auth-subtitle">Join us and start creating polls today</div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="modern-auth-form">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="modern-auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="signup-link-message">
          Already have an account? <Link to="/login" className="login-link" style={{color: '#fff'}}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp; 