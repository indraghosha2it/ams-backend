const mongoose = require('mongoose');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const emailService = require('../utils/emailService');
const { timeToMinutes, formatTime } = require('../utils/slotGenerator');

// Create new appointment9without mail)

// exports.createAppointment = async (req, res) => {
//     try {
//         console.log('📥 === CREATE APPOINTMENT REQUEST ===');
//         console.log('📋 Headers:', req.headers);
//         console.log('👤 User:', req.user);
//         console.log('📦 Body received:', JSON.stringify(req.body, null, 2));
        
//         const {
//             doctorId,
//             slotId,
//             patient,
//             appointmentDate,
//             appointmentTime,
//             slotSerialNumber,
//             status = 'pending'
//         } = req.body;
        
//         // Validate required fields
//         if (!doctorId || !slotId || !patient || !appointmentDate || !appointmentTime) {
//             console.log('❌ Missing required fields');
//             console.log('- doctorId:', doctorId);
//             console.log('- slotId:', slotId);
//             console.log('- patient:', patient);
//             console.log('- appointmentDate:', appointmentDate);
//             console.log('- appointmentTime:', appointmentTime);
            
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields: doctorId, slotId, patient, appointmentDate, appointmentTime'
//             });
//         }
        
//         // Validate patient data
//         if (!patient.fullName || !patient.email || !patient.phone || !patient.dateOfBirth || !patient.gender || !patient.reason) {
//             console.log('❌ Missing required patient information');
//             console.log('- fullName:', patient.fullName);
//             console.log('- email:', patient.email);
//             console.log('- phone:', patient.phone);
//             console.log('- dateOfBirth:', patient.dateOfBirth);
//             console.log('- gender:', patient.gender);
//             console.log('- reason:', patient.reason);
            
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required patient information'
//             });
//         }
        
//         console.log('🔍 Looking for doctor:', doctorId);
        
//         // Find doctor
//         const doctor = await Doctor.findById(doctorId);
//         if (!doctor) {
//             console.log('❌ Doctor not found for ID:', doctorId);
//             return res.status(404).json({
//                 success: false,
//                 message: 'Doctor not found'
//             });
//         }
        
//         console.log('✅ Doctor found:', doctor.name);
//         console.log('📊 Doctor has', doctor.timeSlots?.length || 0, 'slots');
        
//         // Find the specific slot in doctor's timeSlots
//         let slotIndex = doctor.timeSlots.findIndex(slot => 
//             slot._id && slot._id.toString() === slotId
//         );
        
//         console.log('🔍 Looking for slot with ID:', slotId);
//         console.log('📋 Slot search result (by _id):', slotIndex);
        
//         if (slotIndex === -1) {
//             // If slot not found by _id, try to find by date and time
//             console.log('⚠️ Slot not found by _id, trying by date and time...');
//             const formattedDate = new Date(appointmentDate).toISOString().split('T')[0];
            
//             doctor.timeSlots.forEach((slot, index) => {
//                 try {
//                     let slotDateStr;
//                     if (slot.date) {
//                         if (typeof slot.date === 'object' && slot.date.$date) {
//                             // MongoDB format
//                             const dateObj = new Date(slot.date.$date);
//                             slotDateStr = dateObj.toISOString().split('T')[0];
//                         } else {
//                             // Regular date
//                             const dateObj = new Date(slot.date);
//                             slotDateStr = dateObj.toISOString().split('T')[0];
//                         }
                        
//                         if (slotDateStr === formattedDate && slot.startTime === appointmentTime) {
//                             console.log(`✅ Found slot at index ${index} by date/time match`);
//                             slotIndex = index;
//                         }
//                     }
//                 } catch (error) {
//                     console.log(`⚠️ Error processing slot ${index}:`, error.message);
//                 }
//             });
//         }
        
//         if (slotIndex === -1) {
//             console.log('❌ Slot not found in doctor timeSlots');
//             console.log('📅 Looking for date:', appointmentDate);
//             console.log('⏰ Looking for time:', appointmentTime);
//             console.log('📋 Available slots sample:', doctor.timeSlots?.slice(0, 3));
            
//             return res.status(404).json({
//                 success: false,
//                 message: 'Time slot not found or no longer available'
//             });
//         }
        
//         console.log('✅ Slot found at index:', slotIndex);
//         console.log('📋 Slot details:', doctor.timeSlots[slotIndex]);
        
//         // Get the serial number from the doctor's slot
//         const slotSerialNumberFromDB = doctor.timeSlots[slotIndex].serialNumber || 0;
//         console.log(`📝 Slot serial number from database: ${slotSerialNumberFromDB}`);
//         console.log(`📝 Slot serial number from request: ${slotSerialNumber}`);
        
//         // Use the serial number from the database (this is the correct one)
//         const finalSerialNumber = slotSerialNumberFromDB || slotSerialNumber || 0;
//         console.log(`📝 Using serial number: ${finalSerialNumber}`);
        
//         // Check if slot is available
//         if (doctor.timeSlots[slotIndex].status !== 'available') {
//             console.log('❌ Slot not available. Current status:', doctor.timeSlots[slotIndex].status);
//             return res.status(409).json({
//                 success: false,
//                 message: 'This time slot is no longer available',
//                 currentStatus: doctor.timeSlots[slotIndex].status
//             });
//         }
        
//         // Calculate end time based on doctor's perPatientTime
//         const startTime = doctor.timeSlots[slotIndex].startTime;
//         const endTime = doctor.timeSlots[slotIndex].endTime;
        
//         // Parse appointment date properly
//         let parsedAppointmentDate;
//         try {
//             parsedAppointmentDate = new Date(appointmentDate);
//             if (isNaN(parsedAppointmentDate.getTime())) {
//                 throw new Error('Invalid date');
//             }
//         } catch (error) {
//             console.log('❌ Invalid appointment date:', appointmentDate);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid appointment date format'
//             });
//         }
        
//         // Parse patient date of birth
//         let parsedPatientDOB;
//         try {
//             parsedPatientDOB = new Date(patient.dateOfBirth);
//             if (isNaN(parsedPatientDOB.getTime())) {
//                 throw new Error('Invalid date');
//             }
//         } catch (error) {
//             console.log('❌ Invalid patient date of birth:', patient.dateOfBirth);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid patient date of birth format'
//             });
//         }
        
//         // Create appointment with doctor information
//         const appointmentData = {
//             doctorId,
//             slotId,
//             patient: {
//                 ...patient,
//                 dateOfBirth: parsedPatientDOB
//             },
//             doctorInfo: {
//                 name: doctor.name,
//                 speciality: doctor.speciality,
//                 designation: doctor.designation,
//                 location: doctor.location || '',
//                 email: doctor.email,
//                 perPatientTime: doctor.perPatientTime || 15
//             },
//             appointmentDate: parsedAppointmentDate,
//             appointmentTime: startTime,
//             endTime: endTime,
//             slotSerialNumber: finalSerialNumber, // Use the correct serial number from doctor's slot
//             status
//         };
        
//         console.log('💾 Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
        
//         // Start a transaction to ensure both operations succeed or fail together
//         console.log('🔄 Starting database transaction...');
//         const session = await mongoose.startSession();
//         session.startTransaction();
        
//         try {
//             // 1. Create the appointment
//             const appointment = new Appointment(appointmentData);
//             await appointment.save({ session });
            
//             console.log('✅ Appointment saved to database');
//             console.log('- Appointment ID:', appointment._id);
//             console.log('- Patient:', patient.fullName);
//             console.log('- Slot Serial Number saved:', finalSerialNumber);
            
