// test-atlas.js
require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('🔗 Testing MongoDB Atlas connection...');
  
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI not found in .env');
    return;
  }
  
  // Mask password for security
  const maskedURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
  console.log('📡 Connection string:', maskedURI);
  
  try {
    // Connect with options for Atlas
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Check current database
    console.log('💾 Database:', mongoose.connection.name);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📊 Collections in '${mongoose.connection.name}' database:`);
    
    if (collections.length === 0) {
      console.log('   (No collections yet - database is empty)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 Connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Atlas cluster is running');
    console.log('3. Check if IP is whitelisted in Atlas');
    console.log('4. Verify username/password in connection string');
    
    // Check for specific Atlas errors
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n⚠️  Network/DNS issue - check your internet');
    }
    if (error.message.includes('authentication')) {
      console.log('\n⚠️  Auth issue - check username/password');
    }
  }
}

testAtlasConnection();