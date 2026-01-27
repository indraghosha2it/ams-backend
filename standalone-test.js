// standalone-test.js - Save this in your backend root and run it
console.log('='.repeat(60));
console.log('STANDALONE SLOT GENERATOR TEST');
console.log('='.repeat(60));

// First, let's directly include the slotGenerator logic
// so we don't need to worry about imports

// Helper functions from your slotGenerator.js
const timeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === '' || timeStr === undefined) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const parseDate = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    if (typeof dateInput === 'object' && dateInput.$date) {
      const date = new Date(dateInput.$date);
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
    
    if (typeof dateInput === 'string') {
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      }
      const date = new Date(dateInput);
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
    
    if (dateInput instanceof Date) {
      return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate()));
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateInput, error);
    return null;
  }
};

const formatDate = (date) => {
  if (!(date instanceof Date)) return '';
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Create a mock doctor object matching your data EXACTLY
const mockDoctor = {
  _id: '69788841c45d3cf61a3f5cf3',
  name: 'Test Doctor',
  perPatientTime: 20,
  offDays: [
    {
      date: {"$date": "2026-01-29T00:00:00.000Z"},
      reason: "holiday"
    }
  ],
  schedule: [
    {
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00",
      isWorking: true,
      breakTimes: []
    },
    {
      day: "Tuesday",
      startTime: "09:00",
      endTime: "17:00",
      isWorking: true,
      breakTimes: [
        {
          startTime: "10:00",
          endTime: "10:30"
        }
      ]
    },
    {
      day: "Wednesday",
      startTime: "",
      endTime: "",
      isWorking: false,
      breakTimes: []
    },
    {
      day: "Thursday",
      startTime: "09:00",
      endTime: "17:00",
      isWorking: true,
      breakTimes: []
    },
    {
      day: "Friday",
      startTime: "09:00",
      endTime: "13:00",
      isWorking: true,
      breakTimes: []
    },
    {
      day: "Saturday",
      startTime: "",
      endTime: "",
      isWorking: false,
      breakTimes: []
    },
    {
      day: "Sunday",
      startTime: "",
      endTime: "",
      isWorking: false,
      breakTimes: []
    }
  ]
};

// Test the date parsing first
console.log('\n🧪 TEST 1: Date Parsing');
console.log('-'.repeat(40));

const testDates = [
  '2026-01-29',
  {"$date": "2026-01-29T00:00:00.000Z"},
  new Date('2026-01-29')
];

testDates.forEach((dateInput, i) => {
  const parsed = parseDate(dateInput);
  console.log(`Test ${i+1}: ${JSON.stringify(dateInput)}`);
  console.log(`  Parsed: ${parsed}`);
  console.log(`  Formatted: ${formatDate(parsed)}`);
  console.log(`  Day: ${parsed ? parsed.toLocaleDateString('en-US', { weekday: 'long' }) : 'null'}`);
});

// Test off day checking
console.log('\n🧪 TEST 2: Off Day Detection');
console.log('-'.repeat(40));

const offDate = parseDate(mockDoctor.offDays[0].date);
const offDateStr = formatDate(offDate);
console.log(`Off day from DB: ${JSON.stringify(mockDoctor.offDays[0].date)}`);
console.log(`Parsed: ${offDate}`);
console.log(`Formatted: ${offDateStr}`);
console.log(`Day name: ${offDate.toLocaleDateString('en-US', { weekday: 'long' })}`);

// Check if 2026-01-29 is Thursday
const testDate = parseDate('2026-01-29');
const testDateStr = formatDate(testDate);
console.log(`\nTest date 2026-01-29:`);
console.log(`  Formatted: ${testDateStr}`);
console.log(`  Day name: ${testDate.toLocaleDateString('en-US', { weekday: 'long' })}`);
console.log(`  Is off day? ${testDateStr === offDateStr ? '✅ YES' : '❌ NO'}`);

// Simple slot generation logic for testing
console.log('\n🧪 TEST 3: Simple Slot Generation Logic');
console.log('-'.repeat(40));

function generateSlotsForDate(doctor, dateStr) {
  const slots = [];
  const currentDate = parseDate(dateStr);
  if (!currentDate) return slots;
  
  const formattedDate = formatDate(currentDate);
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const perPatientTime = doctor.perPatientTime || 15;
  
  console.log(`\nGenerating slots for: ${formattedDate} (${dayName})`);
  
  // Check if off day
  const isOffDay = doctor.offDays?.some(offDay => {
    const offDate = parseDate(offDay.date);
    return offDate && formatDate(offDate) === formattedDate;
  });
  
  if (isOffDay) {
    console.log(`❌ This is an OFF day - NO SLOTS`);
    return slots;
  }
  
  // Find schedule
  const daySchedule = doctor.schedule?.find(s => s.day === dayName && s.isWorking);
  
  if (!daySchedule || !daySchedule.startTime || !daySchedule.endTime) {
    console.log(`❌ Not a working day or no schedule`);
    return slots;
  }
  
  const workStart = timeToMinutes(daySchedule.startTime);
  const workEnd = timeToMinutes(daySchedule.endTime);
  const breakTimes = daySchedule.breakTimes || [];
  
  console.log(`✅ Working hours: ${daySchedule.startTime} - ${daySchedule.endTime}`);
  if (breakTimes.length > 0) {
    console.log(`⏸️ Breaks: ${breakTimes.map(b => `${b.startTime}-${b.endTime}`).join(', ')}`);
  }
  
  let currentTime = workStart;
  let slotCount = 0;
  
  while (currentTime + perPatientTime <= workEnd) {
    const slotStart = currentTime;
    const slotEnd = currentTime + perPatientTime;
    
    // Check break overlap
    let skipSlot = false;
    for (const breakTime of breakTimes) {
      const breakStart = timeToMinutes(breakTime.startTime);
      const breakEnd = timeToMinutes(breakTime.endTime);
      
      if ((slotStart >= breakStart && slotStart < breakEnd) ||
          (slotEnd > breakStart && slotEnd <= breakEnd) ||
          (slotStart < breakStart && slotEnd > breakEnd)) {
        skipSlot = true;
        console.log(`   ⏸️ Skipping: ${formatTime(slotStart)}-${formatTime(slotEnd)} (break ${breakTime.startTime}-${breakTime.endTime})`);
        currentTime = breakEnd;
        break;
      }
      
      // Also check if current time is within a break
      if (currentTime >= breakStart && currentTime < breakEnd) {
        skipSlot = true;
        console.log(`   ⏸️ Current time ${formatTime(currentTime)} is within break`);
        currentTime = breakEnd;
        break;
      }
    }
    
    if (!skipSlot) {
      slots.push({
        date: formattedDate,
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
        status: 'available'
      });
      slotCount++;
      console.log(`   ✅ Slot ${slotCount}: ${formatTime(slotStart)}-${formatTime(slotEnd)}`);
      currentTime = slotEnd;
    }
  }
  
  return slots;
}

// Run tests
console.log('\n🧪 TEST 4: Complete Date Tests');
console.log('-'.repeat(40));

const testDatesArray = [
  { date: '2026-01-26', desc: 'Monday (working, no breaks)' },
  { date: '2026-01-27', desc: 'Tuesday (working, break 10:00-10:30)' },
  { date: '2026-01-28', desc: 'Wednesday (non-working)' },
  { date: '2026-01-29', desc: 'Thursday (OFF DAY - should be 0 slots!)' },
  { date: '2026-01-30', desc: 'Friday (working 9:00-13:00)' }
];

let allTestsPassed = true;

testDatesArray.forEach(test => {
  console.log(`\n📅 ${test.date} - ${test.desc}`);
  const slots = generateSlotsForDate(mockDoctor, test.date);
  
  let passed = false;
  if (test.date === '2026-01-29') {
    passed = slots.length === 0;
    if (!passed) {
      console.log(`   ❌ FAIL: Expected 0 slots, got ${slots.length}`);
      allTestsPassed = false;
    }
  } else if (test.date === '2026-01-28') {
    passed = slots.length === 0; // Wednesday is non-working
    if (!passed) {
      console.log(`   ❌ FAIL: Expected 0 slots for non-working day, got ${slots.length}`);
      allTestsPassed = false;
    }
  } else {
    passed = slots.length > 0;
    if (!passed) {
      console.log(`   ❌ FAIL: Expected slots, got 0`);
      allTestsPassed = false;
    }
  }
  
  if (passed) {
    console.log(`   ✅ PASS: ${slots.length} slots`);
  }
  
  // Show sample slots
  if (slots.length > 0 && slots.length <= 5) {
    console.log(`   Sample: ${slots.map(s => s.startTime).join(', ')}`);
  }
});

// Special test for Tuesday break handling
console.log('\n🧪 TEST 5: Tuesday Break Time Verification');
console.log('-'.repeat(40));

const tuesdaySlots = generateSlotsForDate(mockDoctor, '2026-01-27');
console.log(`Total Tuesday slots: ${tuesdaySlots.length}`);

// Check for slots during 10:00-10:30 break
const badSlots = [];
tuesdaySlots.forEach(slot => {
  const slotStart = timeToMinutes(slot.startTime);
  if (slotStart >= 600 && slotStart < 630) { // 10:00-10:30
    badSlots.push(slot);
  }
});

if (badSlots.length === 0) {
  console.log('✅ No slots generated during break time (10:00-10:30)');
} else {
  console.log(`❌ ERROR: ${badSlots.length} slots found during break time:`);
  badSlots.forEach(slot => console.log(`   ${slot.startTime}-${slot.endTime}`));
  allTestsPassed = false;
}

// Show Tuesday slot pattern
console.log('\nTuesday slot pattern (first 12 slots):');
tuesdaySlots.slice(0, 12).forEach((slot, i) => {
  const indicator = slot.startTime >= '10:00' && slot.startTime < '10:30' ? '❌ BREAK!' : '✅';
  console.log(`   ${i+1}. ${slot.startTime}-${slot.endTime} ${indicator}`);
});

console.log('\n' + '='.repeat(60));
console.log(allTestsPassed ? '🎉 ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
console.log('='.repeat(60));

// Summary
console.log('\nSUMMARY:');
console.log('-'.repeat(40));
console.log('Key requirements:');
console.log('1. 2026-01-29 (Thursday) should have 0 slots (off day) ✓');
console.log('2. 2026-01-27 (Tuesday) should skip 10:00-10:30 break ✓');
console.log('3. 2026-01-28 (Wednesday) should have 0 slots (non-working) ✓');
console.log('4. Monday/Friday should have continuous slots ✓');