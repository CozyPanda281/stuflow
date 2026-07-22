import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, isSameDay } from 'date-fns';
import db, { getOrCreateDaySchedule } from '../db/database';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayData, setDayData] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [schedules, setSchedules] = useState({});

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  useEffect(() => {
    loadMonthData();
  }, [currentMonth]);

  async function loadMonthData() {
    const attRecords = await db.attendance.toArray();
    const map = {};
    attRecords.forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    setAttendanceMap(map);

    const scheduleRecords = await db.daySchedules.toArray();
    const sMap = {};
    scheduleRecords.forEach(s => { sMap[s.date] = s; });
    setSchedules(sMap);
  }

  async function openDay(date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = await getOrCreateDaySchedule(dateStr);
    setDayData({ date: dateStr, schedule });
    setSelectedDate(date);
  }

  function getDayColor(dateStr) {
    const records = attendanceMap[dateStr];
    if (!records) {
      const schedule = schedules[dateStr];
      if (!schedule) return null;
      const hasClasses = schedule.actual?.some(p => p.subject);
      if (!hasClasses) return 'var(--text-muted)';
      return null;
    }
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    if (absent > 0) return 'var(--red)';
    if (records.some(r => r.status === 'late')) return 'var(--yellow)';
    if (present > 0) return 'var(--green)';
    return null;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Calendar</h2>
        <p>View your academic history</p>
      </div>

      <div className="card mb-4">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <button className="btn btn-sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
            &larr;
          </button>
          <div style={{fontSize:16, fontWeight:600}}>{format(currentMonth, 'MMMM yyyy')}</div>
          <button className="btn btn-sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
            &rarr;
          </button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4, textAlign:'center'}}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{fontSize:11, color:'var(--text-muted)', padding:'4px 0', fontWeight:600}}>{d}</div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const color = getDayColor(dateStr);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            return (
              <div key={dateStr} onClick={() => openDay(day)}
                style={{
                  padding:'8px 4px', borderRadius:8, cursor:'pointer',
                  fontSize:13, fontWeight: isToday ? 700 : 400,
                  background: isSelected ? 'var(--accent)' : isToday ? 'var(--bg-hover)' : 'transparent',
                  color: color || (isSelected ? 'white' : 'var(--text-primary)'),
                  border: '1px solid transparent',
                  borderColor: color ? `${color}44` : 'transparent',
                  transition: 'all 0.1s'
                }}>
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {dayData && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">{format(parseISO(dayData.date), 'EEEE, MMMM d, yyyy')}</span>
            <button className="btn btn-sm" onClick={() => setSelectedDate(null)}>Close</button>
          </div>

          {dayData.schedule?.actual?.filter(p => p.subject).length > 0 ? (
            dayData.schedule.actual.filter(p => p.subject).map(p => {
              const att = (attendanceMap[dayData.date] || []).find(a => a.period === p.period);
              return (
                <div key={p.period} className="period-card" style={{
                  borderLeftColor: p.status === 'cancelled' ? 'var(--red)' : att ? 'var(--green)' : 'var(--accent)'
                }}>
                  <div className="period-time">Period {p.period}: {p.startTime} - {p.endTime}</div>
                  <div className="period-subject">{p.subject}</div>
                  <div className="period-details">
                    {p.faculty && <span>{p.faculty} &middot; </span>}
                    {p.classroom && <span>Room {p.classroom}</span>}
                    {att && <span className={`status-badge status-${att.status}`} style={{marginLeft:8}}>{att.status}</span>}
                    {p.status === 'cancelled' && <span className="status-badge status-cancelled" style={{marginLeft:8}}>Cancelled</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state" style={{padding:20}}>
              <p>No classes on this day</p>
            </div>
          )}

          {attendanceMap[dayData.date] && (
            <div style={{marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)'}}>
              <div style={{fontSize:13, fontWeight:600, marginBottom:8}}>Attendance Records</div>
              {attendanceMap[dayData.date].map(r => (
                <div key={r.id} style={{display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:13}}>
                  <span>{r.subject}</span>
                  <span className={`status-badge status-${r.status}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
