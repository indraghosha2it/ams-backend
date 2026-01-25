// src/utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

const generateAuthToken = (userId, role, email) => {
  return jwt.sign(
    {
      userId: userId.toString(),
      role,
      email,
      type: 'auth'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

module.exports = {
  generateAuthToken,
  verifyToken
};