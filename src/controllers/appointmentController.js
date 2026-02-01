const mongoose = require('mongoose');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const { timeToMinutes, formatTime } = require('../utils/slotGenerator');

// Create new appointment
// Create new appointment
exports.createAppointment = async (req, res) => {
    try {
        console.log('📥 === CREATE APPOINTMENT REQUEST ===');
        console.log('📋 Headers:', req.headers);
        console.log('👤 User:', req.user);
        console.log('📦 Body received:', JSON.stringify(req.body, null, 2));
        
        const {
            doctorId,
            slotId,
            patient,
            appointmentDate,
            appointmentTime,
            status = 'pending'
        } = req.body;
        
        // Validate required fields
        if (!doctorId || !slotId || !patient || !appointmentDate || !appointmentTime) {
            console.log('❌ Missing required fields');
            console.log('- doctorId:', doctorId);
            console.log('- slotId:', slotId);
            console.log('- patient:', patient);
            console.log('- appointmentDate:', appointmentDate);
            console.log('- appointmentTime:', appointmentTime);
            
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: doctorId, slotId, patient, appointmentDate, appointmentTime'
            });
        }
        
        // Validate patient data
        if (!patient.fullName || !patient.email || !patient.phone || !patient.dateOfBirth || !patient.gender || !patient.reason) {
            console.log('❌ Missing required patient information');
            console.log('- fullName:', patient.fullName);
            console.log('- email:', patient.email);
            console.log('- phone:', patient.phone);
            console.log('- dateOfBirth:', patient.dateOfBirth);
            console.log('- gender:', patient.gender);
            console.log('- reason:', patient.reason);
            
            return res.status(400).json({
                success: false,
                message: 'Missing required patient information'
            });
        }
        
        console.log('🔍 Looking for doctor:', doctorId);
        
        // Find doctor
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            console.log('❌ Doctor not found for ID:', doctorId);
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        console.log('✅ Doctor found:', doctor.name);
        console.log('📊 Doctor has', doctor.timeSlots?.length || 0, 'slots');
        
        // Find the specific slot in doctor's timeSlots
        let slotIndex = doctor.timeSlots.findIndex(slot => 
            slot._id && slot._id.toString() === slotId
        );
        
        console.log('🔍 Looking for slot with ID:', slotId);
        console.log('📋 Slot search result (by _id):', slotIndex);
        
        if (slotIndex === -1) {
            // If slot not found by _id, try to find by date and time
            console.log('⚠️ Slot not found by _id, trying by date and time...');
            const formattedDate = new Date(appointmentDate).toISOString().split('T')[0];
            
            doctor.timeSlots.forEach((slot, index) => {
                try {
                    let slotDateStr;
                    if (slot.date) {
                        if (typeof slot.date === 'object' && slot.date.$date) {
                            // MongoDB format
                            const dateObj = new Date(slot.date.$date);
                            slotDateStr = dateObj.toISOString().split('T')[0];
                        } else {
                            // Regular date
                            const dateObj = new Date(slot.date);
                            slotDateStr = dateObj.toISOString().split('T')[0];
                        }
                        
                        if (slotDateStr === formattedDate && slot.startTime === appointmentTime) {
                            console.log(`✅ Found slot at index ${index} by date/time match`);
                            slotIndex = index;
                        }
                    }
                } catch (error) {
                    console.log(`⚠️ Error processing slot ${index}:`, error.message);
                }
            });
        }
        
        if (slotIndex === -1) {
            console.log('❌ Slot not found in doctor timeSlots');
            console.log('📅 Looking for date:', appointmentDate);
            console.log('⏰ Looking for time:', appointmentTime);
            console.log('📋 Available slots sample:', doctor.timeSlots?.slice(0, 3));
            
            return res.status(404).json({
                success: false,
                message: 'Time slot not found or no longer available'
            });
        }
        
        console.log('✅ Slot found at index:', slotIndex);
        console.log('📋 Slot details:', doctor.timeSlots[slotIndex]);
        
        // Check if slot is available
        if (doctor.timeSlots[slotIndex].status !== 'available') {
            console.log('❌ Slot not available. Current status:', doctor.timeSlots[slotIndex].status);
            return res.status(409).json({
                success: false,
                message: 'This time slot is no longer available',
                currentStatus: doctor.timeSlots[slotIndex].status
            });
        }
        
        // Calculate end time based on doctor's perPatientTime
        const startTime = doctor.timeSlots[slotIndex].startTime;
        const endTime = doctor.timeSlots[slotIndex].endTime;
        
        // Parse appointment date properly
        let parsedAppointmentDate;
        try {
            parsedAppointmentDate = new Date(appointmentDate);
            if (isNaN(parsedAppointmentDate.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            console.log('❌ Invalid appointment date:', appointmentDate);
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment date format'
            });
        }
        
        // Parse patient date of birth
        let parsedPatientDOB;
        try {
            parsedPatientDOB = new Date(patient.dateOfBirth);
            if (isNaN(parsedPatientDOB.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            console.log('❌ Invalid patient date of birth:', patient.dateOfBirth);
            return res.status(400).json({
                success: false,
                message: 'Invalid patient date of birth format'
            });
        }
        
        // Create appointment with doctor information
        const appointmentData = {
            doctorId,
            slotId,
            patient: {
                ...patient,
                dateOfBirth: parsedPatientDOB
            },
            doctorInfo: {
                name: doctor.name,
                speciality: doctor.speciality,
                designation: doctor.designation,
                location: doctor.location || '',
                email: doctor.email,
                perPatientTime: doctor.perPatientTime || 15
            },
            appointmentDate: parsedAppointmentDate,
            appointmentTime: startTime,
            endTime: endTime,
            status
        };
        
        console.log('💾 Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
        
        // Start a transaction to ensure both operations succeed or fail together
        console.log('🔄 Starting database transaction...');
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // 1. Create the appointment
            const appointment = new Appointment(appointmentData);
            await appointment.save({ session });
            
            console.log('✅ Appointment saved to database');
            console.log('- Appointment ID:', appointment._id);
            console.log('- Patient:', patient.fullName);
            
            // 2. Update doctor's slot status to 'booked'
            doctor.timeSlots[slotIndex].status = 'booked';
            doctor.timeSlots[slotIndex].patientInfo = {
                name: patient.fullName,
                phone: patient.phone,
                email: patient.email,
                appointmentId: appointment._id
            };
            
            await doctor.save({ session });
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ Transaction committed successfully');
            console.log('✅ Doctor slot updated to "booked"');
            
            // Populate appointment with doctor details for response
            const populatedAppointment = await Appointment.findById(appointment._id)
                .populate('doctorId', 'name email speciality designation location');
            
            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                data: populatedAppointment
            });
            
        } catch (transactionError) {
            // Rollback the transaction
            console.log('❌ Transaction failed, rolling back...');
            await session.abortTransaction();
            session.endSession();
            
            console.error('❌ Transaction error:', transactionError);
            console.error('❌ Error name:', transactionError.name);
            console.error('❌ Error message:', transactionError.message);
            console.error('❌ Error stack:', transactionError.stack);
            
            throw transactionError;
        }
        
    } catch (error) {
        console.error('❌ Error creating appointment:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            console.error('❌ Validation errors:', messages);
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + messages.join(', ')
            });
        }
        
        // Check for MongoDB duplicate key error
        if (error.code === 11000) {
            console.error('❌ Duplicate key error:', error.keyValue);
            return res.status(400).json({
                success: false,
                message: 'Duplicate appointment detected'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to book appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const { doctorId, status, date } = req.query;
        const filter = {};
        
        if (doctorId) filter.doctorId = doctorId;
        if (status) filter.status = status;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            filter.appointmentDate = { $gte: startDate, $lte: endDate };
        }
        
        const appointments = await Appointment.find(filter)
            .populate('doctorId', 'name speciality designation location email')
            .sort({ appointmentDate: 1, appointmentTime: 1 });
        
        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get appointment by ID
// Get appointment by ID
exports.getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('doctorId', 'name email speciality designation location');
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Authorization check: admin/staff can view all, patients can only view their own
        const isAdminOrStaff = req.user.role === 'admin' || req.user.role === 'staff';
        const isPatient = req.user.role === 'client';
        const isPatientOwner = isPatient && 
            appointment.patient.email.toLowerCase() === req.user.email.toLowerCase();
        
        if (!isAdminOrStaff && !isPatientOwner) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this appointment'
            });
        }
        
        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get appointments by patient email
