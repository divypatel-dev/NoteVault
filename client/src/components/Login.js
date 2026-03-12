import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Login({ onLogin, onSwitchToRegister, logo, apiAuth }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${apiAuth}/login`, {
        identifier,
        password
      });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <img src={logo} alt="Logo" className="auth-logo" />
          <h2>Welcome Back</h2>
          <p>Login with your username, email, or phone number.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username, Email, or Phone</label>
            <input
              type="text"
              placeholder="e.g. john_doe, john@example.com, or +123..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <motion.button 
            type="submit" 
            className="btn-auth"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onSwitchToRegister}>Create Account</button></p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
