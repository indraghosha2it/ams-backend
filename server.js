// server.js - UPDATED FOR MONGODB ATLAS
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Appointment Management System Backend...');
console.log('📡 Connecting to MongoDB Atlas...');
console.log('='.repeat(50));

// Middleware

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

// Import routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const staffRoutes = require('./src/routes/staff');
const clientRoutes = require('./src/routes/client');
const doctorRoutes = require('./src/routes/doctor');
// Add this import with other route imports
const appointmentRoutes = require('./src/routes/appointment');

// ====================
// ROUTES
// ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    success: true,
    status: 'healthy',
    message: 'Appointment Management System API',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'not connected',
      host: mongoose.connection.host || 'not connected'
    },
    server: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      node: process.version
    }
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Appointment Management System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        registerClient: 'POST /api/auth/register/client',
        registerBusiness: 'POST /api/auth/register/business',
        login: 'POST /api/auth/login',
        getCurrentUser: 'GET /api/auth/me (requires auth token)'
      },
      health: 'GET /api/health'
    }
  });
});
app.post('/api/test-appointment', (req, res) => {
    console.log('📝 Test appointment endpoint hit');
    console.log('📦 Request body:', req.body);
    
    res.json({
        success: true,
        message: 'Test endpoint works!',
        receivedData: req.body
    });
});
// Simple test to verify appointment creation works
app.post('/api/appointments-test', async (req, res) => {
    try {
        console.log('🔧 Testing appointment creation...');
        
        // Test data
        const testData = {
            doctorId: '69799d40b4dd840d34875f84',
            slotId: 'test-slot-' + Date.now(),
            patient: {
                fullName: 'Test Patient',
                email: 'test@example.com',
                phone: '1234567890',
                dateOfBirth: '1990-01-01',
                gender: 'male',
                address: 'Test Address',
                reason: 'Test appointment'
            },
            appointmentDate: '2026-01-28',
            appointmentTime: '09:40',
            status: 'pending'
        };
        
        console.log('📦 Test data:', testData);
        
        // Test if Appointment model exists
        const Appointment = require('./src/models/appointment');
        console.log('✅ Appointment model loaded');
        
        // Test if Doctor model exists
        const Doctor = require('./src/models/doctor');
        console.log('✅ Doctor model loaded');
        
        // Test MongoDB connection
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState;
        console.log('📊 MongoDB connection status:', 
            dbStatus === 1 ? 'Connected' : 
            dbStatus === 2 ? 'Connecting' : 
            dbStatus === 3 ? 'Disconnecting' : 'Disconnected');
        
        res.json({
            success: true,
            message: 'Test completed',
            models: {
                appointment: 'Loaded',
                doctor: 'Loaded'
            },
            mongodb: {
                status: dbStatus,
                connected: dbStatus === 1
            }
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
});
// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Add this line
app.use('/api/staff', staffRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    suggestion: 'Check /api for available endpoints'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('⚠️  Server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ====================
// MONGODB ATLAS CONNECTION
// ====================

async function connectToMongoDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    
    // Mask password for security in logs
    const maskedURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
    console.log('📡 Connecting to:', maskedURI);
    
    // MongoDB Atlas connection options
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for Atlas
      maxPoolSize: 10, // Connection pool size
      retryWrites: true,
      w: 'majority'
    };
    
    console.log('⏳ Attempting connection...');
    await mongoose.connect(mongoURI, connectionOptions);
    
    return mongoose.connection;
    
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

// ====================
// START SERVER
// ====================

async function startServer() {
  try {
    // Connect to MongoDB Atlas
    const dbConnection = await connectToMongoDB();
    
    console.log('='.repeat(50));
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log(`💾 Database: ${dbConnection.name}`);
    console.log(`📍 Host: ${dbConnection.host}`);
    console.log('='.repeat(50));
    
    // Database connection event listeners
    dbConnection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    dbConnection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    dbConnection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🎉 Express server running on http://localhost:${PORT}`);
      console.log('='.repeat(50));
      console.log('\n📋 AVAILABLE ENDPOINTS:');
      console.log('='.repeat(50));
      
      console.log('\n🔐 AUTHENTICATION:');
      console.log('-'.repeat(30));
      console.log(`POST   http://localhost:${PORT}/api/auth/register/client`);
      console.log(`POST   http://localhost:${PORT}/api/auth/register/business`);
      console.log(`POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`GET    http://localhost:${PORT}/api/auth/me (protected)`);
      
      console.log('\n📊 SYSTEM:');
      console.log('-'.repeat(30));
      console.log(`GET    http://localhost:${PORT}/api/health`);
      console.log(`GET    http://localhost:${PORT}/api`);
      
      console.log('\n🛠️  QUICK TEST COMMANDS:');
      console.log('-'.repeat(30));
      console.log('Register a client:');
      console.log(`curl -X POST http://localhost:${PORT}/api/auth/register/client \\`);
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"name":"Test User","email":"test@example.com","password":"Test123!"}\'');
      
      console.log('\nCheck health:');
      console.log(`curl http://localhost:${PORT}/api/health`);
      
      console.log('\n' + '='.repeat(50));
      console.log('💡 Your users will be saved in "ams" database on MongoDB Atlas');
      console.log('='.repeat(50));
    });
    
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ SERVER STARTUP FAILED');
    console.error('='.repeat(50));
    console.error('\nError:', error.message);
    
    console.log('\n🔧 TROUBLESHOOTING CHECKLIST:');
    console.log('-'.repeat(30));
    console.log('1. ✅ Check .env file exists with MONGODB_URI');
    console.log('2. ✅ Verify MongoDB Atlas cluster is running (green status)');
    console.log('3. ✅ Check internet connection');
    console.log('4. ✅ Verify IP is whitelisted in Atlas Network Access');
    console.log('5. ✅ Confirm database user credentials are correct');
    console.log('6. ✅ Ensure connection string includes /ams database name');
    
    console.log('\n📝 YOUR CONNECTION STRING SHOULD LOOK LIKE:');
    console.log('mongodb+srv://username:password@cluster.mongodb.net/ams?retryWrites=true&w=majority');
    
    console.log('\n⚠️  Starting server in limited mode (database features disabled)...');
    console.log('-'.repeat(50));
    
    // Start server without database (auth won't work)
    app.listen(PORT, () => {
      console.log(`\n⚠️  Server running on http://localhost:${PORT} (LIMITED MODE)`);
      console.log('📝 Note: Authentication endpoints will return errors');
      console.log('📝 Note: Only /api and /api/health will work');
      console.log('\n💡 To enable full features:');
      console.log('   1. Fix MongoDB Atlas connection');
      console.log('   2. Restart the server');
      console.log('='.repeat(50));
    });
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🔻 Shutting down gracefully...');
  
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
  
  console.log('👋 Server stopped');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app; // For testing purposes