
// // Helper to convert time string to minutes since midnight
// const timeToMinutes = (timeStr) => {
//   if (!timeStr || timeStr === '' || timeStr === undefined) return 0;
  
//   const [hours, minutes] = timeStr.split(':').map(Number);
//   if (isNaN(hours) || isNaN(minutes)) return 0;
  
//   return hours * 60 + minutes;
// };

// // Helper to format minutes to time string (24-hour format)
// const formatTime = (minutes) => {
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
// };

// // Parse date consistently - FIXED for MongoDB dates
// const parseDate = (dateInput) => {
//   if (!dateInput) return null;
  
//   try {
//     // Handle MongoDB format {"$date": "2026-01-29T00:00:00.000Z"}
//     if (typeof dateInput === 'object' && dateInput.$date) {
//       const date = new Date(dateInput.$date);
//       // Normalize to UTC midnight
//       return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
//     }
    
//     // Handle ISO string or YYYY-MM-DD
//     if (typeof dateInput === 'string') {
//       // Check if it's already YYYY-MM-DD format
//       if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
//         const [year, month, day] = dateInput.split('-').map(Number);
//         return new Date(Date.UTC(year, month - 1, day));
//       }
      
//       // Parse as ISO
//       const date = new Date(dateInput);
//       return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
//     }
    
//     // Already a Date object
//     if (dateInput instanceof Date) {
//       return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate()));
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Error parsing date:', dateInput, error);
//     return null;
//   }
// };

// // Format date to YYYY-MM-DD string (UTC)
// const formatDate = (date) => {
//   if (!(date instanceof Date)) return '';
  
//   const year = date.getUTCFullYear();
//   const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
//   const day = date.getUTCDate().toString().padStart(2, '0');
  
//   return `${year}-${month}-${day}`;
// };

// // Check if slot overlaps with any break
// const doesSlotOverlapBreak = (slotStart, slotEnd, breakTimes) => {
//   if (!breakTimes || breakTimes.length === 0) return false;
  
//   for (const breakTime of breakTimes) {
//     if (!breakTime.startTime || !breakTime.endTime) continue;
    
//     const breakStart = timeToMinutes(breakTime.startTime);
//     const breakEnd = timeToMinutes(breakTime.endTime);
    
//     // Check for any overlap
//     const overlaps = !(slotEnd <= breakStart || slotStart >= breakEnd);
    
//     if (overlaps) {
//       return {
//         overlaps: true,
//         breakStart,
//         breakEnd,
//         breakTime
//       };
//     }
//   }
  
//   return false;
// };

// // Get next available time after checking current position against breaks
// const getNextAvailableTime = (currentTime, breakTimes) => {
//   if (!breakTimes || breakTimes.length === 0) return currentTime;
  
//   // Sort breaks by start time
//   const sortedBreaks = [...breakTimes].sort((a, b) => 
//     timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
//   );
  
//   for (const breakTime of sortedBreaks) {
//     const breakStart = timeToMinutes(breakTime.startTime);
//     const breakEnd = timeToMinutes(breakTime.endTime);
    
//     // If current time is within a break, jump to break end
//     if (currentTime >= breakStart && currentTime < breakEnd) {
//       return breakEnd;
//     }
    
//     // If we're before this break, no need to check further
//     if (currentTime < breakStart) {
//       break;
//     }
//   }
  
//   return currentTime;
// };

// const generateSlots = (doctor, days = 30) => {
//   const slots = [];
  
//   // Start from today at UTC midnight
//   const today = new Date();
//   today.setUTCHours(0, 0, 0, 0);
  
//   const endDate = new Date(today);
//   endDate.setUTCDate(today.getUTCDate() + days);
  
//   const perPatientTime = doctor.perPatientTime || 15;
  
//   console.log(`\n=== SLOT GENERATION START ===`);
//   console.log(`Doctor: ${doctor.name}`);
//   console.log(`Start Date: ${formatDate(today)}`);
//   console.log(`End Date: ${formatDate(endDate)}`);
//   console.log(`Per Patient Time: ${perPatientTime} minutes`);
  
