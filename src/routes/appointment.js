const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware, requireRole } = require('../middleware/auth');


router.use((req, res, next) => {
    console.log(`📝 Appointment route: ${req.method} ${req.path}`);
    console.log(`👤 User: ${req.user?.email || 'No user'}`);
    next();
});

router.post('/client-book', appointmentController.createClientAppointment);
// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /appointments - Create new appointment (admin/staff only)
router.post('/', requireRole('admin', 'staff'), appointmentController.createAppointment);

// GET /appointments - Get all appointments (with optional filters) - admin/staff only
router.get('/', requireRole('admin', 'staff'), appointmentController.getAllAppointments);

// GET /appointments/today - Get today's appointments - admin/staff only
router.get('/today', requireRole('admin', 'staff'), appointmentController.getTodaysAppointments);

// GET /appointments/:id - Get appointment by ID - admin/staff or the patient themselves
router.get('/:id', appointmentController.getAppointment);

// GET /appointments/patient/:email - Get appointments by patient email - admin/staff or the patient themselves
router.get('/patient/:email', appointmentController.getAppointmentsByPatientEmail);

// PUT /appointments/:id/status - Update appointment status - admin/staff only
router.put('/:id/status', requireRole('admin', 'staff'), appointmentController.updateAppointmentStatus);

// Add this route for client cancellations
router.put('/:id/cancel', authMiddleware, requireRole('client'), appointmentController.cancelClientAppointment);

// PUT /appointments/:id/reschedule - Reschedule appointment (client only)
router.put('/:id/reschedule', authMiddleware, requireRole('client'), appointmentController.rescheduleAppointment);

// PUT /appointments/:id - Update appointment (for rescheduling)
router.put('/:id', requireRole('admin', 'staff'), appointmentController.updateAppointment);

// DELETE /appointments/:id - Delete appointment - admin only
router.delete('/:id', requireRole('admin'), appointmentController.deleteAppointment);

module.exports = router;