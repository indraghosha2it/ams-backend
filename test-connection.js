// test-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('✅ Connection successful!');
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`📁 Collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();