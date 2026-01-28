// src/controllers/doctorController.js
const mongoose = require('mongoose');
const Doctor = require('../models/doctor');
const { generateSlots, generateSlotsForDate, timeToMinutes, 
  formatTime, 
  parseDate, 
  formatDate  } = require('../utils/slotGenerator');
// Add this helper function at the top of doctorController.js



// Create new doctor
exports.createDoctor = async (req, res) => {
    try {
        console.log('📥 === CREATE DOCTOR REQUEST ===');
        console.log('📋 Headers:', req.headers);
        console.log('📦 Body received:', JSON.stringify(req.body, null, 2));
        
        // Extract ALL fields including new fields
        const { 
            name, email, phone, speciality, designation, 
            perPatientTime, description, status, schedule, offDays, 
            location, // NEW FIELD
            image
        } = req.body;
        
        console.log('🔍 Parsed fields:');
        console.log('- name:', name);
        console.log('- email:', email);
        console.log('- location:', location); // NEW LOG
        console.log('- description:', description); // UPDATED LOG
        console.log('- image received:', image);
        console.log('- has image data?', !!image);
        
        // Validate required fields
        if (!name || !email || !speciality || !designation) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Name, email, speciality, and designation are required'
            });
        }
        
        // Parse schedule and offDays
        let parsedSchedule = [];
        let parsedOffDays = [];
        
        try {
            if (schedule) {
                parsedSchedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
                console.log('📅 Parsed schedule:', parsedSchedule);
            }
            
            if (offDays) {
                parsedOffDays = typeof offDays === 'string' ? JSON.parse(offDays) : offDays;
                console.log('📅 Parsed offDays:', parsedOffDays);
            }
        } catch (parseError) {
            console.log('⚠️ Parse error, using empty arrays:', parseError);
        }
        
        // Create doctor object with ALL data including new fields
        const doctorData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : '',
            speciality: speciality.trim(),
            designation: designation.trim(),
            location: location ? location.trim() : '', // NEW FIELD
            description: description ? description.trim() : '', // UPDATED FIELD (was bio)
            perPatientTime: perPatientTime ? Number(perPatientTime) : 15,
            status: status || 'active',
            schedule: parsedSchedule,
            offDays: parsedOffDays
        };
        
        // Add image if provided in request body
        if (image && image.url && image.public_id) {
            console.log('📸 Adding image to doctor data:', image);
            doctorData.image = {
                url: image.url,
                public_id: image.public_id
            };
        } else if (req.file) {
            // Fallback for file upload via form-data
            console.log('📸 Using uploaded file:', req.file);
            doctorData.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        } else {
            console.log('📸 No image provided');
        }
        
        console.log('💾 Creating doctor with data:', JSON.stringify(doctorData, null, 2));
        
        const doctor = new Doctor(doctorData);
        
        console.log('💾 Saving doctor to database...');
        
        await doctor.save();
        
        console.log('✅ Doctor saved successfully!');
        console.log('- ID:', doctor._id);
        console.log('- Name:', doctor.name);
        console.log('- Email:', doctor.email);
        console.log('- Location:', doctor.location); // NEW LOG
        console.log('- Description:', doctor.description); // UPDATED LOG
        console.log('- Image saved:', doctor.image);
        
        res.status(201).json({
            success: true,
            message: 'Doctor created successfully',
            data: doctor
        });
    } catch (error) {
        console.error('❌ Error creating doctor:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', error);
        
        // Check if it's a MongoDB validation error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            console.error('❌ Validation errors:', messages);
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + messages.join(', ')
            });
        }
        
        // Check if it's a duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create doctor'
        });
    }
};

// Get doctor by ID
exports.getDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        // Select specific fields - now includes location and description
        const doctors = await Doctor.find().select('name email phone speciality designation location description image perPatientTime status schedule offDays timeSlots lastSlotGeneration createdAt updatedAt');
        
        res.json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Generate slots for a doctor
// exports.generateDoctorSlots = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { days = 30 } = req.body;
        
//         const doctor = await Doctor.findById(id);
        
//         if (!doctor) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Doctor not found'
//             });
//         }
        
//         // Generate slots
//         const slots = generateSlots(doctor, days);
        
//         // Update doctor with generated slots
//         doctor.timeSlots = slots;
//         doctor.lastSlotGeneration = new Date();
//         await doctor.save();
        
