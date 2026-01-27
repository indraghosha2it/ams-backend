// test-slots.js - Place this in your backend root folder
const mongoose = require('mongoose');
const { debugSlotGeneration, generateSlots } = require('./src/utils/slotGenerator');

// Your MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/your-database-name';

async function testSlotGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Import Doctor model
    const Doctor = require('./src/models/Doctor');
    
    // Find your test doctor (use the ID from your data)
    const doctor = await Doctor.findById('69788841c45d3cf61a3f5cf3');
    
    if (!doctor) {
      console.log('Doctor not found');
      return;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Testing slot generation for Dr. ${doctor.name}`);
    console.log('='.repeat(60));
    
    // Debug the specific issue
    debugSlotGeneration(doctor, '2026-01-29');
    
    // Test generateSlotsForDate for key dates
    console.log('\n🧪 TESTING KEY DATES:');
    console.log('='.repeat(60));
    
    const testDates = [
      { date: '2026-01-26', expected: 'Working Monday (no breaks)' },
      { date: '2026-01-27', expected: 'Working Tuesday (break 10:00-10:30)' },
      { date: '2026-01-28', expected: 'Non-working Wednesday' },
      { date: '2026-01-29', expected: 'OFF DAY (should be 0 slots!)' },
      { date: '2026-01-30', expected: 'Working Friday (9:00-13:00)' },
    ];
    
    const { generateSlotsForDate } = require('./src/utils/slotGenerator');
    
    for (const test of testDates) {
      const slots = generateSlotsForDate(doctor, test.date);
      const passed = test.date === '2026-01-29' ? slots.length === 0 : slots.length > 0;
      
      console.log(`\n📅 ${test.date} - ${test.expected}`);
      console.log(`   Generated: ${slots.length} slots`);
      console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      
      if (slots.length > 0 && slots.length <= 5) {
        console.log(`   Sample slots: ${slots.map(s => s.startTime).join(', ')}`);
      }
    }
    
    // Also test the main generateSlots function
    console.log('\n' + '='.repeat(60));
    console.log('TESTING MAIN GENERATE SLOTS FUNCTION (30 days)');
    console.log('='.repeat(60));
    
    const allSlots = generateSlots(doctor, 30);
    
    // Check for slots on off days
    const offDaySlots = allSlots.filter(slot => slot.date === '2026-01-29');
    console.log(`\nTotal slots generated: ${allSlots.length}`);
    console.log(`Slots on off day (2026-01-29): ${offDaySlots.length} ${offDaySlots.length === 0 ? '✅' : '❌'}`);
    
    if (offDaySlots.length > 0) {
      console.log('ERROR: Found slots on off day!');
      console.log(offDaySlots);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testSlotGeneration();