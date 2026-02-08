const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const staffController = require('../controllers/staffController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All staff routes require authentication and staff role
router.use(authMiddleware);
router.use(requireRole('staff')); // Allow both staff and admin

// Staff profile routes
router.get('/profile', staffController.getStaffProfile);
router.put('/profile', staffController.updateStaffProfile);
router.put('/password', staffController.updateStaffPassword);


// Staff can view clients
router.get('/clients', adminController.getClientsForStaff);

module.exports = router;