//             // 2. Update doctor's slot status to 'booked'
//             doctor.timeSlots[slotIndex].status = 'booked';
//             doctor.timeSlots[slotIndex].patientInfo = {
//                 name: patient.fullName,
//                 phone: patient.phone,
//                 email: patient.email,
//                 appointmentId: appointment._id,
//                 serialNumber: finalSerialNumber // Save the correct serial number
//             };
            
//             await doctor.save({ session });
            
//             // Commit the transaction
//             await session.commitTransaction();
//             session.endSession();
            
//             console.log('✅ Transaction committed successfully');
//             console.log('✅ Doctor slot updated to "booked"');
//             console.log(`✅ Slot serial number ${finalSerialNumber} saved to both appointment and doctor slot`);
            
//             // Populate appointment with doctor details for response
//             const populatedAppointment = await Appointment.findById(appointment._id)
//                 .populate('doctorId', 'name email speciality designation location');
            
//             res.status(201).json({
//                 success: true,
//                 message: `Appointment #${finalSerialNumber} booked successfully`,
//                 data: populatedAppointment
//             });
            
//         } catch (transactionError) {
//             // Rollback the transaction
//             console.log('❌ Transaction failed, rolling back...');
//             await session.abortTransaction();
//             session.endSession();
            
//             console.error('❌ Transaction error:', transactionError);
//             console.error('❌ Error name:', transactionError.name);
//             console.error('❌ Error message:', transactionError.message);
//             console.error('❌ Error stack:', transactionError.stack);
            
//             throw transactionError;
//         }
        
//     } catch (error) {
//         console.error('❌ Error creating appointment:', error);
//         console.error('❌ Error name:', error.name);
//         console.error('❌ Error message:', error.message);
//         console.error('❌ Error stack:', error.stack);
        
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(val => val.message);
//             console.error('❌ Validation errors:', messages);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation error: ' + messages.join(', ')
//             });
//         }
        
//         // Check for MongoDB duplicate key error
//         if (error.code === 11000) {
//             console.error('❌ Duplicate key error:', error.keyValue);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Duplicate appointment detected'
//             });
//         }
        
//         res.status(500).json({
//             success: false,
//             message: 'Failed to book appointment',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };


// Create appointment
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
            slotSerialNumber,
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
        
        // Get the serial number from the doctor's slot
        const slotSerialNumberFromDB = doctor.timeSlots[slotIndex].serialNumber || 0;
        console.log(`📝 Slot serial number from database: ${slotSerialNumberFromDB}`);
        console.log(`📝 Slot serial number from request: ${slotSerialNumber}`);
        
        // Use the serial number from the database (this is the correct one)
        const finalSerialNumber = slotSerialNumberFromDB || slotSerialNumber || 0;
        console.log(`📝 Using serial number: ${finalSerialNumber}`);
        
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
            slotSerialNumber: finalSerialNumber, // Use the correct serial number from doctor's slot
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
            console.log('- Slot Serial Number saved:', finalSerialNumber);
            
            // 2. Update doctor's slot status to 'booked'
            doctor.timeSlots[slotIndex].status = 'booked';
            doctor.timeSlots[slotIndex].patientInfo = {
                name: patient.fullName,
                phone: patient.phone,
                email: patient.email,
                appointmentId: appointment._id,
                serialNumber: finalSerialNumber // Save the correct serial number
            };
            
            await doctor.save({ session });
            
            // 3. Send confirmation email (AFTER transaction is committed)
            let emailResult = null;
            try {
                console.log('📧 Attempting to send confirmation email...');
                emailResult = await emailService.sendAppointmentConfirmation({
                    patient,
                    doctor: {
                        name: doctor.name,
                        speciality: doctor.speciality,
                        location: doctor.location,
                        perPatientTime: doctor.perPatientTime,
                        designation: doctor.designation,
                        email: doctor.email
                    },
                    appointmentDate: parsedAppointmentDate,
                    appointmentTime: startTime,
                    slotSerialNumber: finalSerialNumber,
                    appointmentId: appointment._id,
                      status: 'confirmed'
                });

                // Update appointment with email status
                appointment.emailSent = emailResult.success;
                appointment.emailMessageId = emailResult.messageId;
                await appointment.save({ session });
                
                if (emailResult.success) {
                    console.log('✅ Confirmation email sent successfully');
                } else {
                    console.log('⚠️ Email service returned error:', emailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
                // Don't throw - appointment is still valid even if email fails
            }
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ Transaction committed successfully');
            console.log('✅ Doctor slot updated to "booked"');
            console.log(`✅ Slot serial number ${finalSerialNumber} saved to both appointment and doctor slot`);
            
            // Populate appointment with doctor details for response
            const populatedAppointment = await Appointment.findById(appointment._id)
                .populate('doctorId', 'name email speciality designation location');
            
            // Build response
            const responseData = {
                success: true,
                message: `Appointment #${finalSerialNumber} booked successfully`,
                data: {
                    appointment: populatedAppointment,
                    emailStatus: emailResult ? {
                        sent: emailResult.success,
                        messageId: emailResult.messageId,
                        error: emailResult.error
                    } : { sent: false, error: 'Email service not called' }
                }
            };
            
            res.status(201).json(responseData);
            
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

// Update appointment status without mail
// exports.updateAppointmentStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;
        
//         const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
//         if (!validStatuses.includes(status)) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
//             });
//         }
        
//         const appointment = await Appointment.findById(id);
//         if (!appointment) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Appointment not found'
//             });
//         }
        
//         // If cancelling, we should also free up the doctor's slot
//         if (status === 'cancelled' && appointment.status !== 'cancelled') {
//             const doctor = await Doctor.findById(appointment.doctorId);
//             if (doctor) {
//                 const slotIndex = doctor.timeSlots.findIndex(slot => 
//                     slot._id.toString() === appointment.slotId
//                 );
                
//                 if (slotIndex !== -1) {
//                     doctor.timeSlots[slotIndex].status = 'available';
//                     doctor.timeSlots[slotIndex].patientInfo = null;
//                     await doctor.save();


                    
//                 }
//             }
//         }
        
//         appointment.status = status;
//         appointment.updatedAt = new Date();
//         await appointment.save();

//          // Send status update email if status changed to confirmed
//         if (status === 'confirmed' && oldStatus !== 'confirmed') {
//             try {
//                 await emailService.sendAppointmentStatusUpdate({
//                     patient: appointment.patient,
//                     doctor: appointment.doctorInfo,
//                     appointmentDate: appointment.appointmentDate,
//                     appointmentTime: appointment.appointmentTime,
//                     slotSerialNumber: appointment.slotSerialNumber,
//                     appointmentId: appointment._id,
//                     status: status,
//                     remarks: remarks
//                 });
//             } catch (emailError) {
//                 console.error('Email sending failed:', emailError);
//                 // Don't fail the whole request if email fails
//             }
//         }
        
        
//         res.json({
//             success: true,
//             message: `Appointment status updated to ${status}`,
//             data: appointment
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks = '' } = req.body;
        
        console.log('📋 === UPDATE APPOINTMENT STATUS ===');
        console.log('Appointment ID:', id);
        console.log('New Status:', status);
        console.log('Remarks:', remarks);
        
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
        
        // Store old status for comparison
        const oldStatus = appointment.status;
        
        // If cancelling, we should also free up the doctor's slot
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            const doctor = await Doctor.findById(appointment.doctorId);
            if (doctor) {
                const slotIndex = doctor.timeSlots.findIndex(slot => 
                    slot._id.toString() === appointment.slotId
                );
                
                if (slotIndex !== -1) {
                    doctor.timeSlots[slotIndex].status = 'available';
                    doctor.timeSlots[slotIndex].patientInfo = null;
                    await doctor.save();
                    console.log('✅ Doctor slot freed up');
                }
            }
        }
        
        // If changing from cancelled to another status, check if slot is available
        if (oldStatus === 'cancelled' && status !== 'cancelled') {
            const doctor = await Doctor.findById(appointment.doctorId);
            if (doctor) {
                const slotIndex = doctor.timeSlots.findIndex(slot => 
                    slot._id.toString() === appointment.slotId
                );
                
                if (slotIndex !== -1 && doctor.timeSlots[slotIndex].status !== 'available') {
                    return res.status(409).json({
                        success: false,
                        message: 'This time slot is no longer available. Please choose another slot.',
                        slotAvailable: false
                    });
                }
                
                // Re-book the slot
                if (slotIndex !== -1) {
                    doctor.timeSlots[slotIndex].status = 'booked';
                    doctor.timeSlots[slotIndex].patientInfo = {
                        name: appointment.patient.fullName,
                        phone: appointment.patient.phone,
                        email: appointment.patient.email,
                        appointmentId: appointment._id,
                        serialNumber: appointment.slotSerialNumber
                    };
                    await doctor.save();
                    console.log('✅ Doctor slot re-booked');
                }
            }
        }
        
        // Update appointment status
        appointment.status = status;
        appointment.updatedAt = new Date();
        
        // Add remarks if provided
        if (remarks) {
            appointment.remarks = remarks;
        }
        
        await appointment.save();
        
        console.log('✅ Appointment status updated successfully');
        
        // Send status update email if status changed (excluding 'no-show' and 'completed' if needed)
        if (oldStatus !== status) {
            try {
                console.log('📧 Preparing to send status update email...');
                
                // Prepare email data
                const emailData = {
                    patient: appointment.patient,
                    doctor: appointment.doctorInfo,
                    appointmentDate: appointment.appointmentDate,
                    appointmentTime: appointment.appointmentTime,
                    slotSerialNumber: appointment.slotSerialNumber,
                    appointmentId: appointment._id,
                    status: status,
                    remarks: remarks
                };
                
                let emailResult = null;
                
                // Send different email based on status
                if (status === 'confirmed') {
                    console.log('📧 Sending confirmation email...');
                    emailResult = await emailService.sendAppointmentConfirmation(emailData);
                } else if (status === 'cancelled') {
                    console.log('📧 Sending cancellation email...');
                    emailResult = await emailService.sendAppointmentStatusUpdate(emailData);
                } else if (status === 'pending') {
                    console.log('📧 Sending pending status email...');
                    emailResult = await emailService.sendAppointmentConfirmation({
                        ...emailData,
                        status: 'pending'
                    });
                } else {
                    console.log('📧 Sending status update email...');
                    emailResult = await emailService.sendAppointmentStatusUpdate(emailData);
                }
                
                if (emailResult && emailResult.success) {
                    console.log('✅ Status update email sent successfully');
                    
                    // Update appointment with email status
                    appointment.emailSent = emailResult.success;
                    appointment.lastEmailStatus = status;
                    appointment.lastEmailSentAt = new Date();
                    await appointment.save();
                } else {
                    console.log('⚠️ Email service returned error:', emailResult?.error);
                }
                
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
                // Don't fail the whole request if email fails
            }
        }
        
        // Prepare response data
        const responseData = {
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment
        };
        
        // Add email status to response if email was sent
        if (oldStatus !== status) {
            responseData.emailStatus = {
                sent: true,
                status: status
            };
        }
        
        res.json(responseData);
        
    } catch (error) {
        console.error('❌ Error updating appointment status:', error);
        console.error('❌ Error details:', error.message);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update appointment status'
        });
    }
};