//         res.json({
//             success: true,
//             message: `Generated ${slots.length} slots for the next ${days} days`,
//             data: {
//                 slots,
//                 generatedOn: doctor.lastSlotGeneration
//             }
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
// Generate slots for a doctor - UPDATED TO PRESERVE EXISTING STATUSES
exports.generateDoctorSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { days = 30 } = req.body;
        
        console.log(`\n🔄 === GENERATING SLOTS FOR DOCTOR ${id} ===`);
        console.log(`📅 Days: ${days}`);
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Get existing slots
        const existingSlots = doctor.timeSlots || [];
        console.log(`📊 Existing slots: ${existingSlots.length}`);
        
        // Count existing slots by status
        const bookedCount = existingSlots.filter(s => s.status === 'booked').length;
        const processingCount = existingSlots.filter(s => s.status === 'processing').length;
        const unavailableCount = existingSlots.filter(s => s.status === 'unavailable').length;
        const availableCount = existingSlots.filter(s => s.status === 'available').length;
        
        console.log(`   📅 Booked slots: ${bookedCount}`);
        console.log(`   ⏳ Processing slots: ${processingCount}`);
        console.log(`   🚫 Unavailable slots: ${unavailableCount}`);
        console.log(`   ✅ Available slots: ${availableCount}`);
        
        // Generate NEW slots using the updated generateSlots function
        console.log(`\n🎯 Generating new slots...`);
        const newSlots = generateSlots(doctor, days);
        
        console.log(`📊 New slots generated: ${newSlots.length}`);
        
        // Create a map of existing slots for quick lookup
        const existingSlotsMap = new Map();
        existingSlots.forEach(slot => {
            // Convert slot date to consistent format
            let dateStr;
            try {
                const slotDate = typeof slot.date === 'string' ? new Date(slot.date) : slot.date;
                const year = slotDate.getUTCFullYear();
                const month = (slotDate.getUTCMonth() + 1).toString().padStart(2, '0');
                const day = slotDate.getUTCDate().toString().padStart(2, '0');
                dateStr = `${year}-${month}-${day}`;
            } catch (error) {
                console.error(`❌ Error parsing slot date:`, slot.date);
                return;
            }
            
            const key = `${dateStr}_${slot.startTime}_${slot.endTime}`;
            existingSlotsMap.set(key, {
                ...slot.toObject ? slot.toObject() : slot,
                _id: slot._id
            });
        });
        
        // Merge slots: if slot exists, keep its status; if new, add as available
        const mergedSlots = newSlots.map(newSlot => {
            const key = `${newSlot.date}_${newSlot.startTime}_${newSlot.endTime}`;
            
            if (existingSlotsMap.has(key)) {
                // Slot exists - preserve it with its current status
                const existingSlot = existingSlotsMap.get(key);
                console.log(`   🔄 Preserving slot: ${key} (Status: ${existingSlot.status})`);
                
                // Return the existing slot with all its data
                return {
                    date: newSlot.date, // Use the date from new slot (already formatted)
                    startTime: newSlot.startTime,
                    endTime: newSlot.endTime,
                    status: existingSlot.status,
                    doctorId: doctor._id,
                    day: newSlot.day,
                    _id: existingSlot._id, // Keep original ID
                    patientInfo: existingSlot.patientInfo || null
                };
            } else {
                // New slot - create as available
                console.log(`   ➕ New slot: ${key}`);
                return {
                    ...newSlot,
                    status: 'available'
                };
            }
        });
        
        // Add any existing slots that were for future dates beyond regeneration range
        // but we should keep them (like booked slots for future dates)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        existingSlots.forEach(existingSlot => {
            try {
                const slotDate = typeof existingSlot.date === 'string' ? new Date(existingSlot.date) : existingSlot.date;
                
                // Skip if slot date is in the past
                if (slotDate < today) return;
                
                // Format date for key
                const year = slotDate.getUTCFullYear();
                const month = (slotDate.getUTCMonth() + 1).toString().padStart(2, '0');
                const day = slotDate.getUTCDate().toString().padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const key = `${dateStr}_${existingSlot.startTime}_${existingSlot.endTime}`;
                
                // Check if this slot is not already in mergedSlots
                const alreadyExists = mergedSlots.some(slot => {
                    const mergedKey = `${slot.date}_${slot.startTime}_${slot.endTime}`;
                    return mergedKey === key;
                });
                
                if (!alreadyExists) {
                    console.log(`   📅 Preserving future slot beyond range: ${key} (Status: ${existingSlot.status})`);
                    
                    mergedSlots.push({
                        date: dateStr,
                        startTime: existingSlot.startTime,
                        endTime: existingSlot.endTime,
                        status: existingSlot.status,
                        doctorId: doctor._id,
                        day: slotDate.toLocaleDateString('en-US', { weekday: 'long' }),
                        _id: existingSlot._id,
                        patientInfo: existingSlot.patientInfo || null
                    });
                }
            } catch (error) {
                console.error(`❌ Error processing existing slot:`, error);
            }
        });
        
        // Sort slots by date and time
        mergedSlots.sort((a, b) => {
            if (a.date === b.date) {
                const aStart = timeToMinutes(a.startTime);
                const bStart = timeToMinutes(b.startTime);
                return aStart - bStart;
            }
            return a.date.localeCompare(b.date);
        });
        
        // Count final statistics
        const finalBookedCount = mergedSlots.filter(s => s.status === 'booked').length;
        const finalProcessingCount = mergedSlots.filter(s => s.status === 'processing').length;
        const finalUnavailableCount = mergedSlots.filter(s => s.status === 'unavailable').length;
        const finalAvailableCount = mergedSlots.filter(s => s.status === 'available').length;
        
        console.log(`\n📊 FINAL SLOT COUNT: ${mergedSlots.length}`);
        console.log(`   📅 Booked slots: ${finalBookedCount} (preserved)`);
        console.log(`   ⏳ Processing slots: ${finalProcessingCount} (preserved)`);
        console.log(`   🚫 Unavailable slots: ${finalUnavailableCount} (preserved)`);
        console.log(`   ✅ Available slots: ${finalAvailableCount} (existing + new)`);
        
        // Update doctor with merged slots
        doctor.timeSlots = mergedSlots;
        doctor.lastSlotGeneration = new Date();
        
        await doctor.save();
        
        res.json({
            success: true,
            message: `Generated ${mergedSlots.length} slots for the next ${days} days`,
            data: {
                slots: mergedSlots,
                generatedOn: doctor.lastSlotGeneration,
                statistics: {
                    total: mergedSlots.length,
                    booked: finalBookedCount,
                    processing: finalProcessingCount,
                    unavailable: finalUnavailableCount,
                    available: finalAvailableCount
                }
            }
        });
    } catch (error) {
        console.error('❌ Error generating doctor slots:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to generate slots'
        });
    }
};

