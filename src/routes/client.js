// src/routes/client.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All client routes require authentication and client role
router.use(authMiddleware);
router.use(requireRole('client'));

// Client profile routes
router.get('/profile', clientController.getClientProfile);
router.put('/profile', clientController.updateClientProfile);
router.put('/password', clientController.updateClientPassword);

module.exports = router;