//   // Parse off days into a Set for O(1) lookup
//   const offDaysSet = new Set();
//   if (doctor.offDays && Array.isArray(doctor.offDays)) {
//     doctor.offDays.forEach(offDay => {
//       if (!offDay.date) return;
      
//       const offDate = parseDate(offDay.date);
//       if (offDate) {
//         const dateKey = formatDate(offDate);
//         offDaysSet.add(dateKey);
//         console.log(`📌 Off Day: ${dateKey} - ${offDay.reason || 'No reason'}`);
//       }
//     });
//   }
  
//   console.log(`Total off days: ${offDaysSet.size}`);
  
//   // Generate slots day by day
//   for (let d = new Date(today); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
//     const currentDate = new Date(d);
//     currentDate.setUTCHours(0, 0, 0, 0);
    
//     const dateStr = formatDate(currentDate);
//     const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
//     console.log(`\n📅 Processing: ${dateStr} (${dayName})`);
    
//     // 1. Check if it's an off day
//     if (offDaysSet.has(dateStr)) {
//       console.log(`   ❌ SKIPPING - This is an OFF day`);
//       continue;
//     }
    
//     // 2. Find schedule for this day
//     const daySchedule = doctor.schedule?.find(s => s.day === dayName);
    
//     // 3. Check if working day
//     if (!daySchedule || !daySchedule.isWorking || !daySchedule.startTime || !daySchedule.endTime) {
//       console.log(`   ⚠️ SKIPPING - Not a working day`);
//       continue;
//     }
    
//     // 4. Parse working hours
//     const workStart = timeToMinutes(daySchedule.startTime);
//     const workEnd = timeToMinutes(daySchedule.endTime);
    
//     if (workStart >= workEnd) {
//       console.log(`   ⚠️ SKIPPING - Invalid working hours: ${daySchedule.startTime} to ${daySchedule.endTime}`);
//       continue;
//     }
    
//     console.log(`   ✅ Working Day: ${daySchedule.startTime} - ${daySchedule.endTime}`);
    
//     // 5. Get and sort breaks
//     const breakTimes = daySchedule.breakTimes || [];
//     const sortedBreaks = [...breakTimes].sort((a, b) => 
//       timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
//     );
    
//     if (sortedBreaks.length > 0) {
//       console.log(`   ⏸️  Break Times: ${sortedBreaks.map(b => `${b.startTime}-${b.endTime}`).join(', ')}`);
//     }
    
//     // 6. Generate slots with intelligent break handling
//     let currentTime = workStart;
//     let slotCount = 0;
    
//     while (currentTime + perPatientTime <= workEnd) {
//       // First, check if current time is within a break
//       const nextTime = getNextAvailableTime(currentTime, sortedBreaks);
//       if (nextTime !== currentTime) {
//         console.log(`      ⏸️  Jumping from ${formatTime(currentTime)} to ${formatTime(nextTime)} (break time)`);
//         currentTime = nextTime;
//         continue;
//       }
      
//       const slotStart = currentTime;
//       const slotEnd = currentTime + perPatientTime;
      
//       // Final overlap check (for edge cases)
//       const overlapCheck = doesSlotOverlapBreak(slotStart, slotEnd, sortedBreaks);
//       if (overlapCheck && overlapCheck.overlaps) {
//         console.log(`      ⏸️  Slot ${formatTime(slotStart)}-${formatTime(slotEnd)} overlaps break ${overlapCheck.breakTime.startTime}-${overlapCheck.breakTime.endTime}`);
//         currentTime = overlapCheck.breakEnd;
//         continue;
//       }
      
//       // Valid slot - add it
//       slots.push({
//         date: dateStr, // YYYY-MM-DD format
//         startTime: formatTime(slotStart),
//         endTime: formatTime(slotEnd),
//         status: 'available',
//         doctorId: doctor._id,
//         day: dayName
//       });
      
//       slotCount++;
//       console.log(`      ✅ Slot ${slotCount}: ${formatTime(slotStart)}-${formatTime(slotEnd)}`);
      
//       // Move to next slot
//       currentTime = slotEnd;
//     }
    
//     console.log(`   Total slots for ${dayName}: ${slotCount}`);
//   }
  
