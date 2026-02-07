// // src/controllers/authController.js
// const User = require('../models/User');
// const { generateAuthToken } = require('../utils/jwt');

// // Register Client
// const registerClient = async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;
    
//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide name, email, and password'
//       });
//     }
    
//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered'
//       });
//     }
    
//     // Create client user
//     const user = new User({
//       name,
//       email: email.toLowerCase(),
//       password,
//       phone,
//       role: 'client'
//     });
    
//     await user.save();
    
//     // Generate token
//     const token = generateAuthToken(user._id, user.role, user.email);
    
//     res.status(201).json({
//       success: true,
//       message: 'Account created successfully',
//       token,
//       user: user.toJSON()
//     });
    
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during registration'
//     });
//   }
// };

// // Register Business (Admin)
// // src/controllers/authController.js - Update registerBusiness
// const registerBusiness = async (req, res) => {
//   try {
//     const { name, email, password, phone, role } = req.body; // Remove businessName
    
//     // Validation - no businessName required
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide name, email, and password'
//       });
//     }
    
//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered'
//       });
//     }
    
//     // Create admin or staff user
//     const user = new User({
//       name,
//       email: email.toLowerCase(),
//       password,
//       phone,
//       role: role || 'admin' // Default to admin if not specified
//     });
    
//     await user.save();
    
//     // Generate token
//     const token = generateAuthToken(user._id, user.role, user.email);
    
//     res.status(201).json({
//       success: true,
//       message: `${role || 'Admin'} account created successfully`,
//       token,
//       user: user.toJSON()
//     });
    
//   } catch (error) {
//     console.error('Business registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during registration'
//     });
//   }
// };

// // Login
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password'
//       });
//     }
    
//     // Find user
//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }
    
//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }
    
//     // Check if user is active
//     if (!user.isActive) {
//       return res.status(403).json({
//         success: false,
//         message: 'Account is deactivated'
//       });
//     }
    
//     // Generate token
//     const token = generateAuthToken(user._id, user.role, user.email);
    
//     res.json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: user.toJSON()
//     });
    
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error during login'
//     });
//   }
// };

// // Get current user
// const getCurrentUser = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       user: req.user.toJSON()
//     });
//   } catch (error) {
//     console.error('Get current user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// };

// module.exports = {
//   registerClient,
//   registerBusiness,
//   login,
//   getCurrentUser
// };


// src/controllers/authController.js
const User = require('../models/User');
const { generateAuthToken } = require('../utils/jwt');

// Register Client - UPDATED VERSION
const registerClient = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address } = req.body;
    
    console.log('Registration data received:', {
      name, email, phone, dateOfBirth, gender, address
    });
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    
    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date of birth format'
        });
      }
    }
    
    // Validate gender if provided
    if (gender) {
      const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender selection'
        });
      }
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Parse date of birth
    let parsedDateOfBirth = null;
    if (dateOfBirth) {
      parsedDateOfBirth = new Date(dateOfBirth);
    }
    
    // Create client user with new fields
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      dateOfBirth: parsedDateOfBirth,
      gender: gender || '',
      address: address || '',
      role: 'client'
    });
    
    await user.save();
    
    // Generate token
    const token = generateAuthToken(user._id, user.role, user.email);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Register Business (Admin/Staff) - KEEP AS IS
const registerBusiness = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
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
      phone: phone || '',
      role: role || 'admin'
      // Note: No dateOfBirth, gender, address for business users
    });
    
    await user.save();
    
    // Generate token
    const token = generateAuthToken(user._id, user.role, user.email);
    
    res.status(201).json({
      success: true,
      message: `${role || 'Admin'} account created successfully`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Business registration error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login - KEEP AS IS
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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user - UPDATE to include new fields
const getCurrentUser = async (req, res) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        isActive: user.isActive,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
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