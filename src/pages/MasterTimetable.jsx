import { useState, useEffect } from 'react';
import db, { defaultTimetable, saveTimetableDay } from '../db/database';
import { useToast } from '../App';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MasterTimetable() {
  const [timetableData, setTimetableData] = useState({});
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || 'Monday');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadTimetable();
  }, []);

  async function loadTimetable() {
    setLoading(true);
    const data = {};
    for (const day of DAYS) {
      const entries = await db.timetable.where('dayOfWeek').equals(day).sortBy('period');
      const defaultPeriods = defaultTimetable[day] || [];
      data[day] = entries.length > 0 ? entries.map(e => ({
        period: e.period, subject: e.subject || '', faculty: e.faculty || '',
        classroom: e.classroom || '', startTime: e.startTime, endTime: e.endTime
      })) : defaultPeriods;
    }
    setTimetableData(data);
    setLoading(false);
  }

  function updatePeriod(day, idx, field, value) {
    const updated = { ...timetableData };
    updated[day] = updated[day].map((p, i) => i === idx ? { ...p, [field]: value } : p);
    setTimetableData(updated);
  }

  async function handleSaveDay() {
    const day = activeDay;
    const periods = timetableData[day];
    await saveTimetableDay(day, periods);
    showToast(`${day} timetable saved`, 'success');
  }

  async function handleCopyFrom(day) {
    const source = timetableData[day];
    if (!source) return;
    const updated = { ...timetableData, [activeDay]: source.map(p => ({ ...p })) };
    setTimetableData(updated);
    showToast(`Copied from ${day}`, 'info');
  }

  async function handleClearDay() {
    const periods = defaultTimetable[activeDay] || [];
    const updated = { ...timetableData, [activeDay]: periods.map(p => ({ ...p, subject: '', faculty: '', classroom: '' })) };
    setTimetableData(updated);
  }

  if (loading) return <div style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <div>
          <h2>Master Timetable</h2>
          <p>Set your permanent weekly schedule</p>
        </div>
        <div className="inline-flex">
          <button className="btn btn-sm" onClick={handleClearDay}>Clear Day</button>
          <button className="btn btn-sm btn-primary" onClick={handleSaveDay}>Save Day</button>
        </div>
      </div>

      <div className="tabs">
        {DAYS.filter(d => d !== 'Sunday' || timetableData[d]?.some(p => p.subject)).map(day => (
          <button key={day} className={`tab ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}>
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">{activeDay}</span>
          <div className="inline-flex">
            {DAYS.filter(d => d !== activeDay).map(day => (
              <button key={day} className="btn btn-sm" onClick={() => handleCopyFrom(day)}>
                Copy from {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
              {(timetableData[activeDay] || []).map((period, idx) => (
                <tr key={period.period}>
                  <td style={{fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap'}}>{period.period}</td>
                  <td style={{whiteSpace:'nowrap', fontSize:12}}>{period.startTime}-{period.endTime}</td>
                  <td><input value={period.subject} onChange={e => updatePeriod(activeDay, idx, 'subject', e.target.value)} placeholder="Subject" /></td>
                  <td><input value={period.faculty} onChange={e => updatePeriod(activeDay, idx, 'faculty', e.target.value)} placeholder="Faculty" /></td>
                  <td><input value={period.classroom} onChange={e => updatePeriod(activeDay, idx, 'classroom', e.target.value)} placeholder="Room" style={{width:80}} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
