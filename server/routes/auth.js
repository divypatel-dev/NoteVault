const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('--- REGISTER REQUEST ---');
    console.log('Body:', req.body);
    const { username, email, password, phoneNumber } = req.body;
    
    // Basic validation
    if (!username || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() }, 
        { username: username }, 
        { phoneNumber: phoneNumber }
      ] 
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({ message: 'User with this email, username or phone already exists' });
    }

    const user = new User({ username, email, password, phoneNumber });
    await user.save();
    
    console.log('User registered successfully:', username);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error details:', err);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
});

// Login (email or username or phone)
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Find user by any of the fields
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
        { phoneNumber: identifier }
      ]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
