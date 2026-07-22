import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import db, { getOrCreateDaySchedule, getActiveLeave, checkAndFinalizeDay } from '../db/database';
import { WarningIcon } from '../components/Icons';

const iw = { width: 18, height: 18, stroke: 'currentColor', flexShrink: 0 };

export default function Dashboard() {
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeLeave, setActiveLeave] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dayFinalized, setDayFinalized] = useState(false);
  const navigate = useNavigate();

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkAndFinalizeDay();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  async function loadDashboard() {
    const schedule = await getOrCreateDaySchedule(today);
    setTodaySchedule(schedule);
    setDayFinalized(schedule?.isFinalized || false);

    const allAttendance = await db.attendance.toArray();
    const total = allAttendance.length;
    const present = allAttendance.filter(a => a.status === 'present').length;
    const absent = allAttendance.filter(a => a.status === 'absent').length;
    setStats({ total, present, absent, percentage: total ? Math.round((present / total) * 100) : 0 });

    const tasks = await db.tasks.where('completed').equals(0).toArray();
    setPendingTasks(tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5));

    const leave = await getActiveLeave();
    setActiveLeave(leave);
  }

  const currentPeriod = todaySchedule?.actual?.find(p => {
    const now = format(new Date(), 'HH:mm');
    return now >= p.startTime && now <= p.endTime && p.subject;
  });

  const nextPeriod = todaySchedule?.actual?.find(p => {
    const now = format(new Date(), 'HH:mm');
    return now < p.startTime && p.subject;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {activeLeave && (
        <div className="leave-banner">
          <WarningIcon style={iw} />
          <span>On leave: {activeLeave.reason} (until {activeLeave.endDate})</span>
          <button className="btn btn-sm btn-warning" style={{marginLeft:'auto'}} onClick={() => navigate('/leave')}>
            Manage
          </button>
        </div>
      )}

      {dayFinalized && todaySchedule && !activeLeave && (
        <div style={{background:'rgba(34,197,94,0.15)', border:'1px solid var(--green)', borderRadius:10, padding:'8px 12px', marginBottom:16, fontSize:13, display:'flex', alignItems:'center', gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="4,13 9,18 20,7"/></svg>
          Today's classes are complete. Schedule finalized.
        </div>
      )}

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Current Class</span>
          </div>
          {currentPeriod ? (
            <div>
              <div style={{fontSize:18, fontWeight:700}}>{currentPeriod.subject}</div>
              <div style={{fontSize:12, color:'var(--text-secondary)'}}>
                {currentPeriod.faculty}
              </div>
              <div style={{fontSize:11, color:'var(--text-muted)', marginTop:4}}>
                Period {currentPeriod.period} ({currentPeriod.startTime} - {currentPeriod.endTime})
              </div>
            </div>
          ) : nextPeriod ? (
            <div>
              <div style={{fontSize:12, color:'var(--text-muted)'}}>Next class at {nextPeriod.startTime}</div>
              <div style={{fontSize:16, fontWeight:600, marginTop:4}}>{nextPeriod.subject}</div>
              <div style={{fontSize:12, color:'var(--text-secondary)'}}>
                {nextPeriod.faculty}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{padding:16}}>
              <p>No classes scheduled right now</p>
            </div>
          )}
          <button className="btn btn-sm btn-primary mt-2" onClick={() => navigate('/today')}>
            View Full Schedule
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Attendance</span>
            <span className="stat-value" style={{fontSize:24}}>{stats.percentage}%</span>
          </div>
          <div className="progress-bar mb-2">
            <div className="progress-fill" style={{
              width: `${stats.percentage}%`,
              background: stats.percentage >= 75 ? 'var(--green)' : stats.percentage >= 60 ? 'var(--yellow)' : 'var(--red)'
            }} />
          </div>
          <div style={{fontSize:12, color:'var(--text-secondary)', display:'flex', justifyContent:'space-between'}}>
            <span>Present: {stats.present}</span>
            <span>Total: {stats.total}</span>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div className="inline-flex">
            <button className="btn btn-sm" onClick={() => navigate('/today/edit')}>
              Edit Today
            </button>
            <button className="btn btn-sm" onClick={() => navigate('/attendance')}>
              Mark Attendance
            </button>
            <button className="btn btn-sm" onClick={() => navigate('/tasks')}>
              Add Task
            </button>
            <button className="btn btn-sm" onClick={() => navigate('/notes')}>
              New Note
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending Tasks</span>
            <span style={{fontSize:12, color:'var(--text-muted)'}}>{pendingTasks.length}</span>
          </div>
          {pendingTasks.length === 0 ? (
            <div style={{fontSize:12, color:'var(--text-muted)'}}>No pending tasks</div>
          ) : (
            pendingTasks.map(task => (
              <div key={task.id} style={{
                display:'flex', justifyContent:'space-between',
                padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:13
              }}>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
                <span style={{fontSize:11, color:'var(--text-muted)'}}>
                  {task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
