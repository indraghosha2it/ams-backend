// src/controllers/doctorController.js
const Doctor = require('../models/doctor');
const { generateSlots, generateSlotsForDate } = require('../utils/slotGenerator');

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
exports.generateDoctorSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { days = 30 } = req.body;
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Generate slots
        const slots = generateSlots(doctor, days);
        
        // Update doctor with generated slots
        doctor.timeSlots = slots;
        doctor.lastSlotGeneration = new Date();
        await doctor.save();
        
        res.json({
            success: true,
            message: `Generated ${slots.length} slots for the next ${days} days`,
            data: {
                slots,
                generatedOn: doctor.lastSlotGeneration
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
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
exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        // Fields to exclude from update
        const excludedFields = ['timeSlots', 'lastSlotGeneration', '_id', '__v'];
        
        // Update all fields except excluded ones
        Object.keys(updates).forEach(key => {
            if (!excludedFields.includes(key)) {
                doctor[key] = updates[key];
            }
        });
        
        // Handle image update
        if (req.file) {
            doctor.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }
        
        await doctor.save();
        
        res.json({
            success: true,
            message: 'Doctor updated successfully',
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
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