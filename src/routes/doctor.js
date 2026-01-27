// src/routes/doctor.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// POST /doctors - Create doctor
router.post('/', doctorController.createDoctor);

// GET /doctors - Get all doctors
router.get('/', doctorController.getAllDoctors);

// POST /doctors/:id/generate-slots - Generate slots
router.post('/:id/generate-slots', doctorController.generateDoctorSlots);

// GET /doctors/:id/slots/:date - Get slots for date
router.get('/:id/slots/:date', doctorController.getSlotsForDate);

// PUT /doctors/:id/schedule - Update schedule
router.put('/:id/schedule', doctorController.updateSchedule);

// PUT /doctors/:id - Update doctor
router.put('/:id', doctorController.updateDoctor);

// GET /doctors/:id - Get single doctor
router.get('/:id', doctorController.getDoctor);

// DELETE /doctors/:id - Delete doctor
router.delete('/:id', doctorController.deleteDoctor); // NEW ROUTE

module.exports = router;