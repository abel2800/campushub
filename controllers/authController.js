const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { User } = require('../models');
const { Op } = require('sequelize');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password, department } = req.body;
      console.log('Registration attempt:', { username, email, department }); // Debug log

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        department
      });

      console.log('User created:', user.username); // Debug log

      // Generate token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-fallback-secret',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user.toJSON();

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating account',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findOne({
        where: { email: email.toLowerCase() },
        attributes: ['id', 'username', 'email', 'password', 'department']
      });

      // Debug log
      console.log('Login attempt:', {
        emailProvided: email,
        userFound: !!user
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      // Debug log
      console.log('Password check:', {
        isValid: isValidPassword
      });

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Create token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-fallback-secret',
        { expiresIn: '24h' }
      );

      // Remove sensitive data
      const { password: _, ...userWithoutPassword } = user.toJSON();

      res.json({
        success: true,
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get current user
  getMe: async (req, res) => {
    try {
      const user = await db.User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  },

  // Verify token and get user data
  verifyToken: async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        where: { id: decoded.id },
        attributes: ['id', 'username', 'email', 'avatarUrl', 'department']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};

module.exports = authController; 