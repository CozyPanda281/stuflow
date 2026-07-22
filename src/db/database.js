import Dexie from 'dexie';

const db = new Dexie('AdityaDB');

db.version(1).stores({
  timetable: '++id, dayOfWeek, period',
  daySchedules: '++id, date',
  attendance: '++id, date, subject',
  attendanceProofs: '++id, attendanceId',
  tasks: '++id, dueDate, completed, priority',
  notes: '++id, subject, createdAt',
  leaves: '++id, startDate, endDate, active',
  settings: '++id, key'
});

export const defaultTimetable = {
  Monday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '09:00', endTime: '09:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '09:55', endTime: '10:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '10:50', endTime: '11:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '11:45', endTime: '12:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '14:00', endTime: '14:50' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '14:55', endTime: '15:45' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '15:50', endTime: '16:40' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '16:45', endTime: '17:35' }
  ],
  Tuesday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '09:00', endTime: '09:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '09:55', endTime: '10:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '10:50', endTime: '11:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '11:45', endTime: '12:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '14:00', endTime: '14:50' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '14:55', endTime: '15:45' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '15:50', endTime: '16:40' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '16:45', endTime: '17:35' }
  ],
  Wednesday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '09:00', endTime: '09:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '09:55', endTime: '10:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '10:50', endTime: '11:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '11:45', endTime: '12:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '14:00', endTime: '14:50' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '14:55', endTime: '15:45' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '15:50', endTime: '16:40' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '16:45', endTime: '17:35' }
  ],
  Thursday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '09:00', endTime: '09:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '09:55', endTime: '10:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '10:50', endTime: '11:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '11:45', endTime: '12:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '14:00', endTime: '14:50' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '14:55', endTime: '15:45' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '15:50', endTime: '16:40' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '16:45', endTime: '17:35' }
  ],
  Friday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '09:00', endTime: '09:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '09:55', endTime: '10:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '10:50', endTime: '11:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '11:45', endTime: '12:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '14:00', endTime: '14:50' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '14:55', endTime: '15:45' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '15:50', endTime: '16:40' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '16:45', endTime: '17:35' }
  ],
  Saturday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '09:00', endTime: '09:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '09:55', endTime: '10:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '10:50', endTime: '11:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '11:45', endTime: '12:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '14:00', endTime: '14:50' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '14:55', endTime: '15:45' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '15:50', endTime: '16:40' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '16:45', endTime: '17:35' }
  ],
  Sunday: []
};

export async function getTimetableForDay(dayOfWeek) {
  const entries = await db.timetable.where('dayOfWeek').equals(dayOfWeek).sortBy('period');
  return entries;
}

export async function saveTimetableDay(dayOfWeek, periods) {
  await db.timetable.where('dayOfWeek').equals(dayOfWeek).delete();
  const data = periods.map(p => ({ ...p, dayOfWeek }));
  await db.timetable.bulkAdd(data);
}

export async function getOrCreateDaySchedule(dateStr) {
  let schedule = await db.daySchedules.where('date').equals(dateStr).first();
  if (!schedule) {
    const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const timetableEntries = await db.timetable.where('dayOfWeek').equals(dayName).sortBy('period');
    const planned = timetableEntries.map(e => ({
      period: e.period,
      subject: e.subject,
      faculty: e.faculty,
      classroom: e.classroom,
      startTime: e.startTime,
      endTime: e.endTime,
      status: 'scheduled'
    }));
    schedule = {
      date: dateStr,
      dayName,
      planned,
      actual: JSON.parse(JSON.stringify(planned)),
      modifications: [],
      isFinalized: false,
      finalizedAt: null
    };
    await db.daySchedules.add(schedule);
    schedule = await db.daySchedules.where('date').equals(dateStr).first();
  }
  return schedule;
}

export async function checkAndFinalizeDay() {
  const today = new Date().toISOString().split('T')[0];
  const schedule = await db.daySchedules.where('date').equals(today).first();
  if (!schedule || schedule.isFinalized) return;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const activeClasses = schedule.actual.filter(p => p.subject && p.status !== 'cancelled' && p.status !== 'holiday');
  const allEnded = activeClasses.every(p => p.endTime < currentTime);

  if (activeClasses.length > 0 && allEnded) {
    await db.daySchedules.update(schedule.id, { isFinalized: true, finalizedAt: new Date().toISOString() });
  }
}

export async function markDayAsHoliday(dateStr) {
  let schedule = await db.daySchedules.where('date').equals(dateStr).first();
  if (!schedule) {
    const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    schedule = {
      date: dateStr, dayName, planned: [], actual: [],
      modifications: [{ action: 'holiday', timestamp: new Date().toISOString() }],
      isFinalized: true, finalizedAt: new Date().toISOString(), isHoliday: true
    };
    await db.daySchedules.add(schedule);
  } else {
    await db.daySchedules.update(schedule.id, {
      actual: [],
      modifications: [...(schedule.modifications || []), { action: 'holiday', timestamp: new Date().toISOString() }],
      isFinalized: true, finalizedAt: new Date().toISOString(), isHoliday: true
    });
  }
}

export async function getScheduleForDate(dateStr) {
  let schedule = await db.daySchedules.where('date').equals(dateStr).first();
  if (!schedule) {
    const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const timetableEntries = await db.timetable.where('dayOfWeek').equals(dayName).sortBy('period');
    const planned = timetableEntries.map(e => ({
      period: e.period, subject: e.subject, faculty: e.faculty,
      classroom: e.classroom, startTime: e.startTime, endTime: e.endTime, status: 'scheduled'
    }));
    schedule = {
      date: dateStr, dayName, planned,
      actual: JSON.parse(JSON.stringify(planned)),
      modifications: [], isFinalized: true, finalizedAt: new Date().toISOString()
    };
    await db.daySchedules.add(schedule);
    schedule = await db.daySchedules.where('date').equals(dateStr).first();
  }
  return schedule;
}

export async function isOnLeave(dateStr) {
  const leaves = await db.leaves.where('active').equals(1).toArray();
  const d = new Date(dateStr + 'T00:00:00');
  return leaves.some(l => {
    const start = new Date(l.startDate + 'T00:00:00');
    const end = new Date(l.endDate + 'T00:00:00');
    return d >= start && d <= end;
  });
}

export async function getActiveLeave() {
  const today = new Date().toISOString().split('T')[0];
  const leaves = await db.leaves.where('active').equals(1).toArray();
  const d = new Date(today + 'T00:00:00');
  return leaves.find(l => {
    const start = new Date(l.startDate + 'T00:00:00');
    const end = new Date(l.endDate + 'T00:00:00');
    return d >= start && d <= end;
  }) || null;
}

export default db;
