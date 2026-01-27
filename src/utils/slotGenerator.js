// // src/utils/slotGenerator.js - UPDATED VERSION
// /**
//  * Generate time slots for a doctor based on their schedule and break times
//  */

// const isTimeInRange = (time, startTime, endTime) => {
//   const [timeHour, timeMinute] = time.split(':').map(Number);
//   const [startHour, startMinute] = startTime.split(':').map(Number);
//   const [endHour, endMinute] = endTime.split(':').map(Number);
  
//   const timeValue = timeHour * 60 + timeMinute;
//   const startValue = startHour * 60 + startMinute;
//   const endValue = endHour * 60 + endMinute;
  
//   return timeValue >= startValue && timeValue < endValue;
// };

// const isTimeDuringBreak = (slotStart, slotEnd, breakTimes) => {
//   for (const breakTime of breakTimes) {
//     if (breakTime.startTime && breakTime.endTime) {
//       // Check if slot overlaps with break
//       const [slotStartHour, slotStartMin] = slotStart.split(':').map(Number);
//       const [slotEndHour, slotEndMin] = slotEnd.split(':').map(Number);
//       const [breakStartHour, breakStartMin] = breakTime.startTime.split(':').map(Number);
//       const [breakEndHour, breakEndMin] = breakTime.endTime.split(':').map(Number);
      
//       const slotStartVal = slotStartHour * 60 + slotStartMin;
//       const slotEndVal = slotEndHour * 60 + slotEndMin;
//       const breakStartVal = breakStartHour * 60 + breakStartMin;
//       const breakEndVal = breakEndHour * 60 + breakEndMin;
      
//       // Check for overlap
//       if (slotStartVal < breakEndVal && slotEndVal > breakStartVal) {
//         return true; // Slot overlaps with break time
//       }
//     }
//   }
//   return false;
// };

// const generateSlots = (doctor, days = 30) => {
//   const slots = [];
//   const today = new Date();
//   today.setHours(0, 0, 0, 0); // Start from beginning of today
  
//   const endDate = new Date();
//   endDate.setDate(today.getDate() + days);
//   endDate.setHours(23, 59, 59, 999);
  
//   const perPatientTime = doctor.perPatientTime || 15; // in minutes
  
//   // Generate slots for each day
//   for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
//     const currentDate = new Date(d);
//     const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
//     // Check if it's an off day
//     const isOffDay = doctor.offDays && doctor.offDays.some(offDay => {
//       if (!offDay.date) return false;
//       const offDate = new Date(offDay.date);
//       offDate.setHours(0, 0, 0, 0);
//       return offDate.getTime() === currentDate.getTime();
//     });
    
//     if (isOffDay) {
//       console.log(`Skipping ${currentDate.toDateString()} - Off day`);
//       continue;
//     }
    
//     // Find schedule for this day
//     const daySchedule = doctor.schedule && doctor.schedule.find(s => s.day === dayName);
    
//     if (!daySchedule || !daySchedule.isWorking || !daySchedule.startTime || !daySchedule.endTime) {
//       console.log(`Skipping ${dayName} - Not working or no schedule`);
//       continue;
//     }
    
//     // Parse working hours
//     const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
//     const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
    
//     // Get break times for this day
//     const breakTimes = daySchedule.breakTimes || [];
    
//     // Create start and end times for the day
//     const workStartTime = new Date(currentDate);
//     workStartTime.setHours(startHour, startMinute, 0, 0);
    
//     const workEndTime = new Date(currentDate);
//     workEndTime.setHours(endHour, endMinute, 0, 0);
    
//     let currentSlotTime = new Date(workStartTime);
    
//     // Generate slots for this day
//     while (currentSlotTime < workEndTime) {
//       const slotEndTime = new Date(currentSlotTime.getTime() + perPatientTime * 60000);
      
//       // If slot would exceed work end time, break
//       if (slotEndTime > workEndTime) break;
      
//       // Format times for comparison
//       const startTimeStr = currentSlotTime.toLocaleTimeString('en-US', {
//         hour12: false,
//         hour: '2-digit',
//         minute: '2-digit'
//       });
      
//       const endTimeStr = slotEndTime.toLocaleTimeString('en-US', {
//         hour12: false,
//         hour: '2-digit',
//         minute: '2-digit'
//       });
      
//       // Check if this slot falls within any break time
//       if (!isTimeDuringBreak(startTimeStr, endTimeStr, breakTimes)) {
//         // Add the slot
//         slots.push({
//           date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
//           startTime: startTimeStr,
//           endTime: endTimeStr,
//           status: 'available',
//           doctorId: doctor._id,
//           day: dayName
//         });
        
//         console.log(`Added slot: ${currentDate.toDateString()} ${startTimeStr}-${endTimeStr}`);
//       } else {
//         console.log(`Skipping slot (break time): ${startTimeStr}-${endTimeStr}`);
//       }
      
//       // Move to next slot
//       currentSlotTime = slotEndTime;
//     }
//   }
  
