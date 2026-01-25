// src/controllers/authController.js
const User = require('../models/User');
const { generateAuthToken } = require('../utils/jwt');

// Register Client
const registerClient = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create client user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'client'
    });
    
    await user.save();
    
    // Generate token
    const token = generateAuthToken(user._id, user.role, user.email);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Register Business (Admin)
// src/controllers/authController.js - Update registerBusiness
const registerBusiness = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body; // Remove businessName
    
    // Validation - no businessName required
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create admin or staff user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'admin' // Default to admin if not specified
    });
    
    await user.save();
    
    // Generate token
    const token = generateAuthToken(user._id, user.role, user.email);
    
    res.status(201).json({
      success: true,
      message: `${role || 'Admin'} account created successfully`,
      token,
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Business registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Generate token
    const token = generateAuthToken(user._id, user.role, user.email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerClient,
  registerBusiness,
  login,
  getCurrentUser
};