// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireRole('admin'));



// Admin profile routes (should come BEFORE other routes)
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.put('/password', adminController.updateAdminPassword);

// User management routes
router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/clients', adminController.getClientsForStaff); // new added

router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;