// Update appointment (for rescheduling)
// Update appointment
// exports.updateAppointment = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;
        
//         const appointment = await Appointment.findById(id);
//         if (!appointment) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Appointment not found'
//             });
//         }
        
//         // Update fields
//         Object.keys(updates).forEach(key => {
//             appointment[key] = updates[key];
//         });
        
//         appointment.updatedAt = new Date();
//         await appointment.save();
        
//         res.json({
//             success: true,
//             message: 'Appointment updated successfully',
//             data: appointment
//         });
//     } catch (error) {
//         console.error('Error updating appointment:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update appointment'
//         });
//     }
// };
// Update appointment (for rescheduling) - UPDATED WITH EMAIL FOR STAFF
exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        console.log('📋 === UPDATE APPOINTMENT REQUEST ===');
        console.log('Appointment ID:', id);
        console.log('Updates:', updates);
        console.log('User Role:', req.user.role);
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Store old appointment details for email (if rescheduling)
        const oldAppointmentDetails = {
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
            serialNumber: appointment.slotSerialNumber,
            status: appointment.status
        };
        
        // Check if this is a reschedule (date/time changed)
        const isReschedule = (updates.appointmentDate && 
                             updates.appointmentDate !== appointment.appointmentDate.toISOString().split('T')[0]) ||
                            (updates.appointmentTime && 
                             updates.appointmentTime !== appointment.appointmentTime);
        
        // Check if this is a status change
        const isStatusChange = updates.status && updates.status !== appointment.status;
        
        console.log('📊 Change Analysis:', {
            isReschedule: isReschedule,
            isStatusChange: isStatusChange,
            oldStatus: appointment.status,
            newStatus: updates.status
        });
        
        // Update fields
        Object.keys(updates).forEach(key => {
            appointment[key] = updates[key];
        });
        
        appointment.updatedAt = new Date();
        
        // Start transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            await appointment.save({ session });
            console.log('✅ Appointment updated successfully');
            
            // Handle emails based on the type of update
            let emailResult = null;
            
            // 1. If staff is rescheduling (changing date/time)
            if (isReschedule && req.user.role === 'staff') {
                console.log('📧 Preparing staff reschedule email...');
                
                try {
                    emailResult = await emailService.sendAppointmentRescheduled({
                        patient: appointment.patient,
                        doctor: appointment.doctorInfo,
                        oldAppointmentDate: oldAppointmentDetails.date,
                        oldAppointmentTime: oldAppointmentDetails.time,
                        newAppointmentDate: updates.appointmentDate || appointment.appointmentDate,
                        newAppointmentTime: updates.appointmentTime || appointment.appointmentTime,
                        slotSerialNumber: updates.slotSerialNumber || appointment.slotSerialNumber,
                        appointmentId: appointment._id,
                        remarks: 'Your appointment has been rescheduled by the clinic staff. It is now confirmed.'
                    });

                    if (emailResult.success) {
                        console.log('✅ Staff reschedule email sent successfully');
                        
                        // Update appointment with email status
                        appointment.emailSent = emailResult.success;
                        appointment.lastEmailType = 'staff_reschedule';
                        appointment.lastEmailSentAt = new Date();
                        appointment.emailMessageId = emailResult.messageId;
                        await appointment.save({ session });
                    } else {
                        console.log('⚠️ Email service returned error:', emailResult.error);
                    }
                } catch (emailError) {
                    console.error('❌ Email sending failed:', emailError);
                    // Don't fail the transaction if email fails
                }
            }
            
            // 2. If status changed to 'confirmed' (and not from reschedule)
            else if (isStatusChange && updates.status === 'confirmed') {
                console.log('📧 Preparing confirmation email...');
                
                try {
                    emailResult = await emailService.sendAppointmentConfirmation({
                        patient: appointment.patient,
                        doctor: appointment.doctorInfo,
                        appointmentDate: appointment.appointmentDate,
                        appointmentTime: appointment.appointmentTime,
                        slotSerialNumber: appointment.slotSerialNumber,
                        appointmentId: appointment._id,
                        status: 'confirmed',
                        remarks: 'Your appointment has been confirmed by the clinic staff.'
                    });

                    if (emailResult.success) {
                        console.log('✅ Confirmation email sent successfully');
                        
                        // Update appointment with email status
                        appointment.emailSent = emailResult.success;
                        appointment.lastEmailType = 'confirmation';
                        appointment.lastEmailSentAt = new Date();
                        appointment.emailMessageId = emailResult.messageId;
                        await appointment.save({ session });
                    } else {
                        console.log('⚠️ Email service returned error:', emailResult.error);
                    }
                } catch (emailError) {
                    console.error('❌ Email sending failed:', emailError);
                }
            }
            
            // Commit transaction
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ Transaction committed successfully');
            
            // Prepare response data
            const responseData = {
                success: true,
                message: 'Appointment updated successfully',
                data: appointment
            };
            
            // Add email status to response if email was sent
            if (emailResult) {
                responseData.emailStatus = {
                    sent: emailResult.success,
                    type: isReschedule ? 'reschedule' : 'confirmation',
                    messageId: emailResult.messageId,
                    error: emailResult.error
                };
            }
            
            res.json(responseData);
            
        } catch (transactionError) {
            // Rollback transaction
            await session.abortTransaction();
            session.endSession();
            
            console.error('❌ Transaction error:', transactionError);
            throw transactionError;
        }
        
    } catch (error) {
        console.error('❌ Error updating appointment:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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


// Create new appointment for clients (with processing status , without mail)
// exports.createClientAppointment = async (req, res) => {
//     try {
//         console.log('📥 === CREATE CLIENT APPOINTMENT REQUEST ===');
//         console.log('📋 Headers:', req.headers);
//         console.log('📦 Body received:', JSON.stringify(req.body, null, 2));
        
//         const {
//             doctorId,
//             slotId,
//             patient,
//             appointmentDate,
//             appointmentTime,
//              slotSerialNumber,
//         } = req.body;
        
//         // Set status to 'processing' for client bookings
//         const status = 'pending';
        
//         // Validate required fields
//         if (!doctorId || !slotId || !patient || !appointmentDate || !appointmentTime) {
//             console.log('❌ Missing required fields');
//             console.log('- doctorId:', doctorId);
//             console.log('- slotId:', slotId);
//             console.log('- patient:', patient);
//             console.log('- appointmentDate:', appointmentDate);
//             console.log('- appointmentTime:', appointmentTime);
            
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields: doctorId, slotId, patient, appointmentDate, appointmentTime'
//             });
//         }
        
//         // Validate patient data
//         if (!patient.fullName || !patient.email || !patient.phone || !patient.dateOfBirth || !patient.gender || !patient.reason) {
//             console.log('❌ Missing required patient information');
//             console.log('- fullName:', patient.fullName);
//             console.log('- email:', patient.email);
//             console.log('- phone:', patient.phone);
//             console.log('- dateOfBirth:', patient.dateOfBirth);
//             console.log('- gender:', patient.gender);
//             console.log('- reason:', patient.reason);
            
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required patient information'
//             });
//         }
        
//         console.log('🔍 Looking for doctor:', doctorId);
        
//         // Find doctor
//         const doctor = await Doctor.findById(doctorId);
//         if (!doctor) {
//             console.log('❌ Doctor not found for ID:', doctorId);
//             return res.status(404).json({
//                 success: false,
//                 message: 'Doctor not found'
//             });
//         }
        
//         console.log('✅ Doctor found:', doctor.name);
//         console.log('📊 Doctor has', doctor.timeSlots?.length || 0, 'slots');
        
//         // Find the specific slot in doctor's timeSlots
//         let slotIndex = doctor.timeSlots.findIndex(slot => 
//             slot._id && slot._id.toString() === slotId
//         );
        
//         console.log('🔍 Looking for slot with ID:', slotId);
//         console.log('📋 Slot search result (by _id):', slotIndex);
        
//         if (slotIndex === -1) {
//             // If slot not found by _id, try to find by date and time
//             console.log('⚠️ Slot not found by _id, trying by date and time...');
//             const formattedDate = new Date(appointmentDate).toISOString().split('T')[0];
            
//             doctor.timeSlots.forEach((slot, index) => {
//                 try {
//                     let slotDateStr;
//                     if (slot.date) {
//                         if (typeof slot.date === 'object' && slot.date.$date) {
//                             // MongoDB format
//                             const dateObj = new Date(slot.date.$date);
//                             slotDateStr = dateObj.toISOString().split('T')[0];
//                         } else {
//                             // Regular date
//                             const dateObj = new Date(slot.date);
//                             slotDateStr = dateObj.toISOString().split('T')[0];
//                         }
                        
//                         if (slotDateStr === formattedDate && slot.startTime === appointmentTime) {
//                             console.log(`✅ Found slot at index ${index} by date/time match`);
//                             slotIndex = index;
//                         }
//                     }
//                 } catch (error) {
//                     console.log(`⚠️ Error processing slot ${index}:`, error.message);
//                 }
//             });
//         }
        
//         if (slotIndex === -1) {
//             console.log('❌ Slot not found in doctor timeSlots');
//             console.log('📅 Looking for date:', appointmentDate);
//             console.log('⏰ Looking for time:', appointmentTime);
//             console.log('📋 Available slots sample:', doctor.timeSlots?.slice(0, 3));
            
//             return res.status(404).json({
//                 success: false,
//                 message: 'Time slot not found or no longer available'
//             });
//         }
        
//         console.log('✅ Slot found at index:', slotIndex);
//         console.log('📋 Slot details:', doctor.timeSlots[slotIndex]);
        
//         // Check if slot is available (allow 'processing' status if re-booking)
//         const slotStatus = doctor.timeSlots[slotIndex].status;
//         if (slotStatus !== 'available' && slotStatus !== 'processing') {
//             console.log('❌ Slot not available. Current status:', slotStatus);
//             return res.status(409).json({
//                 success: false,
//                 message: 'This time slot is no longer available',
//                 currentStatus: slotStatus
//             });
//         }
        
//         // Calculate end time based on doctor's perPatientTime
//         const startTime = doctor.timeSlots[slotIndex].startTime;
//         const endTime = doctor.timeSlots[slotIndex].endTime;
        
//         // Parse appointment date properly
//         let parsedAppointmentDate;
//         try {
//             parsedAppointmentDate = new Date(appointmentDate);
//             if (isNaN(parsedAppointmentDate.getTime())) {
//                 throw new Error('Invalid date');
//             }
//         } catch (error) {
//             console.log('❌ Invalid appointment date:', appointmentDate);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid appointment date format'
//             });
//         }
        
//         // Parse patient date of birth
//         let parsedPatientDOB;
//         try {
//             parsedPatientDOB = new Date(patient.dateOfBirth);
//             if (isNaN(parsedPatientDOB.getTime())) {
//                 throw new Error('Invalid date');
//             }
//         } catch (error) {
//             console.log('❌ Invalid patient date of birth:', patient.dateOfBirth);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid patient date of birth format'
//             });
//         }
        
//         // Create appointment with doctor information
//         const appointmentData = {
//             doctorId,
//             slotId,
//             patient: {
//                 ...patient,
//                 dateOfBirth: parsedPatientDOB
//             },
//             doctorInfo: {
//                 name: doctor.name,
//                 speciality: doctor.speciality,
//                 designation: doctor.designation,
//                 location: doctor.location || '',
//                 email: doctor.email,
//                 perPatientTime: doctor.perPatientTime || 15
//             },
//             appointmentDate: parsedAppointmentDate,
//             appointmentTime: startTime,
//             endTime: endTime,
//             slotSerialNumber: slotSerialNumber || 0,
//             status: status // This will be 'processing' for client bookings
//         };
        
//         console.log('💾 Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
        
//         // Start a transaction to ensure both operations succeed or fail together
//         console.log('🔄 Starting database transaction...');
//         const session = await mongoose.startSession();
//         session.startTransaction();
        
//         try {
//             // 1. Create the appointment
//             const appointment = new Appointment(appointmentData);
//             await appointment.save({ session });
            
//             console.log('✅ Appointment saved to database');
//             console.log('- Appointment ID:', appointment._id);
//             console.log('- Patient:', patient.fullName);
//             console.log('- Status:', status);
            
//             // 2. Update doctor's slot status to 'processing' (not 'booked')
//             doctor.timeSlots[slotIndex].status = 'booked';
//             doctor.timeSlots[slotIndex].patientInfo = {
//                 name: patient.fullName,
//                 phone: patient.phone,
//                 email: patient.email,
//                 appointmentId: appointment._id,
//                  serialNumber: slotSerialNumber || 0 
//             };
            
//             await doctor.save({ session });
            
//             // Commit the transaction
//             await session.commitTransaction();
//             session.endSession();
            
//             console.log('✅ Transaction committed successfully');
//             console.log('✅ Doctor slot updated to "processing"');
            
//             // Populate appointment with doctor details for response
//             const populatedAppointment = await Appointment.findById(appointment._id)
//                 .populate('doctorId', 'name email speciality designation location');
            
//             res.status(201).json({
//                 success: true,
//                 message: 'Appointment booked successfully! It is now pending approval.',
//                 data: populatedAppointment
//             });
            
//         } catch (transactionError) {
//             // Rollback the transaction
//             console.log('❌ Transaction failed, rolling back...');
//             await session.abortTransaction();
//             session.endSession();
            
//             console.error('❌ Transaction error:', transactionError);
//             console.error('❌ Error name:', transactionError.name);
//             console.error('❌ Error message:', transactionError.message);
//             console.error('❌ Error stack:', transactionError.stack);
            
//             throw transactionError;
//         }
        
//     } catch (error) {
//         console.error('❌ Error creating client appointment:', error);
//         console.error('❌ Error name:', error.name);
//         console.error('❌ Error message:', error.message);
//         console.error('❌ Error stack:', error.stack);
        
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(val => val.message);
//             console.error('❌ Validation errors:', messages);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation error: ' + messages.join(', ')
//             });
//         }
        
//         // Check for MongoDB duplicate key error
//         if (error.code === 11000) {
//             console.error('❌ Duplicate key error:', error.keyValue);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Duplicate appointment detected'
//             });
//         }
        
//         res.status(500).json({
//             success: false,
//             message: 'Failed to book appointment',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

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
            appointmentTime,
            slotSerialNumber,
        } = req.body;
        
        // Set status to 'pending' for client bookings
        const status = 'pending';
        
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
            slotSerialNumber: slotSerialNumber || 0,
            status: status // This will be 'pending' for client bookings
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
            console.log('- Serial Number:', slotSerialNumber);
            
            // 2. Update doctor's slot status to 'booked'
            doctor.timeSlots[slotIndex].status = 'booked';
            doctor.timeSlots[slotIndex].patientInfo = {
                name: patient.fullName,
                phone: patient.phone,
                email: patient.email,
                appointmentId: appointment._id,
                serialNumber: slotSerialNumber || 0 
            };
            
            await doctor.save({ session });
            
            // 3. Send confirmation email for pending appointment
            let emailResult = null;
            try {
                console.log('📧 Attempting to send pending appointment email...');
                
                emailResult = await emailService.sendAppointmentConfirmation({
                    patient,
                    doctor: {
                        name: doctor.name,
                        speciality: doctor.speciality,
                        location: doctor.location,
                        perPatientTime: doctor.perPatientTime,
                        designation: doctor.designation,
                        email: doctor.email
                    },
                    appointmentDate: parsedAppointmentDate,
                    appointmentTime: startTime,
                    slotSerialNumber: slotSerialNumber || 0,
                    appointmentId: appointment._id,
                    status: 'pending' // Add status to indicate it's pending
                });

                // Update appointment with email status
                appointment.emailSent = emailResult.success;
                appointment.emailMessageId = emailResult.messageId;
                await appointment.save({ session });
                
                if (emailResult.success) {
                    console.log('✅ Pending appointment email sent successfully');
                } else {
                    console.log('⚠️ Email service returned error:', emailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
                // Don't throw - appointment is still valid even if email fails
            }
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ Transaction committed successfully');
            console.log('✅ Doctor slot updated to "booked"');
            console.log('✅ Email sent to patient and clinic');
            
            // Populate appointment with doctor details for response
            const populatedAppointment = await Appointment.findById(appointment._id)
                .populate('doctorId', 'name email speciality designation location');
            
            // Build response with email status
            const responseData = {
                success: true,
                message: 'Appointment booked successfully! It is now pending approval.',
                data: {
                    appointment: populatedAppointment,
                    emailStatus: emailResult ? {
                        sent: emailResult.success,
                        messageId: emailResult.messageId,
                        error: emailResult.error,
                        recipients: emailResult.recipients || {}
                    } : { sent: false, error: 'Email service not called' }
                }
            };
            
            res.status(201).json(responseData);
            
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


// Cancel appointment (client only - can only cancel their own appointments)
// exports.cancelClientAppointment = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         console.log('📥 === CLIENT CANCEL APPOINTMENT REQUEST ===');
//         console.log('👤 Client:', req.user.email);
//         console.log('👤 Client role:', req.user.role);
//         console.log('🆔 Appointment ID:', id);
        
//         // Validate appointment ID
//         if (!id || id === 'undefined' || id === 'null') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid appointment ID'
//             });
//         }
        
//         // Find appointment
//         const appointment = await Appointment.findById(id);
//         if (!appointment) {
//             console.log('❌ Appointment not found for ID:', id);
//             return res.status(404).json({
//                 success: false,
//                 message: 'Appointment not found'
//             });
//         }
        
//         console.log('📋 Found appointment:', {
//             id: appointment._id,
//             patientEmail: appointment.patient.email,
//             status: appointment.status,
//             date: appointment.appointmentDate,
//             time: appointment.appointmentTime
//         });
        
//         // Authorization check: client can only cancel their own appointments
//         if (appointment.patient.email.toLowerCase() !== req.user.email.toLowerCase()) {
//             console.log('❌ Authorization failed:', {
//                 appointmentEmail: appointment.patient.email,
//                 userEmail: req.user.email
//             });
//             return res.status(403).json({
//                 success: false,
//                 message: 'You can only cancel your own appointments'
//             });
//         }
        
//         // Check if appointment can be cancelled (not already cancelled)
//         if (appointment.status === 'cancelled') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Appointment is already cancelled'
//             });
//         }
        
//         // Check if appointment can be cancelled (not completed)
//         if (appointment.status === 'completed') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cannot cancel a completed appointment'
//             });
//         }
        
//         // Check if appointment time has already passed TODAY
//         const appointmentDateTime = new Date(appointment.appointmentDate);
//         const appointmentTime = appointment.appointmentTime; // "HH:MM" format
        
//         // Parse appointment time (HH:MM)
//         const [appointmentHour, appointmentMinute] = appointmentTime.split(':').map(Number);
//         appointmentDateTime.setHours(appointmentHour, appointmentMinute, 0, 0);
        
//         const now = new Date();
        
//         console.log('⏰ Time comparison:', {
//             appointmentDateTime: appointmentDateTime.toISOString(),
//             now: now.toISOString(),
//             isPast: appointmentDateTime < now
//         });
        
//         // If appointment time has already passed today
//         if (appointmentDateTime < now) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cannot cancel past appointments',
//                 isTimePassed: true
//             });
//         }
        
//         console.log('🔄 Starting cancellation process...');
        
//         // If cancelling, free up the doctor's slot
//         if (appointment.status !== 'cancelled') {
//             const doctor = await Doctor.findById(appointment.doctorId);
//             if (doctor) {
//                 console.log('🔍 Found doctor:', doctor.name);
//                 const slotIndex = doctor.timeSlots.findIndex(slot => 
//                     slot._id.toString() === appointment.slotId
//                 );
                
//                 console.log('🔍 Slot index:', slotIndex);
                
//                 if (slotIndex !== -1) {
//                     doctor.timeSlots[slotIndex].status = 'available';
//                     doctor.timeSlots[slotIndex].patientInfo = null;
//                     await doctor.save();
//                     console.log('✅ Doctor slot freed up');
//                 } else {
//                     console.log('⚠️ Slot not found in doctor timeSlots');
//                 }
//             } else {
//                 console.log('⚠️ Doctor not found for ID:', appointment.doctorId);
//             }
//         }
        
//         // Update appointment status to cancelled
//         appointment.status = 'cancelled';
//         appointment.updatedAt = new Date();
//         await appointment.save();
        
//         console.log('✅ Appointment cancelled by client successfully');
        
//         res.json({
//             success: true,
//             message: 'Appointment cancelled successfully',
//             data: appointment
//         });
//     } catch (error) {
//         console.error('❌ Error cancelling appointment:', error);
//         console.error('❌ Error name:', error.name);
//         console.error('❌ Error message:', error.message);
//         console.error('❌ Error stack:', error.stack);
        
//         // Check for Mongoose CastError (invalid ID)
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid appointment ID format'
//             });
//         }
        
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to cancel appointment'
//         });
//     }
// };
  
// Cancel appointment (client only - can only cancel their own appointments)
// In appointmentController.js
exports.cancelClientAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('📥 === CLIENT CANCEL APPOINTMENT REQUEST ===');
        console.log('👤 Full user object:', req.user);
        console.log('👤 User email from req.user:', req.user?.email);
        console.log('👤 User role from req.user:', req.user?.role);
        console.log('🆔 Appointment ID:', id);
        
        // Check if user info exists
        if (!req.user || !req.user.email) {
            console.log('❌ No user email found in request');
            return res.status(401).json({
                success: false,
                message: 'User not properly authenticated'
            });
        }
        
        const userEmail = req.user.email.toLowerCase();
        
        // Validate appointment ID
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment ID'
            });
        }
        
        // Find appointment
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            console.log('❌ Appointment not found for ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        console.log('📋 Found appointment:', {
            id: appointment._id,
            patientEmail: appointment.patient.email,
            appointmentEmail: appointment.patient.email?.toLowerCase(),
            status: appointment.status,
            date: appointment.appointmentDate,
            time: appointment.appointmentTime
        });
        
        // Authorization check: client can only cancel their own appointments
        const appointmentEmail = appointment.patient.email?.toLowerCase();
        if (appointmentEmail !== userEmail) {
            console.log('❌ Authorization failed:', {
                userEmail: userEmail,
                appointmentEmail: appointmentEmail
            });
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own appointments'
            });
        }
        
        // Check if appointment can be cancelled (not already cancelled)
        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Appointment is already cancelled'
            });
        }
        
        // Check if appointment can be cancelled (not completed)
        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed appointment'
            });
        }
        
        // Check if appointment time has already passed TODAY
        const appointmentDateTime = new Date(appointment.appointmentDate);
        const appointmentTime = appointment.appointmentTime; // "HH:MM" format
        
        // Parse appointment time (HH:MM)
        const [appointmentHour, appointmentMinute] = appointmentTime.split(':').map(Number);
        appointmentDateTime.setHours(appointmentHour, appointmentMinute, 0, 0);
        
        const now = new Date();
        
        console.log('⏰ Time comparison:', {
            appointmentDateTime: appointmentDateTime.toISOString(),
            now: now.toISOString(),
            isPast: appointmentDateTime < now
        });
        
        // If appointment time has already passed today
        if (appointmentDateTime < now) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel past appointments',
                isTimePassed: true
            });
        }
        
        console.log('🔄 Starting cancellation process...');
        
        // Start a transaction to ensure both operations succeed or fail together
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // 1. Free up the doctor's slot
            const doctor = await Doctor.findById(appointment.doctorId);
            if (doctor) {
                console.log('🔍 Found doctor:', doctor.name);
                const slotIndex = doctor.timeSlots.findIndex(slot => 
                    slot._id.toString() === appointment.slotId
                );
                
                console.log('🔍 Slot index:', slotIndex);
                
                if (slotIndex !== -1) {
                    doctor.timeSlots[slotIndex].status = 'available';
                    doctor.timeSlots[slotIndex].patientInfo = null;
                    await doctor.save({ session });
                    console.log('✅ Doctor slot freed up');
                } else {
                    console.log('⚠️ Slot not found in doctor timeSlots');
                }
            } else {
                console.log('⚠️ Doctor not found for ID:', appointment.doctorId);
            }
            
            // 2. Update appointment status to cancelled
            appointment.status = 'cancelled';
            appointment.updatedAt = new Date();
            await appointment.save({ session });
            
            console.log('✅ Appointment cancelled by client successfully');
            
            // 3. Send cancellation email
            let emailResult = null;
            try {
                console.log('📧 Preparing to send cancellation email...');
                
                // Prepare email data
                const emailData = {
                    patient: appointment.patient,
                    doctor: appointment.doctorInfo,
                    appointmentDate: appointment.appointmentDate,
                    appointmentTime: appointment.appointmentTime,
                    slotSerialNumber: appointment.slotSerialNumber,
                    appointmentId: appointment._id,
                    status: 'cancelled',
                    remarks: 'Cancelled by patient'
                };
                
                emailResult = await emailService.sendAppointmentStatusUpdate(emailData);
                
                if (emailResult && emailResult.success) {
                    console.log('✅ Cancellation email sent successfully');
                    
                    // Update appointment with email status
                    appointment.emailSent = emailResult.success;
                    appointment.lastEmailStatus = 'cancelled';
                    appointment.lastEmailSentAt = new Date();
                    appointment.emailMessageId = emailResult.messageId;
                    await appointment.save({ session });
                } else {
                    console.log('⚠️ Email service returned error:', emailResult?.error);
                }
                
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
                // Don't fail the whole request if email fails
            }
            
            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ Transaction committed successfully');
            
            // Prepare response data
            const responseData = {
                success: true,
                message: 'Appointment cancelled successfully',
                data: appointment
            };
            
            // Add email status to response if email was sent
            if (emailResult && emailResult.success) {
                responseData.emailStatus = {
                    sent: true,
                    status: 'cancelled',
                    messageId: emailResult.messageId
                };
            }
            
            res.json(responseData);
            
        } catch (transactionError) {
            // Rollback the transaction
            console.log('❌ Transaction failed, rolling back...');
            await session.abortTransaction();
            session.endSession();
            
            console.error('❌ Transaction error:', transactionError);
            console.error('❌ Error name:', transactionError.name);
            console.error('❌ Error message:', transactionError.message);
            console.error('❌ Error stack:', transactionError.stack);
            
            res.status(500).json({
                success: false,
                message: 'Transaction failed: ' + transactionError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Error in cancelClientAppointment:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Check for Mongoose CastError (invalid ID)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel appointment'
        });
    }
};