//   console.log(`\n🎉 TOTAL SLOTS GENERATED: ${slots.length}`);
  
//   // Validation check
//   const slotsOnOffDays = slots.filter(slot => offDaysSet.has(slot.date));
//   if (slotsOnOffDays.length > 0) {
//     console.error(`\n❌ ERROR: ${slotsOnOffDays.length} slots generated for off days!`);
//   } else {
//     console.log(`✅ SUCCESS: No slots generated for off days`);
//   }
  
//   console.log('='.repeat(60));
  
//   return slots;
// };

// // Generate slots for a specific date (for testing/debugging)
// const generateSlotsForDate = (doctor, date) => {
//   const slots = [];
//   const currentDate = parseDate(date);
//   if (!currentDate) {
//     console.log(`❌ Invalid date: ${date}`);
//     return slots;
//   }
  
//   const dateStr = formatDate(currentDate);
//   const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
//   const perPatientTime = doctor.perPatientTime || 15;
  
//   console.log(`\n🔍 Generating slots for: ${dateStr} (${dayName})`);
  
//   // Check if off day
//   const isOffDay = doctor.offDays?.some(offDay => {
//     const offDate = parseDate(offDay.date);
//     return offDate && formatDate(offDate) === dateStr;
//   });
  
//   if (isOffDay) {
//     console.log(`❌ This is an OFF day - NO SLOTS`);
//     return slots;
//   }
  
//   // Find schedule
//   const daySchedule = doctor.schedule?.find(s => s.day === dayName && s.isWorking);
  
//   if (!daySchedule || !daySchedule.startTime || !daySchedule.endTime) {
//     console.log(`❌ Not a working day or no schedule`);
//     return slots;
//   }
  
//   const workStart = timeToMinutes(daySchedule.startTime);
//   const workEnd = timeToMinutes(daySchedule.endTime);
//   const breakTimes = daySchedule.breakTimes || [];
  
//   console.log(`✅ Working hours: ${daySchedule.startTime} - ${daySchedule.endTime}`);
//   if (breakTimes.length > 0) {
//     console.log(`⏸️ Breaks: ${breakTimes.map(b => `${b.startTime}-${b.endTime}`).join(', ')}`);
//   }
  
//   let currentTime = workStart;
//   let slotCount = 0;
  
//   while (currentTime + perPatientTime <= workEnd) {
//     // Skip breaks if current time is within one
//     const nextTime = getNextAvailableTime(currentTime, breakTimes);
//     if (nextTime !== currentTime) {
//       console.log(`   ⏸️ Jumping from ${formatTime(currentTime)} to ${formatTime(nextTime)} (break)`);
//       currentTime = nextTime;
//       continue;
//     }
    
//     const slotStart = currentTime;
//     const slotEnd = currentTime + perPatientTime;
    
//     // Final overlap check
//     const overlapCheck = doesSlotOverlapBreak(slotStart, slotEnd, breakTimes);
//     if (overlapCheck && overlapCheck.overlaps) {
//       console.log(`   ⏸️ Slot ${formatTime(slotStart)}-${formatTime(slotEnd)} overlaps break ${overlapCheck.breakTime.startTime}-${overlapCheck.breakTime.endTime}`);
//       currentTime = overlapCheck.breakEnd;
//       continue;
//     }
    
//     slots.push({
//       date: dateStr,
//       startTime: formatTime(slotStart),
//       endTime: formatTime(slotEnd),
//       status: 'available',
//       doctorId: doctor._id,
//       day: dayName
//     });
    
//     slotCount++;
//     console.log(`   ✅ Slot ${slotCount}: ${formatTime(slotStart)}-${formatTime(slotEnd)}`);
//     currentTime = slotEnd;
//   }
  
//   console.log(`Total slots for ${dateStr}: ${slots.length}`);
//   return slots;
// };

// // Debug function to check specific issues
// const debugSlotGeneration = (doctor, specificDate = '2026-01-29') => {
//   console.log('\n🔍 DEBUGGING SLOT GENERATION');
//   console.log('='.repeat(50));
  
//   const testDate = parseDate(specificDate);
//   const dateStr = formatDate(testDate);
//   const dayName = testDate.toLocaleDateString('en-US', { weekday: 'long' });
  
