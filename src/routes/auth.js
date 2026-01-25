// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register/client', authController.registerClient);
router.post('/register/business', authController.registerBusiness);
router.post('/login', authController.login);

// Protected route
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;