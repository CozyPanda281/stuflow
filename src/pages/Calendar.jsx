import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, isSameDay, isBefore, startOfDay } from 'date-fns';
import db, { getScheduleForDate } from '../db/database';
import { useToast } from '../App';
import { CheckIcon } from '../components/Icons';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayData, setDayData] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [schedules, setSchedules] = useState({});
  const [attModal, setAttModal] = useState(null);
  const [attStatus, setAttStatus] = useState('present');
  const [attNote, setAttNote] = useState('');
  const fileRef = useRef();
  const { showToast } = useToast();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  useEffect(() => { loadMonthData(); }, [currentMonth]);

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
    const schedule = await getScheduleForDate(dateStr);
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

  function hasModifications(dateStr) {
    const schedule = schedules[dateStr];
    return schedule?.modifications?.length > 0;
  }

  function openAttendance(period) {
    const existing = (attendanceMap[dayData.date] || []).find(a => a.period === period.period);
    setAttModal({ period, existing });
    setAttStatus(existing?.status || 'present');
    setAttNote(existing?.notes || '');
  }

  async function saveAttendance() {
    if (!attModal) return;
    const data = {
      date: dayData.date,
      subject: attModal.period.subject,
      faculty: attModal.period.faculty,
      period: attModal.period.period,
      status: attStatus,
      notes: attNote
    };
    if (attModal.existing) {
      await db.attendance.update(attModal.existing.id, data);
      showToast('Attendance updated', 'success');
    } else {
      await db.attendance.add(data);
      showToast('Attendance recorded', 'success');
    }
    setAttModal(null);
    loadMonthData();
    if (selectedDate) openDay(selectedDate);
  }

  const isPast = selectedDate && isBefore(startOfDay(selectedDate), startOfDay(new Date()));

  return (
    <div>
      <div className="page-header">
        <h2>Calendar</h2>
        <p>View and catch up on past days</p>
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
            const today = isSameDay(day, new Date());
            const selected = selectedDate && isSameDay(day, selectedDate);
            return (
              <div key={dateStr} onClick={() => openDay(day)}
                style={{
                  padding:'8px 4px', borderRadius:8, cursor:'pointer',
                  fontSize:13, fontWeight: today ? 700 : 400,
                  background: selected ? 'var(--accent)' : today ? 'var(--bg-hover)' : 'transparent',
                  color: color || (selected ? 'white' : 'var(--text-primary)'),
                  border: '1px solid transparent',
                  borderColor: color ? `${color}44` : 'transparent',
                  transition: 'all 0.1s',
                  position:'relative'
                }}>
                {format(day, 'd')}
                {hasModifications(dateStr) && (
                  <span style={{
                    position:'absolute', bottom:2, right:'50%',
                    transform:'translateX(50%)',
                    width:4, height:4, borderRadius:'50%',
                    background:'var(--orange)'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {dayData && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {format(parseISO(dayData.date), 'EEEE, MMMM d, yyyy')}
              {isPast && <span style={{marginLeft:8, fontSize:11, color:'var(--orange)'}}>&#9888; Past day — catch up</span>}
            </span>
            <button className="btn btn-sm" onClick={() => setSelectedDate(null)}>Close</button>
          </div>

          {dayData.schedule?.isHoliday ? (
            <div style={{padding:20, textAlign:'center', color:'var(--text-muted)'}}>This day is marked as a holiday</div>
          ) : dayData.schedule?.actual?.filter(p => p.subject).length > 0 ? (
            dayData.schedule.actual.filter(p => p.subject).map(p => {
              const att = (attendanceMap[dayData.date] || []).find(a => a.period === p.period);
              return (
                <div key={p.period} className="period-card" style={{
                  borderLeftColor: p.status === 'cancelled' ? 'var(--red)' : att ? 'var(--green)' : 'var(--accent)'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <div className="period-time">Period {p.period}: {p.startTime} - {p.endTime}</div>
                      <div className="period-subject">{p.subject}</div>
                      <div className="period-details">
                        {p.faculty && <span>{p.faculty}</span>}
                        {att && <span className={`status-badge status-${att.status}`} style={{marginLeft:8}}>{att.status}</span>}
                        {p.status === 'cancelled' && <span className="status-badge status-cancelled" style={{marginLeft:8}}>Cancelled</span>}
                      </div>
                    </div>
                    {isPast && p.status !== 'cancelled' && (
                      <button className="btn btn-sm" style={{flexShrink:0, marginLeft:8}}
                        onClick={() => openAttendance(p)}>
                        {att ? 'Edit' : <><CheckIcon style={{width:12,height:12,stroke:'currentColor'}} /> Mark</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state" style={{padding:20}}>
              <p>No classes on this day</p>
            </div>
          )}

          {attendanceMap[dayData.date] && attendanceMap[dayData.date].length > 0 && (
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

          {dayData.schedule?.modifications?.length > 0 && (
            <div style={{marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)'}}>
              <div style={{fontSize:13, fontWeight:600, marginBottom:8, color:'var(--orange)'}}>
                Schedule Changes ({dayData.schedule.modifications.length})
              </div>
              {dayData.schedule.modifications.map((mod, i) => (
                <div key={i} style={{
                  display:'flex', gap:8, padding:'5px 0', fontSize:12,
                  borderBottom: i < dayData.schedule.modifications.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span style={{color:'var(--text-muted)', whiteSpace:'nowrap', minWidth:60, fontSize:11}}>
                    {format(parseISO(mod.timestamp), 'HH:mm')}
                  </span>
                  <span style={{color:'var(--text-secondary)'}}>{mod.action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {attModal && (
        <div className="modal-overlay" onClick={() => setAttModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{attModal.existing ? 'Edit' : 'Mark'} Attendance — {attModal.period.subject}</h3>
            <div className="form-group">
              <label>Status</label>
              <select value={attStatus} onChange={e => setAttStatus(e.target.value)}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="leave">Leave</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea value={attNote} onChange={e => setAttNote(e.target.value)} placeholder="Any notes..." />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setAttModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveAttendance}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
