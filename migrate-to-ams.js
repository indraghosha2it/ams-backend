// simple-migrate.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateToAMS() {
  let testClient, amsClient;
  
  try {
    console.log('🚀 Starting migration from test to ams database...');
    
    // Connect to MongoDB
    testClient = new MongoClient('mongodb://localhost:27017');
    amsClient = new MongoClient('mongodb://localhost:27017');
    
    await testClient.connect();
    await amsClient.connect();
    
    console.log('✅ Connected to MongoDB');
    
    const testDb = testClient.db('test');
    const amsDb = amsClient.db('ams');
    
    // Get all collections
    const collections = await testDb.listCollections().toArray();
    
    console.log(`📊 Found ${collections.length} collection(s) in test database`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\n📦 Migrating: ${collectionName}`);
      
      const documents = await testDb.collection(collectionName).find({}).toArray();
      
      if (documents.length > 0) {
        console.log(`   📄 Found ${documents.length} document(s)`);
        
        // Clear existing data
        await amsDb.collection(collectionName).deleteMany({});
        
        // Insert new data
        const result = await amsDb.collection(collectionName).insertMany(documents);
        console.log(`   ✅ Migrated ${result.insertedCount} document(s)`);
      } else {
        console.log(`   ⏭️  No documents to migrate`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Update your .env file with:');
    console.log('MONGODB_URI=mongodb://localhost:27017/ams');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    if (testClient) await testClient.close();
    if (amsClient) await amsClient.close();
    process.exit(0);
  }
}

migrateToAMS();