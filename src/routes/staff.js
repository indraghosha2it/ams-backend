const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All staff routes require authentication and staff role
router.use(authMiddleware);
router.use(requireRole('staff', 'admin')); // Allow both staff and admin

// Staff can view clients
router.get('/clients', adminController.getClientsForStaff);

module.exports = router;