// src/controllers/clientController.js
const User = require('../models/User');

// // Get client profile
// const getClientProfile = async (req, res) => {
//   try {
//     // User is already attached to req by auth middleware
//     const user = await User.findById(req.user._id).select('-password');
    
//     res.json({
//       success: true,
//       user
//     });
//   } catch (error) {
//     console.error('Error fetching client profile:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching profile'
//     });
//   }
// };

// // Update client profile
// const updateClientProfile = async (req, res) => {
//   try {
//     const { name, phone, timezone } = req.body;
    
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
//     if (timezone) updates.timezone = timezone;
    
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       updates,
//       { new: true, runValidators: true }
//     ).select('-password');
    
//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user
//     });
//   } catch (error) {
//     console.error('Error updating client profile:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating profile'
//     });
//   }
// };
// Update client profile - MODIFIED TO INCLUDE NEW FIELDS
// Update client profile - REMOVED PHONE VALIDATION
const updateClientProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, address } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }
    
    // Don't allow email or role changes
    const updates = {};
    if (name && name.trim() !== '') updates.name = name.trim();
    
    // Phone is optional, but if provided, store it as-is
    if (phone !== undefined) {
      updates.phone = phone.trim();
    }
    
    // Handle new fields
    if (dateOfBirth !== undefined) {
      // Convert string date to Date object, or null if empty
      updates.dateOfBirth = dateOfBirth && dateOfBirth.trim() !== '' 
        ? new Date(dateOfBirth) 
        : null;
    }
    
    if (gender !== undefined) updates.gender = gender;
    if (address !== undefined) updates.address = address.trim();
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating client profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Get client profile - MODIFIED TO INCLUDE NEW FIELDS
const getClientProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user._id).select('-password');
    
    // Format dateOfBirth for response
    const userObj = user.toObject();
    if (userObj.dateOfBirth) {
      // Convert to ISO string for easy parsing on frontend
      userObj.dateOfBirth = user.dateOfBirth.toISOString().split('T')[0];
    }
    
    res.json({
      success: true,
      user: userObj
    });
  } catch (error) {
    console.error('Error fetching client profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update client password
// Update client password
const updateClientPassword = async (req, res) => {
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
        message: 'User not found'
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
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password'
    });
  }
};

module.exports = {
  getClientProfile,
  updateClientProfile,
  updateClientPassword
};