// Reschedule appointment (for clients) without mail 
// exports.rescheduleAppointment = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { 
//             newSlotId, 
//             newAppointmentDate, 
//             newAppointmentTime 
//         } = req.body;
        
//         console.log('🔄 === CLIENT RESCHEDULE REQUEST ===');
//         console.log('👤 Client:', req.user.email);
//         console.log('📦 Request body:', req.body);
        
//         // Validate required fields
//         if (!newSlotId || !newAppointmentDate || !newAppointmentTime) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields: newSlotId, newAppointmentDate, newAppointmentTime'
//             });
//         }
        
//         // Find the appointment
//         const appointment = await Appointment.findById(id);
//         if (!appointment) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Appointment not found'
//             });
//         }
        
//         // Authorization check: client can only reschedule their own appointments
//         if (appointment.patient.email.toLowerCase() !== req.user.email.toLowerCase()) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You can only reschedule your own appointments'
//             });
//         }
        
//         // Check if appointment can be rescheduled
//         if (appointment.status === 'cancelled') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cannot reschedule a cancelled appointment'
//             });
//         }
        
//         if (appointment.status === 'completed') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cannot reschedule a completed appointment'
//             });
//         }
        
//         // Check if appointment time has already passed
//         const appointmentDateTime = new Date(appointment.appointmentDate);
//         const [appointmentHour, appointmentMinute] = appointment.appointmentTime.split(':').map(Number);
//         appointmentDateTime.setHours(appointmentHour, appointmentMinute, 0, 0);
        
