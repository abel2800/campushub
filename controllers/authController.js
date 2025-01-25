const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

// Register new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, department } = req.body;
    const normalizedEmail = email.toLowerCase(); // Normalize email to lowercase
    console.log('Registration attempt:', { username, email: normalizedEmail });

    // Check if email exists (case-insensitive)
    const existingEmail = await db.User.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn('LOWER', db.Sequelize.col('email')),
        normalizedEmail
      )
    });

    if (existingEmail) {
      console.log('Email already exists:', normalizedEmail);
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Check if username exists (case-insensitive)
    const existingUsername = await db.User.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn('LOWER', db.Sequelize.col('username')),
        username.toLowerCase()
      )
    });

    if (existingUsername) {
      console.log('Username already exists:', username);
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with normalized email
    const user = await db.User.create({
      firstName,
      lastName,
      username,
      email: normalizedEmail, // Store email in lowercase
      password: hashedPassword,
      department
    });

    console.log('User created successfully:', user.id);

    res.status(201).json({
      message: 'Registration successful! Please login.',
      success: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating account', 
      error: error.message 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase(); // Normalize email to lowercase
    console.log('Login attempt:', { email: normalizedEmail });

    // Find user by email (case-insensitive)
    const user = await db.User.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn('LOWER', db.Sequelize.col('email')),
        normalizedEmail
      )
    });

    if (!user) {
      console.log('User not found:', normalizedEmail);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', normalizedEmail);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        department: user.department
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

module.exports = {
  register,
  login,
  getMe
}; 