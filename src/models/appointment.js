// models/appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    patientEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    patientPhone: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    startTime: {
        type: String, // HH:MM
        required: true
    },
    endTime: {
        type: String, // HH:MM
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled'
    },
    appointmentType: {
        type: String,
        enum: ['checkup', 'followup', 'consultation', 'emergency'],
        default: 'consultation'
    },
    notes: {
        type: String,
        trim: true
    },
    symptoms: String,
    previousMedicalHistory: String,
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    cancellationReason: String,
    cancelledAt: Date
}, {
    timestamps: true
});

// Indexes for faster queries
appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });
appointmentSchema.index({ patientEmail: 1, date: 1 });
appointmentSchema.index({ date: 1, startTime: 1 });
appointmentSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);