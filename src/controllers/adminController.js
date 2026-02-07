// // src/controllers/adminController.js
// const User = require('../models/User');
// const { generateAuthToken } = require('../utils/jwt');

// // Create user (admin only)
// const createUser = async (req, res) => {
//   try {
//     const { name, email, password, phone, role, permissions } = req.body;
//     const createdBy = req.user._id; // Admin who is creating
    
//     // Validation
//     if (!name || !email || !password || !role) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide name, email, password, and role'
//       });
//     }
    
//     // Validate role
//     if (!['admin', 'staff', 'client'].includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid role. Must be admin, staff, or client'
//       });
//     }
    
//     // Check if user exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email already registered'
//       });
//     }
    
//     // Set default permissions based on role
//     let userPermissions = permissions || {};
//     if (role === 'admin') {
//       userPermissions = {
//         manageServices: true,
//         manageAppointments: true,
//         manageClients: true,
//         manageStaff: true,
//         viewReports: true
//       };
//     }
    
//     // Create user
//     const user = new User({
//       name,
//       email: email.toLowerCase(),
//       password,
//       phone,
//       role,
//       permissions: userPermissions,
//       createdBy,
//       businessName: req.user.businessName || 'Shared Business' // Inherit from admin's business
//     });
    
//     await user.save();
    
//     res.status(201).json({
//       success: true,
//       message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
//       user: user.toJSON()
//     });
    
//   } catch (error) {
//     console.error('Create user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while creating user'
//     });
//   }
// };

// // Get all users (admin only)
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({})
//       .select('-password')
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       count: users.length,
//       users
//     });
    
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching users'
//     });
//   }
// };



// // In src/controllers/adminController.js, add:
// // In src/controllers/adminController.js, add this function:
// const getClientsForStaff = async (req, res) => {
//   try {
//     // Get only client users
//     const clients = await User.find({ role: 'client' })
//       .select('-password')
//       .sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       count: clients.length,
//       clients
//     });
    
//   } catch (error) {
//     console.error('Get clients for staff error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching clients'
//     });
//   }
// };
// // Update user
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
    
//     // Remove sensitive fields
//     delete updates.password;
//     delete updates.email;
//     delete updates._id;
    
//     const user = await User.findByIdAndUpdate(
//       id,
//       updates,
//       { new: true, runValidators: true }
//     ).select('-password');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'User updated successfully',
//       user
//     });
    
//   } catch (error) {
//     console.error('Update user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating user'
//     });
//   }
// };

// // Delete user (soft delete - deactivate)
// // src/controllers/adminController.js - Update the deleteUser function
// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // First check if user exists
//     const user = await User.findById(id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }
    
//     // Check if trying to delete self
//     if (req.user._id.toString() === id) {
//       return res.status(400).json({
//         success: false,
//         message: 'You cannot delete your own account'
//       });
//     }
    
//     // Actually delete the user from database
//     await User.findByIdAndDelete(id);
    
//     res.json({
//       success: true,
//       message: 'User deleted permanently from database',
//       deletedUser: user.toJSON()
//     });
    
//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while deleting user'
//     });
//   }
// };


// // Add these functions to your existing adminController.js
// // Place them before the module.exports at the bottom

// // Get admin profile
// const getAdminProfile = async (req, res) => {
//   try {
//     // User is already attached to req by auth middleware
//     const user = await User.findById(req.user._id).select('-password');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'Admin not found'
//       });
//     }
    
//     res.json({
//       success: true,
//       user
//     });
//   } catch (error) {
//     console.error('Error fetching admin profile:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching profile'
//     });
//   }
// };

// // Update admin profile
// const updateAdminProfile = async (req, res) => {
//   try {
//     const { name, phone } = req.body;
    
//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name is required'
//       });
//     }
    
//     // Don't allow email or role changes
//     const updates = {};
//     if (name) updates.name = name;
//     if (phone !== undefined) updates.phone = phone;
    
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       updates,
//       { new: true, runValidators: true }
//     ).select('-password');
    
//     res.json({
//       success: true,
//       message: 'Admin profile updated successfully',
//       user
//     });
//   } catch (error) {
//     console.error('Error updating admin profile:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating profile'
//     });
//   }
// };