//   console.log(`Total slots generated: ${slots.length}`);
//   return slots;
// };

// /**
//  * Generate slots for a specific doctor on a specific date
//  */
// const generateSlotsForDate = (doctor, date) => {
//   const slots = [];
//   const currentDate = new Date(date);
//   currentDate.setHours(0, 0, 0, 0);
  
//   const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
//   const perPatientTime = doctor.perPatientTime || 15;
  
//   // Check if it's an off day
//   const isOffDay = doctor.offDays && doctor.offDays.some(offDay => {
//     if (!offDay.date) return false;
//     const offDate = new Date(offDay.date);
//     offDate.setHours(0, 0, 0, 0);
//     return offDate.getTime() === currentDate.getTime();
//   });
  
//   if (isOffDay) {
//     console.log(`Date ${date} is an off day`);
//     return slots;
//   }
  
//   // Find schedule for this day
//   const daySchedule = doctor.schedule && doctor.schedule.find(s => s.day === dayName && s.isWorking);
  
//   if (!daySchedule || !daySchedule.startTime || !daySchedule.endTime) {
//     console.log(`No working schedule for ${dayName}`);
//     return slots;
//   }
  
//   // Parse working hours
//   const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
//   const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
  
//   // Get break times for this day
//   const breakTimes = daySchedule.breakTimes || [];
  
//   // Create start and end times for the day
//   const workStartTime = new Date(currentDate);
//   workStartTime.setHours(startHour, startMinute, 0, 0);
  
//   const workEndTime = new Date(currentDate);
//   workEndTime.setHours(endHour, endMinute, 0, 0);
  
//   let currentSlotTime = new Date(workStartTime);
  
//   // Generate slots for this day
//   while (currentSlotTime < workEndTime) {
//     const slotEndTime = new Date(currentSlotTime.getTime() + perPatientTime * 60000);
    
//     // If slot would exceed work end time, break
//     if (slotEndTime > workEndTime) break;
    
//     // Format times for comparison
//     const startTimeStr = currentSlotTime.toLocaleTimeString('en-US', {
//       hour12: false,
//       hour: '2-digit',
//       minute: '2-digit'
//     });
    
//     const endTimeStr = slotEndTime.toLocaleTimeString('en-US', {
//       hour12: false,
//       hour: '2-digit',
//       minute: '2-digit'
//     });
    
//     // Check if this slot falls within any break time
//     if (!isTimeDuringBreak(startTimeStr, endTimeStr, breakTimes)) {
//       // Add the slot
//       slots.push({
//         date: currentDate.toISOString().split('T')[0],
//         startTime: startTimeStr,
//         endTime: endTimeStr,
//         status: 'available',
//         doctorId: doctor._id,
//         day: dayName
//       });
//     }
    
//     // Move to next slot
//     currentSlotTime = slotEndTime;
//   }
  
//   return slots;
// };

// module.exports = {
//   generateSlots,
//   generateSlotsForDate,
//   isTimeDuringBreak
// };

// src/utils/slotGenerator.js - CORRECTED & TESTED VERSION
/**
 * Generate time slots for a doctor based on their schedule and break times
 * FIXED: Proper off day handling, break time skipping, and date comparison
 */

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
const formatDate = (date) => {
  if (!(date instanceof Date)) return '';
  
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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
  const slots = [];
  
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
    let slotCount = 0;
    
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
      
      // Valid slot - add it
      slots.push({
        date: dateStr, // YYYY-MM-DD format
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
        status: 'available',
        doctorId: doctor._id,
        day: dayName
      });
      
      slotCount++;
      console.log(`      ✅ Slot ${slotCount}: ${formatTime(slotStart)}-${formatTime(slotEnd)}`);
      
      // Move to next slot
      currentTime = slotEnd;
    }
    
    console.log(`   Total slots for ${dayName}: ${slotCount}`);
  }
  
  console.log(`\n🎉 TOTAL SLOTS GENERATED: ${slots.length}`);
  
  // Validation check
  const slotsOnOffDays = slots.filter(slot => offDaysSet.has(slot.date));
  if (slotsOnOffDays.length > 0) {
    console.error(`\n❌ ERROR: ${slotsOnOffDays.length} slots generated for off days!`);
  } else {
    console.log(`✅ SUCCESS: No slots generated for off days`);
  }
  
  console.log('='.repeat(60));
  
  return slots;
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
  
  let currentTime = workStart;
  let slotCount = 0;
  
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
    
    slots.push({
      date: dateStr,
      startTime: formatTime(slotStart),
      endTime: formatTime(slotEnd),
      status: 'available',
      doctorId: doctor._id,
      day: dayName
    });
    
    slotCount++;
    console.log(`   ✅ Slot ${slotCount}: ${formatTime(slotStart)}-${formatTime(slotEnd)}`);
    currentTime = slotEnd;
  }
  
  console.log(`Total slots for ${dateStr}: ${slots.length}`);
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
  formatDate
};