//   console.log(`Checking date: ${dateStr} (${dayName})`);
  
//   // Check off days
//   const offDaysSet = new Set();
//   if (doctor.offDays && Array.isArray(doctor.offDays)) {
//     doctor.offDays.forEach(offDay => {
//       const offDate = parseDate(offDay.date);
//       if (offDate) {
//         const offDateStr = formatDate(offDate);
//         offDaysSet.add(offDateStr);
//         console.log(`Off day in DB: ${offDateStr} (reason: ${offDay.reason || 'none'})`);
//       }
//     });
//   }
  
//   console.log(`Is ${dateStr} an off day? ${offDaysSet.has(dateStr) ? '✅ YES' : '❌ NO'}`);
  
//   // Check schedule
//   const daySchedule = doctor.schedule?.find(s => s.day === dayName);
//   console.log(`\nSchedule for ${dayName}:`);
//   console.log(`  isWorking: ${daySchedule?.isWorking}`);
//   console.log(`  startTime: ${daySchedule?.startTime || 'Not set'}`);
//   console.log(`  endTime: ${daySchedule?.endTime || 'Not set'}`);
//   console.log(`  breaks: ${daySchedule?.breakTimes?.length || 0}`);
  
//   if (daySchedule?.breakTimes?.length > 0) {
//     daySchedule.breakTimes.forEach((b, i) => {
//       console.log(`    Break ${i+1}: ${b.startTime} - ${b.endTime}`);
//     });
//   }
  
//   console.log('='.repeat(50));
  
//   return {
//     dateStr,
//     dayName,
//     isOffDay: offDaysSet.has(dateStr),
//     schedule: daySchedule
//   };
// };

// module.exports = {
//   generateSlots,
//   generateSlotsForDate,
//   timeToMinutes,
//   formatTime,
//   debugSlotGeneration,
//   parseDate,
//   formatDate
// };



const mongoose = require('mongoose');
// Helper to convert time string to minutes since midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === '' || timeStr === undefined) return 0;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  return hours * 60 + minutes;
};

// Helper to format minutes to time string (24-hour format)
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Parse date consistently - FIXED for MongoDB dates
const parseDate = (dateInput) => {
  if (!dateInput) return null;
  
  try {
    // Handle MongoDB format {"$date": "2026-01-29T00:00:00.000Z"}
    if (typeof dateInput === 'object' && dateInput.$date) {
      const date = new Date(dateInput.$date);
      // Normalize to UTC midnight
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
    
    // Handle ISO string or YYYY-MM-DD
    if (typeof dateInput === 'string') {
      // Check if it's already YYYY-MM-DD format
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
      }
      
      // Parse as ISO
      const date = new Date(dateInput);
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
    
    // Already a Date object
    if (dateInput instanceof Date) {
      return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate()));
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateInput, error);
    return null;
  }
};

// Format date to YYYY-MM-DD string (UTC)
// const formatDate = (date) => {
//   if (!(date instanceof Date)) return '';
  
//   const year = date.getUTCFullYear();
//   const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
//   const day = date.getUTCDate().toString().padStart(2, '0');
  
//   return `${year}-${month}-${day}`;
// };
// In your slotGenerator.js, check the formatDate function:
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    console.error('❌ formatDate received non-Date:', date);
    return '';
  }
  
  try {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('❌ Error in formatDate:', error, date);
    return '';
  }
};

// Check if slot overlaps with any break
const doesSlotOverlapBreak = (slotStart, slotEnd, breakTimes) => {
  if (!breakTimes || breakTimes.length === 0) return false;
  
  for (const breakTime of breakTimes) {
    if (!breakTime.startTime || !breakTime.endTime) continue;
    
    const breakStart = timeToMinutes(breakTime.startTime);
    const breakEnd = timeToMinutes(breakTime.endTime);
    
    // Check for any overlap
    const overlaps = !(slotEnd <= breakStart || slotStart >= breakEnd);
    
    if (overlaps) {
      return {
        overlaps: true,
        breakStart,
        breakEnd,
        breakTime
      };
    }
  }
  
  return false;
};