// // Update admin password
// const updateAdminPassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
    
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Current password and new password are required'
//       });
//     }
    
//     const user = await User.findById(req.user._id);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'Admin not found'
//       });
//     }
    
//     // Verify current password
//     const isPasswordValid = await user.comparePassword(currentPassword);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Current password is incorrect'
//       });
//     }
    
//     // Update password
//     user.password = newPassword;
//     await user.save();
    
//     res.json({
//       success: true,
//       message: 'Password updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating admin password:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating password'
//     });
//   }
// };



// module.exports = {
//   createUser,
//   getAllUsers,
//   getClientsForStaff,
//   updateUser,
//   deleteUser,
//     getAdminProfile,      // Add this
//   updateAdminProfile,   // Add this
//   updateAdminPassword 
// };



// src/controllers/adminController.js
const User = require('../models/User');
const { generateAuthToken } = require('../utils/jwt');

// Create user (admin only) - UPDATED VERSION
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, dateOfBirth, gender, address } = req.body;
    const createdBy = req.user._id; // Admin who is creating
    
    console.log('Admin creating user with data:', {
      name, email, phone, role, dateOfBirth, gender, address
    });
    
    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }
    
    // Validate role
    if (!['admin', 'staff', 'client'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, staff, or client'
      });
    }
    
    // If creating a client, validate client-specific fields
    if (role === 'client') {
      if (!dateOfBirth) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth is required for clients'
        });
      }
      if (!gender) {
        return res.status(400).json({
          success: false,
          message: 'Gender is required for clients'
        });
      }
      
      // Validate gender
      const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender selection'
        });
      }
      
      // Parse date of birth
      let parsedDateOfBirth;
      try {
        parsedDateOfBirth = new Date(dateOfBirth);
        if (isNaN(parsedDateOfBirth.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date of birth format'
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
    
    // Prepare user data based on role
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role,
      createdBy,
      isActive: true,
      timezone: 'America/New_York'
    };
    
    // Add client-specific fields only for clients
    if (role === 'client') {
      userData.dateOfBirth = new Date(dateOfBirth);
      userData.gender = gender;
      userData.address = address || '';
    }
    
    // For admin/staff, don't include these fields (they'll be null/default)
    if (role === 'admin' || role === 'staff') {
      // Set default permissions for admin/staff
      userData.permissions = {
        manageServices: role === 'admin',
        manageAppointments: role === 'admin' || role === 'staff',
        manageClients: role === 'admin',
        manageStaff: role === 'admin',
        viewReports: role === 'admin'
      };
    }
    
    // Create user
    const user = new User(userData);
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
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
        createdAt: user.createdAt,
        permissions: user.permissions
      }
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    
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
      message: 'Server error while creating user',
      error: error.message
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// In src/controllers/adminController.js, add:
// In src/controllers/adminController.js, add this function:
const getClientsForStaff = async (req, res) => {
  try {
    // Get only client users
    const clients = await User.find({ role: 'client' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: clients.length,
      clients
    });
    
  } catch (error) {
    console.error('Get clients for staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clients'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Updating user:', id, 'with data:', updates);
    
    // Get the user first to check role
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove sensitive fields that shouldn't be updated
    delete updates.password;
    delete updates.email;
    delete updates._id;
    delete updates.role; // Don't allow role change through update
    
    // If updating a client, validate client-specific fields
    if (existingUser.role === 'client') {
      if (updates.gender) {
        const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
        if (!validGenders.includes(updates.gender)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid gender selection'
          });
        }
      }
      
      if (updates.dateOfBirth) {
        try {
          updates.dateOfBirth = new Date(updates.dateOfBirth);
          if (isNaN(updates.dateOfBirth.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid date of birth format'
          });
        }
      }
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
};

// Delete user (soft delete - deactivate)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if user exists
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if trying to delete self
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Actually delete the user from database
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'User deleted permanently from database',
      deletedUser: user.toJSON()
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    // Don't allow email or role changes
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Update admin password
const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password'
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getClientsForStaff,
  updateUser,
  deleteUser,
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword 
};