const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'processing', 'booked', 'unavailable'],
        default: 'available'
    },
    patientInfo: {
        name: String,
        phone: String,
        email: String,
        appointmentId: mongoose.Schema.Types.ObjectId
    }

},  { 
    _id: true, // MAKE SURE THIS IS TRUE - This ensures each slot gets an _id
    timestamps: false 
});;

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    speciality: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
        location: {
        type: String,
        trim: true,
        default: ''
    },
    // UPDATED: Changed from bio to description
    description: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        url: String,
        public_id: String
    },
    perPatientTime: {
        type: Number,
        default: 15,
        min: 10,
        max: 60
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave'],
        default: 'active'
    },
   
    
    // Weekly Schedule - UPDATED: Make startTime and endTime not required
   schedule: [{
        day: {
            type: String,
            enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        startTime: {
            type: String, // Format: "09:00"
        },
        endTime: {
            type: String, // Format: "17:00"
        },
        isWorking: {
            type: Boolean,
            default: true
        },
        breakTimes: [{  // ADD THIS FIELD
            startTime: String, // Format: "12:00"
            endTime: String    // Format: "13:00"
        }]
    }],
    
    // Off days (specific dates)
    offDays: [{
        date: Date,
        reason: String
    }],
    
    // Generated slots (for next 30 days)
    timeSlots: [timeSlotSchema],
    
    // Last slot generation date
    lastSlotGeneration: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);