exports.getAppointmentsByPatientEmail = async (req, res) => {
    try {
        const { email } = req.params;
        
        // Authorization check: admin/staff can view all, patients can only view their own
        const isAdminOrStaff = req.user.role === 'admin' || req.user.role === 'staff';
        const isPatient = req.user.role === 'client';
        
        if (isPatient && email.toLowerCase() !== req.user.email.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own appointments'
            });
        }
        
        const appointments = await Appointment.find({ 'patient.email': email.toLowerCase() })
            .populate('doctorId', 'name speciality designation location')
            .sort({ appointmentDate: -1 });
        
        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // If cancelling, we should also free up the doctor's slot
        if (status === 'cancelled' && appointment.status !== 'cancelled') {
            const doctor = await Doctor.findById(appointment.doctorId);
            if (doctor) {
                const slotIndex = doctor.timeSlots.findIndex(slot => 
                    slot._id.toString() === appointment.slotId
                );
                
                if (slotIndex !== -1) {
                    doctor.timeSlots[slotIndex].status = 'available';
                    doctor.timeSlots[slotIndex].patientInfo = null;
                    await doctor.save();
                }
            }
        }
        
        appointment.status = status;
        appointment.updatedAt = new Date();
        await appointment.save();
        
        res.json({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Free up the doctor's slot
        const doctor = await Doctor.findById(appointment.doctorId);
        if (doctor) {
            const slotIndex = doctor.timeSlots.findIndex(slot => 
                slot._id.toString() === appointment.slotId
            );
            
            if (slotIndex !== -1) {
                doctor.timeSlots[slotIndex].status = 'available';
                doctor.timeSlots[slotIndex].patientInfo = null;
                await doctor.save();
            }
        }
        
        await Appointment.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get today's appointments
exports.getTodaysAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointments = await Appointment.find({
            appointmentDate: { $gte: today, $lt: tomorrow }
        })
        .populate('doctorId', 'name speciality designation')
        .sort({ appointmentTime: 1 });
        
        res.json({
            success: true,
            date: today,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Create new appointment for clients (with processing status)
exports.createClientAppointment = async (req, res) => {
    try {
        console.log('📥 === CREATE CLIENT APPOINTMENT REQUEST ===');
        console.log('📋 Headers:', req.headers);
        console.log('📦 Body received:', JSON.stringify(req.body, null, 2));
        
        const {
            doctorId,
            slotId,
            patient,
            appointmentDate,
            appointmentTime
        } = req.body;
        
        // Set status to 'processing' for client bookings
        const status = 'processing';
        
        // Validate required fields
        if (!doctorId || !slotId || !patient || !appointmentDate || !appointmentTime) {
            console.log('❌ Missing required fields');
            console.log('- doctorId:', doctorId);
            console.log('- slotId:', slotId);
            console.log('- patient:', patient);
            console.log('- appointmentDate:', appointmentDate);
            console.log('- appointmentTime:', appointmentTime);
            
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: doctorId, slotId, patient, appointmentDate, appointmentTime'
            });
        }
        
        // Validate patient data
        if (!patient.fullName || !patient.email || !patient.phone || !patient.dateOfBirth || !patient.gender || !patient.reason) {
            console.log('❌ Missing required patient information');
            console.log('- fullName:', patient.fullName);
            console.log('- email:', patient.email);
            console.log('- phone:', patient.phone);
            console.log('- dateOfBirth:', patient.dateOfBirth);
            console.log('- gender:', patient.gender);
            console.log('- reason:', patient.reason);
            
            return res.status(400).json({
                success: false,
                message: 'Missing required patient information'
            });
        }
        
        console.log('🔍 Looking for doctor:', doctorId);
        
        // Find doctor
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            console.log('❌ Doctor not found for ID:', doctorId);
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        console.log('✅ Doctor found:', doctor.name);
        console.log('📊 Doctor has', doctor.timeSlots?.length || 0, 'slots');
        
        // Find the specific slot in doctor's timeSlots
        let slotIndex = doctor.timeSlots.findIndex(slot => 
            slot._id && slot._id.toString() === slotId
        );
        
        console.log('🔍 Looking for slot with ID:', slotId);
        console.log('📋 Slot search result (by _id):', slotIndex);
        
        if (slotIndex === -1) {
            // If slot not found by _id, try to find by date and time
            console.log('⚠️ Slot not found by _id, trying by date and time...');
            const formattedDate = new Date(appointmentDate).toISOString().split('T')[0];
            
            doctor.timeSlots.forEach((slot, index) => {
                try {
                    let slotDateStr;
                    if (slot.date) {
                        if (typeof slot.date === 'object' && slot.date.$date) {
                            // MongoDB format
                            const dateObj = new Date(slot.date.$date);
                            slotDateStr = dateObj.toISOString().split('T')[0];
                        } else {
                            // Regular date
                            const dateObj = new Date(slot.date);
                            slotDateStr = dateObj.toISOString().split('T')[0];
                        }
                        
                        if (slotDateStr === formattedDate && slot.startTime === appointmentTime) {
                            console.log(`✅ Found slot at index ${index} by date/time match`);
                            slotIndex = index;
                        }
                    }
                } catch (error) {
                    console.log(`⚠️ Error processing slot ${index}:`, error.message);
                }
            });
        }
        
        if (slotIndex === -1) {
            console.log('❌ Slot not found in doctor timeSlots');
            console.log('📅 Looking for date:', appointmentDate);
            console.log('⏰ Looking for time:', appointmentTime);
            console.log('📋 Available slots sample:', doctor.timeSlots?.slice(0, 3));
            
            return res.status(404).json({
                success: false,
                message: 'Time slot not found or no longer available'
            });
        }
        
        console.log('✅ Slot found at index:', slotIndex);
        console.log('📋 Slot details:', doctor.timeSlots[slotIndex]);
        
        // Check if slot is available (allow 'processing' status if re-booking)
        const slotStatus = doctor.timeSlots[slotIndex].status;
        if (slotStatus !== 'available' && slotStatus !== 'processing') {
            console.log('❌ Slot not available. Current status:', slotStatus);
            return res.status(409).json({
                success: false,
                message: 'This time slot is no longer available',
                currentStatus: slotStatus
            });
        }
        
        // Calculate end time based on doctor's perPatientTime
        const startTime = doctor.timeSlots[slotIndex].startTime;
        const endTime = doctor.timeSlots[slotIndex].endTime;
        
        // Parse appointment date properly
        let parsedAppointmentDate;
        try {
            parsedAppointmentDate = new Date(appointmentDate);
            if (isNaN(parsedAppointmentDate.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            console.log('❌ Invalid appointment date:', appointmentDate);
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment date format'
            });
        }
        
        // Parse patient date of birth
        let parsedPatientDOB;
        try {
            parsedPatientDOB = new Date(patient.dateOfBirth);
            if (isNaN(parsedPatientDOB.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            console.log('❌ Invalid patient date of birth:', patient.dateOfBirth);
            return res.status(400).json({
                success: false,
                message: 'Invalid patient date of birth format'
            });
        }
        
        // Create appointment with doctor information
        const appointmentData = {
            doctorId,
            slotId,
            patient: {
                ...patient,
                dateOfBirth: parsedPatientDOB
            },
            doctorInfo: {
                name: doctor.name,
                speciality: doctor.speciality,
                designation: doctor.designation,
                location: doctor.location || '',
                email: doctor.email,
                perPatientTime: doctor.perPatientTime || 15
            },
            appointmentDate: parsedAppointmentDate,
            appointmentTime: startTime,
            endTime: endTime,
            status: status // This will be 'processing' for client bookings
        };
        
        console.log('💾 Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
        
        // Start a transaction to ensure both operations succeed or fail together
        console.log('🔄 Starting database transaction...');
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // 1. Create the appointment
            const appointment = new Appointment(appointmentData);
            await appointment.save({ session });
            
            console.log('✅ Appointment saved to database');
            console.log('- Appointment ID:', appointment._id);
            console.log('- Patient:', patient.fullName);
            console.log('- Status:', status);
            
            // 2. Update doctor's slot status to 'processing' (not 'booked')
            doctor.timeSlots[slotIndex].status = 'processing';
            doctor.timeSlots[slotIndex].patientInfo = {
                name: patient.fullName,
                phone: patient.phone,
                email: patient.email,
                appointmentId: appointment._id
            };
            
            await doctor.save({ session });
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ Transaction committed successfully');
            console.log('✅ Doctor slot updated to "processing"');
            
            // Populate appointment with doctor details for response
            const populatedAppointment = await Appointment.findById(appointment._id)
                .populate('doctorId', 'name email speciality designation location');
            
            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully! It is now pending approval.',
                data: populatedAppointment
            });
            
        } catch (transactionError) {
            // Rollback the transaction
            console.log('❌ Transaction failed, rolling back...');
            await session.abortTransaction();
            session.endSession();
            
            console.error('❌ Transaction error:', transactionError);
            console.error('❌ Error name:', transactionError.name);
            console.error('❌ Error message:', transactionError.message);
            console.error('❌ Error stack:', transactionError.stack);
            
            throw transactionError;
        }
        
    } catch (error) {
        console.error('❌ Error creating client appointment:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            console.error('❌ Validation errors:', messages);
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + messages.join(', ')
            });
        }
        
        // Check for MongoDB duplicate key error
        if (error.code === 11000) {
            console.error('❌ Duplicate key error:', error.keyValue);
            return res.status(400).json({
                success: false,
                message: 'Duplicate appointment detected'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to book appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};