//         const now = new Date();
        
//         if (appointmentDateTime < now) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cannot reschedule past appointments',
//                 isTimePassed: true
//             });
//         }
        
//         // Get doctor ID
//         const doctorId = appointment.doctorId._id || appointment.doctorId;
        
//         console.log('📋 Current appointment:', {
//             oldDate: appointment.appointmentDate,
//             oldTime: appointment.appointmentTime,
//             oldSlotId: appointment.slotId,
//             oldSerial: appointment.slotSerialNumber
//         });
        
//         // Start transaction
//         const session = await mongoose.startSession();
//         session.startTransaction();
        
//         try {
//             // 1. Find the doctor and check new slot availability
//             const doctor = await Doctor.findById(doctorId);
//             if (!doctor) {
//                 throw new Error('Doctor not found');
//             }
            
//             // Find the new slot
//             const newSlotIndex = doctor.timeSlots.findIndex(slot => 
//                 slot._id.toString() === newSlotId
//             );
            
//             if (newSlotIndex === -1) {
//                 throw new Error('New time slot not found');
//             }
            
//             // Check if new slot is available
//             if (doctor.timeSlots[newSlotIndex].status !== 'available') {
//                 throw new Error('Selected time slot is no longer available');
//             }
            
//             // Parse new appointment date
//             const parsedNewDate = new Date(newAppointmentDate);
//             if (isNaN(parsedNewDate.getTime())) {
//                 throw new Error('Invalid new appointment date');
//             }
            
