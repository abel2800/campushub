const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/register', async (req, res, next) => {
  try {
    console.log('Registration request received:', {
      body: { ...req.body, password: '[REDACTED]' }
    });
    await authController.register(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    console.log('Login request received:', {
      body: { ...req.body, password: '[REDACTED]' }
    });
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authController.getMe);

module.exports = router; 