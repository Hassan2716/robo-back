export const generateTimeSlots = (startTime, endTime, duration, breakStart = null, breakEnd = null) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  const breakStartMinutes = breakStart ? breakStart.split(':').map(Number).reduce((h, m) => h * 60 + m) : null;
  const breakEndMinutes = breakEnd ? breakEnd.split(':').map(Number).reduce((h, m) => h * 60 + m) : null;
  
  while (currentMinutes + duration <= endMinutes) {
    const isBreak = breakStartMinutes && breakEndMinutes && 
      currentMinutes >= breakStartMinutes && 
      currentMinutes < breakEndMinutes;
    
    if (!isBreak) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    currentMinutes += duration;
  }
  
  return slots;
};

export const getAvailableSlots = (barber, date, appointments, serviceDuration = 30) => {
  const dayName = date.toLocaleLowerCase('en-US', { weekday: 'long' });
  const workingDay = barber.workingHours.find(wh => wh.day === dayName);
  
  if (!workingDay || !workingDay.isWorking) {
    return [];
  }
  
  const allSlots = generateTimeSlots(
    workingDay.startTime,
    workingDay.endTime,
    serviceDuration,
    workingDay.breakStart,
    workingDay.breakEnd
  );
  
  const bookedSlots = appointments
    .filter(apt => apt.barber.toString() === barber._id.toString() && apt.status !== 'cancelled')
    .map(apt => apt.time);
  
  return allSlots.filter(slot => !bookedSlots.includes(slot));
};

export const isSlotAvailable = (barber, date, time, serviceDuration, appointments) => {
  const availableSlots = getAvailableSlots(barber, date, appointments, serviceDuration);
  return availableSlots.includes(time);
};

export const formatDateForQuery = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};