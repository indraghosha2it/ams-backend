// src/controllers/doctorController.js
const Doctor = require('../models/doctor');
const { generateSlots, generateSlotsForDate } = require('../utils/slotGenerator');
// Add this helper function at the top of doctorController.js
const timeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === '' || timeStr === undefined) return 0;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    
    return hours * 60 + minutes;
};

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