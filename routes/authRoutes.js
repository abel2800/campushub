const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', authController.register);
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Debug log

    // Find user by email
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      attributes: ['id', 'email', 'password', 'username', 'department'] 
    });

    if (!user) {
      console.log('User not found:', email); // Debug log
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email); // Debug log
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', authController.getMe);

router.get('/verify', authMiddleware, async (req, res) => {
  try {
    res.json({ 
      valid: true, 
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        department: req.user.department
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/refresh-token', authController.refreshToken);

module.exports = router; 