// Get next available time after checking current position against breaks
const getNextAvailableTime = (currentTime, breakTimes) => {
  if (!breakTimes || breakTimes.length === 0) return currentTime;
  
  // Sort breaks by start time
  const sortedBreaks = [...breakTimes].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  
  for (const breakTime of sortedBreaks) {
    const breakStart = timeToMinutes(breakTime.startTime);
    const breakEnd = timeToMinutes(breakTime.endTime);
    
    // If current time is within a break, jump to break end
    if (currentTime >= breakStart && currentTime < breakEnd) {
      return breakEnd;
    }
    
    // If we're before this break, no need to check further
    if (currentTime < breakStart) {
      break;
    }
  }
  
  return currentTime;
};

const generateSlots = (doctor, days = 30) => {
  const allSlots = [];
  
  // Start from today at UTC midnight
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setUTCDate(today.getUTCDate() + days);
  
  const perPatientTime = doctor.perPatientTime || 15;
  
  console.log(`\n=== SLOT GENERATION START ===`);
  console.log(`Doctor: ${doctor.name}`);
  console.log(`Start Date: ${formatDate(today)}`);
  console.log(`End Date: ${formatDate(endDate)}`);
  console.log(`Per Patient Time: ${perPatientTime} minutes`);
  
  // Get existing slots and create a map for quick lookup
  const existingSlots = doctor.timeSlots || [];
  const existingSlotsMap = new Map();
  
  // Create a map of existing slots for O(1) lookup
  existingSlots.forEach(slot => {
    const dateStr = formatDate(parseDate(slot.date));
    const key = `${dateStr}_${slot.startTime}_${slot.endTime}`;
    existingSlotsMap.set(key, {
      ...slot,
      _id: slot._id, // Preserve the original ID
      patientInfo: slot.patientInfo || null // Preserve patient info if exists
    });
  });
  
  console.log(`📊 Existing slots: ${existingSlots.length}`);
  console.log(`   Booked slots: ${existingSlots.filter(s => s.status === 'booked').length}`);
  console.log(`   Processing slots: ${existingSlots.filter(s => s.status === 'processing').length}`);
  console.log(`   Unavailable slots: ${existingSlots.filter(s => s.status === 'unavailable').length}`);
  console.log(`   Available slots: ${existingSlots.filter(s => s.status === 'available').length}`);
  
  // Parse off days into a Set for O(1) lookup
  const offDaysSet = new Set();
  if (doctor.offDays && Array.isArray(doctor.offDays)) {
    doctor.offDays.forEach(offDay => {
      if (!offDay.date) return;
      
      const offDate = parseDate(offDay.date);
      if (offDate) {
        const dateKey = formatDate(offDate);
        offDaysSet.add(dateKey);
        console.log(`📌 Off Day: ${dateKey} - ${offDay.reason || 'No reason'}`);
      }
    });
  }
  
  console.log(`Total off days: ${offDaysSet.size}`);
  
  // Generate slots day by day
  for (let d = new Date(today); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    const currentDate = new Date(d);
    currentDate.setUTCHours(0, 0, 0, 0);
    
    const dateStr = formatDate(currentDate);
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log(`\n📅 Processing: ${dateStr} (${dayName})`);
    
    // 1. Check if it's an off day
    if (offDaysSet.has(dateStr)) {
      console.log(`   ❌ SKIPPING - This is an OFF day`);
      continue;
    }
    
    // 2. Find schedule for this day
    const daySchedule = doctor.schedule?.find(s => s.day === dayName);
    
    // 3. Check if working day
    if (!daySchedule || !daySchedule.isWorking || !daySchedule.startTime || !daySchedule.endTime) {
      console.log(`   ⚠️ SKIPPING - Not a working day`);
      continue;
    }
    
    // 4. Parse working hours
    const workStart = timeToMinutes(daySchedule.startTime);
    const workEnd = timeToMinutes(daySchedule.endTime);
    
    if (workStart >= workEnd) {
      console.log(`   ⚠️ SKIPPING - Invalid working hours: ${daySchedule.startTime} to ${daySchedule.endTime}`);
      continue;
    }
    
    console.log(`   ✅ Working Day: ${daySchedule.startTime} - ${daySchedule.endTime}`);
    
    // 5. Get and sort breaks
    const breakTimes = daySchedule.breakTimes || [];
    const sortedBreaks = [...breakTimes].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    if (sortedBreaks.length > 0) {
      console.log(`   ⏸️  Break Times: ${sortedBreaks.map(b => `${b.startTime}-${b.endTime}`).join(', ')}`);
    }
    
    // 6. Generate slots with intelligent break handling
    let currentTime = workStart;
    let totalSlotsForDay = 0;
    let preservedSlotsForDay = 0;
    let newSlotsForDay = 0;
    
    while (currentTime + perPatientTime <= workEnd) {
      // First, check if current time is within a break
      const nextTime = getNextAvailableTime(currentTime, sortedBreaks);
      if (nextTime !== currentTime) {
        console.log(`      ⏸️  Jumping from ${formatTime(currentTime)} to ${formatTime(nextTime)} (break time)`);
        currentTime = nextTime;
        continue;
      }
      
      const slotStart = currentTime;
      const slotEnd = currentTime + perPatientTime;
      
      // Final overlap check (for edge cases)
      const overlapCheck = doesSlotOverlapBreak(slotStart, slotEnd, sortedBreaks);
      if (overlapCheck && overlapCheck.overlaps) {
        console.log(`      ⏸️  Slot ${formatTime(slotStart)}-${formatTime(slotEnd)} overlaps break ${overlapCheck.breakTime.startTime}-${overlapCheck.breakTime.endTime}`);
        currentTime = overlapCheck.breakEnd;
        continue;
      }
      
      // Check if this slot already exists
      const slotKey = `${dateStr}_${formatTime(slotStart)}_${formatTime(slotEnd)}`;
      const existingSlot = existingSlotsMap.get(slotKey);
      
      if (existingSlot) {
        // Slot already exists - preserve it with its CURRENT STATUS (whatever it is)
        const statusEmoji = {
          'booked': '📅',
          'processing': '⏳',
          'unavailable': '🚫',
          'available': '✅'
        }[existingSlot.status] || '❓';
        
        console.log(`      ${statusEmoji} Preserving slot: ${formatTime(slotStart)}-${formatTime(slotEnd)} (Status: ${existingSlot.status})`);
        
        allSlots.push({
          date: dateStr,
          startTime: formatTime(slotStart),
          endTime: formatTime(slotEnd),
          status: existingSlot.status, // Preserve existing status
          doctorId: doctor._id,
          day: dayName,
          // _id: existingSlot._id, // Keep original ID
            _id: new mongoose.Types.ObjectId() ,
          patientInfo: existingSlot.patientInfo // Keep patient info if exists
        });
        
        preservedSlotsForDay++;
        existingSlotsMap.delete(slotKey); // Remove from map to track what we've preserved
      } else {
        // New slot - create as available
        console.log(`      ➕ Creating NEW slot: ${formatTime(slotStart)}-${formatTime(slotEnd)}`);
        
        allSlots.push({
          date: dateStr,
          startTime: formatTime(slotStart),
          endTime: formatTime(slotEnd),
          status: 'available',
          doctorId: doctor._id,
          day: dayName
        });
        
        newSlotsForDay++;
      }
      
      totalSlotsForDay++;
      currentTime = slotEnd;
    }
    
    console.log(`   📊 Day Summary: Total: ${totalSlotsForDay}, Preserved: ${preservedSlotsForDay}, New: ${newSlotsForDay}`);
  }
  
  // Add any existing slots that were for dates beyond our generation range
  // but we should keep them (like booked slots for future dates beyond regeneration range)
  const todayStr = formatDate(today);
  existingSlots.forEach(slot => {
    const slotDateStr = formatDate(parseDate(slot.date));
    const slotKey = `${slotDateStr}_${slot.startTime}_${slot.endTime}`;
    
    // Skip slots in the past
    if (slotDateStr < todayStr) {
      return;
    }
    
    // If slot is not in our generated slots and still exists in the map (wasn't processed above)
    // This handles slots that are beyond our regeneration date range
    if (existingSlotsMap.has(slotKey)) {
      console.log(`📅 Preserving future slot beyond range: ${slotDateStr} ${slot.startTime}-${slot.endTime} (Status: ${slot.status})`);
      allSlots.push({
        date: slotDateStr,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        doctorId: doctor._id,
        day: parseDate(slot.date).toLocaleDateString('en-US', { weekday: 'long' }),
        _id: slot._id,
        patientInfo: slot.patientInfo
      });
    }
  });
  
  // Sort slots by date and time for better organization
  allSlots.sort((a, b) => {
    if (a.date === b.date) {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    }
    return a.date.localeCompare(b.date);
  });
  
  // Count final statistics
  const bookedCount = allSlots.filter(s => s.status === 'booked').length;
  const processingCount = allSlots.filter(s => s.status === 'processing').length;
  const unavailableCount = allSlots.filter(s => s.status === 'unavailable').length;
  const availableCount = allSlots.filter(s => s.status === 'available').length;
  
  console.log(`\n🎉 SLOT GENERATION COMPLETE:`);
  console.log(`📊 FINAL SLOT COUNT: ${allSlots.length}`);
  console.log(`   📅 Booked slots: ${bookedCount} (preserved)`);
  console.log(`   ⏳ Processing slots: ${processingCount} (preserved)`);
  console.log(`   🚫 Unavailable slots: ${unavailableCount} (preserved)`);
  console.log(`   ✅ Available slots: ${availableCount} (existing + new)`);
  
  // Validation check - ensure no slots on off days
  const slotsOnOffDays = allSlots.filter(slot => offDaysSet.has(slot.date));
  if (slotsOnOffDays.length > 0) {
    console.error(`\n❌ ERROR: ${slotsOnOffDays.length} slots on off days! Removing them...`);
    
    // Filter out slots on off days
    const filteredSlots = allSlots.filter(slot => !offDaysSet.has(slot.date));
    
    // Log what was removed
    slotsOnOffDays.forEach(slot => {
      console.log(`   ❌ Removed slot: ${slot.date} ${slot.startTime}-${slot.endTime} (Status: ${slot.status})`);
    });
    
    console.log(`✅ Cleaned slots: ${filteredSlots.length} slots remaining`);
    
    return filteredSlots;
  }
  
  console.log(`✅ SUCCESS: No slots generated for off days`);
  console.log('='.repeat(60));
  
  return allSlots;
};