// Get available slots for a specific date
exports.getSlotsForDate = async (req, res) => {
    try {
        const { id, date } = req.params;
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Generate slots for the specific date
        const slots = generateSlotsForDate(doctor, date);
        
        res.json({
            success: true,
            data: {
                doctor: {
                    name: doctor.name,
                    speciality: doctor.speciality,
                    designation: doctor.designation,
                    location: doctor.location // NEW FIELD
                },
                date,
                slots,
                count: slots.length
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};




// Update doctor schedule
exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { schedule, offDays } = req.body;
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Update schedule if provided
        if (schedule) doctor.schedule = schedule;
        if (offDays) doctor.offDays = offDays;
        
        await doctor.save();
        
        res.json({
            success: true,
            message: 'Schedule updated successfully',
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};



// Get all available slots for a doctor
// Get all available slots for a doctor - IMPROVED VERSION
// Get all available slots for a doctor - FIXED WITH PROPER ERROR HANDLING
// Get all available slots for a doctor - UPDATED TO HANDLE SLOTS WITHOUT _id
exports.getAvailableSlots = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🔍 Fetching available slots for doctor ID: ${id}`);
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        console.log(`📊 Doctor: ${doctor.name}, Total slots: ${doctor.timeSlots?.length || 0}`);
        
        if (!doctor.timeSlots || doctor.timeSlots.length === 0) {
            return res.json({
                success: true,
                data: [],
                count: 0,
                message: 'No slots available'
            });
        }
        
        // Get current date (today at midnight UTC)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        console.log(`📅 Today's date (UTC): ${today.toISOString()}`);
        
        // Filter available and future slots
        const availableSlots = [];
        
        doctor.timeSlots.forEach((slot, index) => {
            try {
                // Skip if not available
                if (slot.status !== 'available') {
                    console.log(`❌ Slot not available: ${slot.date} ${slot.startTime} (Status: ${slot.status})`);
                    return;
                }
                
                // Parse date - handle MongoDB format
                let slotDate;
                if (slot.date && typeof slot.date === 'object' && slot.date.$date) {
                    // MongoDB format: {"$date": "2026-01-28T00:00:00.000Z"}
                    slotDate = new Date(slot.date.$date);
                } else if (slot.date) {
                    // Regular date string or Date object
                    slotDate = new Date(slot.date);
                } else {
                    console.log(`⚠️ Slot has no date:`, slot);
                    return;
                }
                
                // Normalize to UTC midnight for comparison
                const normalizedDate = new Date(Date.UTC(
                    slotDate.getUTCFullYear(),
                    slotDate.getUTCMonth(),
                    slotDate.getUTCDate()
                ));
                
                // Check if slot is in the future (including today)
                const isFuture = normalizedDate >= today;
                
                if (!isFuture) {
                    console.log(`⏰ Slot in past: ${normalizedDate.toISOString()} ${slot.startTime}`);
                    return;
                }
                
                // Calculate duration
                const duration = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
                
                // Generate a unique ID if _id is missing
                const slotId = slot._id 
                    ? slot._id.toString() 
                    : `slot-${doctor._id}-${formatDate(normalizedDate)}-${slot.startTime.replace(':', '')}`;
                
                availableSlots.push({
                    _id: slotId,
                    date: normalizedDate,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    duration: duration,
                    day: normalizedDate.toLocaleDateString('en-US', { weekday: 'long' }),
                    isBooked: false,
                    status: slot.status,
                    originalDate: slot.date,
                    isFuture: true,
                    hasOriginalId: !!slot._id
                });
                
            } catch (error) {
                console.error(`❌ Error processing slot at index ${index}:`, error);
                console.error('Slot data:', slot);
            }
        });
        
        console.log(`✅ Found ${availableSlots.length} available future slots out of ${doctor.timeSlots.length} total`);
        
        // Format for frontend
        const formattedSlots = availableSlots.map(slot => {
            try {
                const dateStr = formatDate(slot.date); // Use imported formatDate function
                
                return {
                    _id: slot._id,
                    date: dateStr, // YYYY-MM-DD format
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    duration: slot.duration,
                    day: slot.day,
                    isBooked: slot.isBooked,
                    status: slot.status,
                    formattedDate: slot.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    formattedTime: `${slot.startTime} - ${slot.endTime}`,
                    timestamp: slot.date.getTime()
                };
            } catch (error) {
                console.error('Error formatting slot:', error, slot);
                return null;
            }
        }).filter(slot => slot !== null); // Remove any null slots
        
        // Sort by date and time
        formattedSlots.sort((a, b) => {
            if (a.date === b.date) {
                return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
            }
            return new Date(a.date) - new Date(b.date);
        });
        
        console.log(`🎯 Sending ${formattedSlots.length} formatted slots to frontend`);
        
        if (formattedSlots.length > 0) {
            console.log(`📅 First slot: ${formattedSlots[0].formattedDate} ${formattedSlots[0].formattedTime} (ID: ${formattedSlots[0]._id})`);
            console.log(`📅 Sample slots:`, formattedSlots.slice(0, 3));
        }
        
        res.json({
            success: true,
            data: formattedSlots,
            count: formattedSlots.length,
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                perPatientTime: doctor.perPatientTime,
                speciality: doctor.speciality,
                designation: doctor.designation,
                location: doctor.location,
                description: doctor.description,
                image: doctor.image
            },
            message: `Found ${formattedSlots.length} available slots`
        });
        
    } catch (error) {
        console.error('❌ Error in getAvailableSlots:', error);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Debug endpoint to check doctor data
exports.debugDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🔍 DEBUG: Checking doctor ${id}`);
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Check slot data
        const slotSample = doctor.timeSlots?.slice(0, 3) || [];
        
        res.json({
            success: true,
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                totalSlots: doctor.timeSlots?.length || 0,
                schedule: doctor.schedule,
                offDays: doctor.offDays,
                perPatientTime: doctor.perPatientTime
            },
            sampleSlots: slotSample.map(slot => ({
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: slot.status,
                _id: slot._id
            })),
            slotStatusCount: {
                total: doctor.timeSlots?.length || 0,
                available: doctor.timeSlots?.filter(s => s.status === 'available').length || 0,
                booked: doctor.timeSlots?.filter(s => s.status === 'booked').length || 0,
                processing: doctor.timeSlots?.filter(s => s.status === 'processing').length || 0,
                unavailable: doctor.timeSlots?.filter(s => s.status === 'unavailable').length || 0
            },
            message: `Doctor ${doctor.name} has ${doctor.timeSlots?.length || 0} slots`
        });
    } catch (error) {
        console.error('❌ Debug error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Update doctor information
// exports.updateDoctor = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;
        
//         const doctor = await Doctor.findById(id);
        
//         if (!doctor) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Doctor not found'
//             });
//         }
        
//         // Fields to exclude from update
//         const excludedFields = ['timeSlots', 'lastSlotGeneration', '_id', '__v'];
        
//         // Update all fields except excluded ones
//         Object.keys(updates).forEach(key => {
//             if (!excludedFields.includes(key)) {
//                 doctor[key] = updates[key];
//             }
//         });
        
//         // Handle image update
//         if (req.file) {
//             doctor.image = {
//                 url: req.file.path,
//                 public_id: req.file.filename
//             };
//         }
        
//         await doctor.save();
        
//         res.json({
//             success: true,
//             message: 'Doctor updated successfully',
//             data: doctor
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// Update doctor information - FIXED VERSION
exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        console.log('🔄 === UPDATE DOCTOR REQUEST ===');
        console.log('🔍 Doctor ID:', id);
        console.log('📦 Update data keys:', Object.keys(updates));
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Fields that should NOT be updated via this endpoint
        // This prevents timeSlots from being accidentally overwritten
        const excludedFields = ['timeSlots', 'lastSlotGeneration', '_id', '__v', 'createdAt', 'updatedAt'];
        
        // Fields that are allowed to be updated
        const allowedFields = [
            'name', 'email', 'phone', 'speciality', 'designation',
            'location', 'description', 'perPatientTime', 'status',
            'schedule', 'offDays', 'image'
        ];
        
        console.log('📋 Filtering update fields...');
        
        // Only update allowed fields
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && !excludedFields.includes(key)) {
                console.log(`   ✅ Updating field: ${key}`);
                doctor[key] = updates[key];
            } else if (!allowedFields.includes(key)) {
                console.log(`   ⚠️ Skipping field: ${key} (not in allowed list)`);
            }
        });
        
        // Validate schedule and offDays
        if (updates.schedule) {
            console.log('📅 Processing schedule update');
            try {
                const schedule = Array.isArray(updates.schedule) ? updates.schedule : JSON.parse(updates.schedule);
                doctor.schedule = schedule;
            } catch (error) {
                console.error('❌ Error parsing schedule:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid schedule format'
                });
            }
        }
        
        if (updates.offDays) {
            console.log('📅 Processing offDays update');
            try {
                const offDays = Array.isArray(updates.offDays) ? updates.offDays : JSON.parse(updates.offDays);
                doctor.offDays = offDays;
            } catch (error) {
                console.error('❌ Error parsing offDays:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid offDays format'
                });
            }
        }
        
        // Handle image separately
        if (updates.image) {
            console.log('📸 Updating image');
            doctor.image = updates.image;
        }
        
        console.log('💾 Saving doctor...');
        
        // Validate before saving
        await doctor.validate();
        
        const updatedDoctor = await doctor.save();
        
        console.log('✅ Doctor updated successfully!');
        console.log('- Name:', updatedDoctor.name);
        console.log('- Email:', updatedDoctor.email);
        console.log('- Status:', updatedDoctor.status);
        
        res.json({
            success: true,
            message: 'Doctor updated successfully',
            data: updatedDoctor
        });
    } catch (error) {
        console.error('❌ Error updating doctor:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            console.error('❌ Validation errors:', messages);
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + messages.join(', ')
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update doctor'
        });
    }
};

// Update a specific time slot status
exports.updateSlotStatus = async (req, res) => {
    try {
        const { id, slotId } = req.params;
        const { status, patientInfo } = req.body;
        
        console.log(`🔄 Updating slot ${slotId} for doctor ${id}`);
        console.log('📦 New status:', status);
        console.log('📦 Patient info:', patientInfo);
        
        // Validate status
        const validStatuses = ['available', 'processing', 'booked', 'unavailable'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Find the slot in timeSlots array
        const slotIndex = doctor.timeSlots.findIndex(slot => 
            slot._id.toString() === slotId
        );
        
        if (slotIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Time slot not found'
            });
        }
        
        // Update the slot
        doctor.timeSlots[slotIndex].status = status;
        
        // If booking, add patient info
        if (status === 'booked' || status === 'processing') {
            doctor.timeSlots[slotIndex].patientInfo = patientInfo || null;
        } else {
            // Clear patient info for other statuses
            doctor.timeSlots[slotIndex].patientInfo = null;
        }
        
        await doctor.save();
        
        res.json({
            success: true,
            message: `Slot updated to ${status} status`,
            data: {
                slot: doctor.timeSlots[slotIndex],
                doctorName: doctor.name
            }
        });
    } catch (error) {
        console.error('❌ Error updating slot status:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update slot status'
        });
    }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await Doctor.findByIdAndDelete(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Doctor deleted successfully',
            data: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};