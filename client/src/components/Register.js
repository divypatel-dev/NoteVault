import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Register({ onRegisterSuccess, onSwitchToLogin, logo, apiAuth }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${apiAuth}/register`, formData);
      onRegisterSuccess();
    } catch (err) {
      console.error('Registration API Error:', err.response || err);
      setError(err.response?.data?.message || 'Registration failed. Check console for details.');
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
          <h2>Join NoteVault</h2>
          <p>Secure your ideas with a personal account.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g. john_doe"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="e.g. +1234567890"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
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
            {loading ? 'Creating Account...' : 'Register'}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <button onClick={onSwitchToLogin}>Sign In</button></p>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
