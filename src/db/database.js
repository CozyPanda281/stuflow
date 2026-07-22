import Dexie from 'dexie';

const db = new Dexie('StuFlowDB');

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
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '08:00', endTime: '08:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '08:55', endTime: '09:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '09:50', endTime: '10:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '10:45', endTime: '11:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '11:40', endTime: '12:30' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '13:00', endTime: '13:50' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '13:55', endTime: '14:45' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '14:50', endTime: '15:40' }
  ],
  Tuesday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '08:00', endTime: '08:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '08:55', endTime: '09:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '09:50', endTime: '10:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '10:45', endTime: '11:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '11:40', endTime: '12:30' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '13:00', endTime: '13:50' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '13:55', endTime: '14:45' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '14:50', endTime: '15:40' }
  ],
  Wednesday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '08:00', endTime: '08:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '08:55', endTime: '09:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '09:50', endTime: '10:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '10:45', endTime: '11:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '11:40', endTime: '12:30' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '13:00', endTime: '13:50' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '13:55', endTime: '14:45' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '14:50', endTime: '15:40' }
  ],
  Thursday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '08:00', endTime: '08:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '08:55', endTime: '09:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '09:50', endTime: '10:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '10:45', endTime: '11:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '11:40', endTime: '12:30' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '13:00', endTime: '13:50' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '13:55', endTime: '14:45' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '14:50', endTime: '15:40' }
  ],
  Friday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '08:00', endTime: '08:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '08:55', endTime: '09:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '09:50', endTime: '10:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '10:45', endTime: '11:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '11:40', endTime: '12:30' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '13:00', endTime: '13:50' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '13:55', endTime: '14:45' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '14:50', endTime: '15:40' }
  ],
  Saturday: [
    { period: 1, subject: '', faculty: '', classroom: '', startTime: '08:00', endTime: '08:50' },
    { period: 2, subject: '', faculty: '', classroom: '', startTime: '08:55', endTime: '09:45' },
    { period: 3, subject: '', faculty: '', classroom: '', startTime: '09:50', endTime: '10:40' },
    { period: 4, subject: '', faculty: '', classroom: '', startTime: '10:45', endTime: '11:35' },
    { period: 5, subject: '', faculty: '', classroom: '', startTime: '11:40', endTime: '12:30' },
    { period: 6, subject: '', faculty: '', classroom: '', startTime: '13:00', endTime: '13:50' },
    { period: 7, subject: '', faculty: '', classroom: '', startTime: '13:55', endTime: '14:45' },
    { period: 8, subject: '', faculty: '', classroom: '', startTime: '14:50', endTime: '15:40' }
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
