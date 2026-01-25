// generate-secret.js
// crypto is now built into Node.js, no need to install
const crypto = require('crypto');

console.log('🔐 Generating JWT Secret Key...\n');

// Generate a secure random key
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ Your JWT Secret Key:');
console.log('JWT_SECRET=' + jwtSecret);

console.log('\n📋 Copy this to your .env file:');
console.log('\n--- START .env ---');
console.log('MONGODB_URI=mongodb://localhost:27017/appointment_system');
console.log('JWT_SECRET=' + jwtSecret);
console.log('PORT=5000');
console.log('NODE_ENV=development');
console.log('--- END .env ---');

console.log('\n⚠️  Security Notes:');
console.log('1. Keep this key secret!');
console.log('2. Never commit .env file to git');
console.log('3. Use different keys for development/production');
console.log('4. Store in environment variables in production');