// Generate slots for a specific date (for testing/debugging)
const generateSlotsForDate = (doctor, date) => {
  const slots = [];
  const currentDate = parseDate(date);
  if (!currentDate) {
    console.log(`❌ Invalid date: ${date}`);
    return slots;
  }
  
  const dateStr = formatDate(currentDate);
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const perPatientTime = doctor.perPatientTime || 15;
  
  console.log(`\n🔍 Generating slots for: ${dateStr} (${dayName})`);
  
  // Check if off day
  const isOffDay = doctor.offDays?.some(offDay => {
    const offDate = parseDate(offDay.date);
    return offDate && formatDate(offDate) === dateStr;
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
  
  // Get existing slots for this date
  const existingSlots = (doctor.timeSlots || []).filter(slot => {
    const slotDate = parseDate(slot.date);
    return slotDate && formatDate(slotDate) === dateStr;
  });
  
  // Create a map of existing slots
  const existingSlotsMap = new Map();
  existingSlots.forEach(slot => {
    const key = `${slot.startTime}_${slot.endTime}`;
    existingSlotsMap.set(key, slot);
  });
  
  let currentTime = workStart;
  let totalSlotsForDay = 0;
  let preservedSlotsForDay = 0;
  let newSlotsForDay = 0;
  
  while (currentTime + perPatientTime <= workEnd) {
    // Skip breaks if current time is within one
    const nextTime = getNextAvailableTime(currentTime, breakTimes);
    if (nextTime !== currentTime) {
      console.log(`   ⏸️ Jumping from ${formatTime(currentTime)} to ${formatTime(nextTime)} (break)`);
      currentTime = nextTime;
      continue;
    }
    
    const slotStart = currentTime;
    const slotEnd = currentTime + perPatientTime;
    
    // Final overlap check
    const overlapCheck = doesSlotOverlapBreak(slotStart, slotEnd, breakTimes);
    if (overlapCheck && overlapCheck.overlaps) {
      console.log(`   ⏸️ Slot ${formatTime(slotStart)}-${formatTime(slotEnd)} overlaps break ${overlapCheck.breakTime.startTime}-${overlapCheck.breakTime.endTime}`);
      currentTime = overlapCheck.breakEnd;
      continue;
    }
    
    // Check if slot already exists
    const slotKey = `${formatTime(slotStart)}_${formatTime(slotEnd)}`;
    const existingSlot = existingSlotsMap.get(slotKey);
    
    if (existingSlot) {
      // Preserve existing slot with its CURRENT STATUS
      const statusEmoji = {
        'booked': '📅',
        'processing': '⏳', 
        'unavailable': '🚫',
        'available': '✅'
      }[existingSlot.status] || '❓';
      
      console.log(`   ${statusEmoji} Preserved slot: ${formatTime(slotStart)}-${formatTime(slotEnd)} (Status: ${existingSlot.status})`);
      
      slots.push({
        date: dateStr,
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
        status: existingSlot.status,
        doctorId: doctor._id,
        day: dayName,
        _id: existingSlot._id,
        patientInfo: existingSlot.patientInfo
      });
      
      preservedSlotsForDay++;
    } else {
      // Create new slot
      console.log(`   ➕ New slot: ${formatTime(slotStart)}-${formatTime(slotEnd)}`);
      
      slots.push({
        date: dateStr,
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
        status: 'available',
        doctorId: doctor._id,
        day: dayName
      });
      
      newSlotsForDay++;
    }
    
    totalSlotsForDay++;
    currentTime = slotEnd;
  }
  
  console.log(`📊 Total slots for ${dateStr}: ${totalSlotsForDay} (Preserved: ${preservedSlotsForDay}, New: ${newSlotsForDay})`);
  return slots;
};

// Debug function to check specific issues
const debugSlotGeneration = (doctor, specificDate = '2026-01-29') => {
  console.log('\n🔍 DEBUGGING SLOT GENERATION');
  console.log('='.repeat(50));
  
  const testDate = parseDate(specificDate);
  const dateStr = formatDate(testDate);
  const dayName = testDate.toLocaleDateString('en-US', { weekday: 'long' });
  
  console.log(`Checking date: ${dateStr} (${dayName})`);
  
  // Check off days
  const offDaysSet = new Set();
  if (doctor.offDays && Array.isArray(doctor.offDays)) {
    doctor.offDays.forEach(offDay => {
      const offDate = parseDate(offDay.date);
      if (offDate) {
        const offDateStr = formatDate(offDate);
        offDaysSet.add(offDateStr);
        console.log(`Off day in DB: ${offDateStr} (reason: ${offDay.reason || 'none'})`);
      }
    });
  }
  
  console.log(`Is ${dateStr} an off day? ${offDaysSet.has(dateStr) ? '✅ YES' : '❌ NO'}`);
  
  // Check schedule
  const daySchedule = doctor.schedule?.find(s => s.day === dayName);
  console.log(`\nSchedule for ${dayName}:`);
  console.log(`  isWorking: ${daySchedule?.isWorking}`);
  console.log(`  startTime: ${daySchedule?.startTime || 'Not set'}`);
  console.log(`  endTime: ${daySchedule?.endTime || 'Not set'}`);
  console.log(`  breaks: ${daySchedule?.breakTimes?.length || 0}`);
  
  if (daySchedule?.breakTimes?.length > 0) {
    daySchedule.breakTimes.forEach((b, i) => {
      console.log(`    Break ${i+1}: ${b.startTime} - ${b.endTime}`);
    });
  }
  
  console.log('='.repeat(50));
  
  return {
    dateStr,
    dayName,
    isOffDay: offDaysSet.has(dateStr),
    schedule: daySchedule
  };
};

module.exports = {
  generateSlots,
  generateSlotsForDate,
  timeToMinutes,
  formatTime,
  debugSlotGeneration,
  parseDate,
  formatDate,
   doesSlotOverlapBreak,
  getNextAvailableTime
};