//             // Get the new slot's serial number
//             const newSlotSerialNumber = doctor.timeSlots[newSlotIndex].serialNumber || 0;
            
//             // 2. Free up the old slot (if it exists and is not already freed)
//             if (appointment.slotId) {
//                 const oldSlotIndex = doctor.timeSlots.findIndex(slot => 
//                     slot._id.toString() === appointment.slotId
//                 );
                
//                 if (oldSlotIndex !== -1) {
//                     console.log(`🔓 Freeing old slot: ${appointment.slotId}`);
//                     doctor.timeSlots[oldSlotIndex].status = 'available';
//                     doctor.timeSlots[oldSlotIndex].patientInfo = null;
//                 }
//             }
            
//             // 3. Book the new slot
//             console.log(`🔒 Booking new slot: ${newSlotId}`);
//             doctor.timeSlots[newSlotIndex].status = 'booked';
//             doctor.timeSlots[newSlotIndex].patientInfo = {
//                 name: appointment.patient.fullName,
//                 phone: appointment.patient.phone,
//                 email: appointment.patient.email,
//                 appointmentId: appointment._id,
//                 serialNumber: newSlotSerialNumber
//             };
            
//             // Save doctor with updated slots
//             await doctor.save({ session });
            
//             // 4. Update the appointment with new details
//             const updateData = {
//                 appointmentDate: parsedNewDate,
//                 appointmentTime: newAppointmentTime,
//                 endTime: doctor.timeSlots[newSlotIndex].endTime,
//                 slotId: newSlotId,
//                 slotSerialNumber: newSlotSerialNumber,
//                 status: 'pending', // Set back to pending for admin approval
//                 updatedAt: new Date()
//             };
            
