// src/models/appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    slotId: {
        type: String,
        required: true
    },
    patient: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say'],
            required: true
        },
        address: {
            type: String,
            trim: true
        },
        reason: {
            type: String,
            required: true,
            trim: true
        }
    },
    doctorInfo: {
        name: {
            type: String,
            required: true
        },
        speciality: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        perPatientTime: {
            type: Number,
            default: 15
        }
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
      slotSerialNumber: { 
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['processing', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better performance
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ 'patient.email': 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;