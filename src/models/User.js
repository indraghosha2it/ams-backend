

// // src/models/User.js - ADD MISSING IMPORT
// const mongoose = require('mongoose'); // ADD THIS LINE
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'staff', 'client'],
//     default: 'client'
//   },
//   phone: {
//     type: String,
//     trim: true
//   },
//   businessName: {
//     type: String,
//     default: ''
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   timezone: {
//     type: String,
//     default: 'America/New_York'
//   },
//   // Add permissions for staff
//   permissions: {
//     manageServices: { type: Boolean, default: false },
//     manageAppointments: { type: Boolean, default: false },
//     manageClients: { type: Boolean, default: false },
//     manageStaff: { type: Boolean, default: false },
//     viewReports: { type: Boolean, default: false }
//   },
//   // Add createdBy to track who created this user
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Remove password from JSON response
// userSchema.methods.toJSON = function() {
//   const user = this.toObject();
//   delete user.password;
//   return user;
// };

// module.exports = mongoose.model('User', userSchema);


// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'client'],
    default: 'client'
  },
  phone: {
    type: String,
    trim: true
  },

    // Client-specific fields - make them optional initially for backward compatibility
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say', ''],
    default: ''
  },
  address: {
    type: String,
    default: ''
  },

  isActive: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  // Add createdBy to track who created this user (optional)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);