//             // Update appointment fields
//             Object.keys(updateData).forEach(key => {
//                 appointment[key] = updateData[key];
//             });
            
//             await appointment.save({ session });
            
//             // Commit transaction
//             await session.commitTransaction();
//             session.endSession();
            
//             console.log('✅ Appointment rescheduled successfully');
            
//             res.json({
//                 success: true,
//                 message: 'Appointment rescheduled successfully. It is now pending approval.',
//                 data: {
//                     appointment: appointment,
//                     newSlotDetails: {
//                         date: parsedNewDate,
//                         time: newAppointmentTime,
//                         serialNumber: newSlotSerialNumber,
//                         doctorName: doctor.name
//                     }
//                 }
//             });
            
//         } catch (transactionError) {
//             // Rollback transaction
//             await session.abortTransaction();
//             session.endSession();
            
//             console.error('❌ Transaction error:', transactionError);
            
//             // Provide specific error messages
//             if (transactionError.message.includes('no longer available')) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'The selected time slot is no longer available. Please choose another slot.'
//                 });
//             }
            
//             throw transactionError;
//         }
        
//     } catch (error) {
//         console.error('❌ Error rescheduling appointment:', error);
        
//         if (error.name === 'CastError') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid appointment ID format'
//             });
//         }
        
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to reschedule appointment'
//         });
//     }
// };
// Reschedule appointment (for clients) - UPDATED WITH EMAIL
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            newSlotId, 
            newAppointmentDate, 
            newAppointmentTime 
        } = req.body;
        
        console.log('🔄 === CLIENT RESCHEDULE REQUEST ===');
        console.log('👤 Client:', req.user.email);
        console.log('📦 Request body:', req.body);
        
        // Validate required fields
        if (!newSlotId || !newAppointmentDate || !newAppointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: newSlotId, newAppointmentDate, newAppointmentTime'
            });
        }
        
        // Find the appointment
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        // Authorization check: client can only reschedule their own appointments
        if (appointment.patient.email.toLowerCase() !== req.user.email.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'You can only reschedule your own appointments'
            });
        }
        
        // Check if appointment can be rescheduled
        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot reschedule a cancelled appointment'
            });
        }
        
        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot reschedule a completed appointment'
            });
        }
        
        // Check if appointment time has already passed
        const appointmentDateTime = new Date(appointment.appointmentDate);
        const [appointmentHour, appointmentMinute] = appointment.appointmentTime.split(':').map(Number);
        appointmentDateTime.setHours(appointmentHour, appointmentMinute, 0, 0);
        
        const now = new Date();
        
        if (appointmentDateTime < now) {
            return res.status(400).json({
                success: false,
                message: 'Cannot reschedule past appointments',
                isTimePassed: true
            });
        }
        
        // Get doctor ID
        const doctorId = appointment.doctorId._id || appointment.doctorId;
        
        console.log('📋 Current appointment:', {
            oldDate: appointment.appointmentDate,
            oldTime: appointment.appointmentTime,
            oldSlotId: appointment.slotId,
            oldSerial: appointment.slotSerialNumber
        });
        
        // Store old appointment details for email
        const oldAppointmentDetails = {
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
            serialNumber: appointment.slotSerialNumber
        };
        
        // Start transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // 1. Find the doctor and check new slot availability
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            
            // Find the new slot
            const newSlotIndex = doctor.timeSlots.findIndex(slot => 
                slot._id.toString() === newSlotId
            );
            
            if (newSlotIndex === -1) {
                throw new Error('New time slot not found');
            }
            
            // Check if new slot is available
            if (doctor.timeSlots[newSlotIndex].status !== 'available') {
                throw new Error('Selected time slot is no longer available');
            }
            
            // Parse new appointment date
            const parsedNewDate = new Date(newAppointmentDate);
            if (isNaN(parsedNewDate.getTime())) {
                throw new Error('Invalid new appointment date');
            }
            
            // Get the new slot's serial number
            const newSlotSerialNumber = doctor.timeSlots[newSlotIndex].serialNumber || 0;
            
            // 2. Free up the old slot (if it exists and is not already freed)
            if (appointment.slotId) {
                const oldSlotIndex = doctor.timeSlots.findIndex(slot => 
                    slot._id.toString() === appointment.slotId
                );
                
                if (oldSlotIndex !== -1) {
                    console.log(`🔓 Freeing old slot: ${appointment.slotId}`);
                    doctor.timeSlots[oldSlotIndex].status = 'available';
                    doctor.timeSlots[oldSlotIndex].patientInfo = null;
                }
            }
            
            // 3. Book the new slot
            console.log(`🔒 Booking new slot: ${newSlotId}`);
            doctor.timeSlots[newSlotIndex].status = 'booked';
            doctor.timeSlots[newSlotIndex].patientInfo = {
                name: appointment.patient.fullName,
                phone: appointment.patient.phone,
                email: appointment.patient.email,
                appointmentId: appointment._id,
                serialNumber: newSlotSerialNumber
            };
            
            // Save doctor with updated slots
            await doctor.save({ session });
            
            // 4. Update the appointment with new details
            const updateData = {
                appointmentDate: parsedNewDate,
                appointmentTime: newAppointmentTime,
                endTime: doctor.timeSlots[newSlotIndex].endTime,
                slotId: newSlotId,
                slotSerialNumber: newSlotSerialNumber,
                status: 'pending', // Set back to pending for admin approval
                updatedAt: new Date()
            };
            
            // Update appointment fields
            Object.keys(updateData).forEach(key => {
                appointment[key] = updateData[key];
            });
            
            await appointment.save({ session });
            
            // 5. Send reschedule notification email (AFTER successful update)
            let emailResult = null;
            try {
                console.log('📧 Preparing to send reschedule notification email...');
                
                emailResult = await emailService.sendAppointmentRescheduled({
                    patient: appointment.patient,
                    doctor: appointment.doctorInfo,
                    oldAppointmentDate: oldAppointmentDetails.date,
                    oldAppointmentTime: oldAppointmentDetails.time,
                    newAppointmentDate: parsedNewDate,
                    newAppointmentTime: newAppointmentTime,
                    slotSerialNumber: newSlotSerialNumber,
                    appointmentId: appointment._id,
                    remarks: 'Your appointment has been rescheduled. It is now pending approval by the clinic.'
                });

                // Update appointment with email status
                if (emailResult.success) {
                    appointment.emailSent = emailResult.success;
                    appointment.lastEmailType = 'reschedule';
                    appointment.lastEmailSentAt = new Date();
                    appointment.emailMessageId = emailResult.messageId;
                    await appointment.save({ session });
                    
                    console.log('✅ Reschedule notification email sent successfully');
                } else {
                    console.log('⚠️ Email service returned error:', emailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
                // Don't fail the whole transaction if email fails
            }
            
            // Commit transaction
            await session.commitTransaction();
            session.endSession();
            
            console.log('✅ Appointment rescheduled successfully');
            
            // Prepare response
            const responseData = {
                success: true,
                message: 'Appointment rescheduled successfully. It is now pending approval.',
                data: {
                    appointment: appointment,
                    newSlotDetails: {
                        date: parsedNewDate,
                        time: newAppointmentTime,
                        serialNumber: newSlotSerialNumber,
                        doctorName: doctor.name
                    }
                }
            };
            
            // Add email status to response if email was sent
            if (emailResult) {
                responseData.emailStatus = {
                    sent: emailResult.success,
                    messageId: emailResult.messageId,
                    error: emailResult.error
                };
            }
            
            res.json(responseData);
            
        } catch (transactionError) {
            // Rollback transaction
            await session.abortTransaction();
            session.endSession();
            
            console.error('❌ Transaction error:', transactionError);
            
            // Provide specific error messages
            if (transactionError.message.includes('no longer available')) {
                return res.status(409).json({
                    success: false,
                    message: 'The selected time slot is no longer available. Please choose another slot.'
                });
            }
            
            throw transactionError;
        }
        
    } catch (error) {
        console.error('❌ Error rescheduling appointment:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid appointment ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reschedule appointment'
        });
    }
};





// Add this method to appointmentController.js
exports.sendRescheduleEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const emailData = req.body;
    
    console.log('📧 === SEND RESCHEDULE EMAIL ===');
    console.log('Appointment ID:', id);
    console.log('Email Data:', emailData);
    
    // Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Send reschedule email
    const emailResult = await emailService.sendAppointmentRescheduled({
      patient: appointment.patient,
      doctor: appointment.doctorInfo,
      oldAppointmentDate: emailData.oldAppointmentDate || appointment.appointmentDate,
      oldAppointmentTime: emailData.oldAppointmentTime || appointment.appointmentTime,
      newAppointmentDate: emailData.newAppointmentDate,
      newAppointmentTime: emailData.newAppointmentTime,
      slotSerialNumber: emailData.slotSerialNumber || appointment.slotSerialNumber,
      appointmentId: appointment._id,
      remarks: emailData.remarks || 'Your appointment has been rescheduled by the clinic.'
    });
    
    // Update appointment with email status
    if (emailResult.success) {
      appointment.emailSent = true;
      appointment.lastEmailType = 'reschedule';
      appointment.lastEmailSentAt = new Date();
      appointment.emailMessageId = emailResult.messageId;
      await appointment.save();
    }
    
    res.json({
      success: emailResult.success,
      message: emailResult.success 
        ? 'Reschedule email sent successfully' 
        : 'Failed to send email',
      emailResult: emailResult
    });
    
  } catch (error) {
    console.error('❌ Error sending reschedule email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send reschedule email'
    });
  }
};