import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import db, { getOrCreateDaySchedule, getActiveLeave, checkAndFinalizeDay } from '../db/database';
import { WarningIcon, CalendarIcon, TodayIcon, TasksIcon, NotesIcon } from '../components/Icons';
import AnimatedCounter from '../components/AnimatedCounter';

const iw = { width: 18, height: 18, stroke: 'currentColor', flexShrink: 0 };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function taskUrgency(task) {
  if (!task.dueDate) return '';
  const diff = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'urgent';
  if (diff < 1) return 'today';
  if (diff < 3) return 'soon';
  return '';
}

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
    }, 5000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const nowStr = format(currentTime, 'HH:mm');
  const currentPeriod = todaySchedule?.actual?.find(p =>
    nowStr >= p.startTime && nowStr <= p.endTime && p.subject
  );
  const nextPeriod = todaySchedule?.actual?.find(p =>
    nowStr < p.startTime && p.subject
  );
  const hasClasses = todaySchedule?.actual?.some(p => p.subject);

  return (
    <div>
      {/* GREETING HEADER */}
      <div className="welcome-header card-enter card-enter-d1">
        <div className="greeting">{getGreeting()}, Aditya</div>
        <div className="live-time">
          {format(currentTime, 'EEEE, MMMM d, yyyy')} &middot; {format(currentTime, 'h:mm a')}
        </div>
      </div>

      {/* LEAVE BANNER */}
      {activeLeave && (
        <div className="leave-banner card-enter card-enter-d2">
          <WarningIcon style={iw} />
          <span>On leave: {activeLeave.reason} (until {activeLeave.endDate})</span>
          <button className="btn btn-sm btn-warning" style={{marginLeft:'auto'}} onClick={() => navigate('/leave')}>
            Manage
          </button>
        </div>
      )}

      {/* DAY FINALIZED */}
      {dayFinalized && todaySchedule && !activeLeave && (
        <div className="card-enter card-enter-d2" style={{
          background: 'var(--green-glow)', border: '1px solid var(--green)',
          borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 14,
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="4,13 9,18 20,7"/></svg>
          Today's classes are complete. Schedule finalized.
        </div>
      )}

      {/* CLASS STATUS */}
      <div className="grid-2 mb-4">
        <div className="card card-accent-green card-glow-green card-enter card-enter-d3" style={{cursor:'pointer'}} onClick={() => navigate('/today')}>
          <div className="card-header">
            <span className="card-title">Current Class</span>
            {currentPeriod && <span className="class-dot live" />}
          </div>
          {currentPeriod ? (
            <div>
              <div style={{fontSize:20, fontWeight:700}}>{currentPeriod.subject}</div>
              <div style={{fontSize:13, color:'var(--text-secondary)', marginTop:2}}>
                {currentPeriod.faculty}
              </div>
              <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>
                Period {currentPeriod.period} &middot; {currentPeriod.startTime} - {currentPeriod.endTime}
              </div>
            </div>
          ) : nextPeriod ? (
            <div>
              <div className="class-dot upcoming" style={{marginBottom:4}} />
              <div style={{fontSize:12, color:'var(--text-muted)'}}>Next at {nextPeriod.startTime}</div>
              <div style={{fontSize:18, fontWeight:600, marginTop:2}}>{nextPeriod.subject}</div>
              <div style={{fontSize:12, color:'var(--text-secondary)'}}>
                {nextPeriod.faculty}
              </div>
            </div>
          ) : hasClasses ? (
            <div>
              <div className="class-dot done" style={{marginBottom:4}} />
              <div style={{fontSize:13, color:'var(--text-muted)'}}>All classes for today are done</div>
            </div>
          ) : (
            <div style={{padding:'4px 0'}}>
              <div style={{fontSize:13, color:'var(--text-muted)'}}>No classes scheduled today</div>
            </div>
          )}
        </div>

        <div className="card card-accent-blue card-enter card-enter-d4" style={{cursor:'pointer'}} onClick={() => navigate('/analytics')}>
          <div className="card-header">
            <span className="card-title">Attendance</span>
            <span style={{
              fontSize: 28, fontWeight: 700,
              color: stats.percentage >= 75 ? 'var(--green)' : stats.percentage >= 60 ? 'var(--yellow)' : 'var(--red)'
            }}><AnimatedCounter value={stats.percentage} suffix="%" /></span>
          </div>
          <div className="progress-bar mb-2" style={{height:8}}>
            <div className="progress-fill" style={{
              width: `${stats.percentage}%`,
              background: stats.percentage >= 75 ? 'var(--green)' : stats.percentage >= 60 ? 'var(--yellow)' : 'var(--red)'
            }} />
          </div>
          <div style={{fontSize:12, color:'var(--text-secondary)', display:'flex', justifyContent:'space-between'}}>
            <span><span style={{color:'var(--green)', fontWeight:600}}><AnimatedCounter value={stats.present} /></span> Present</span>
            <span><span style={{color:'var(--red)', fontWeight:600}}><AnimatedCounter value={stats.absent} /></span> Absent</span>
            <span><span style={{fontWeight:600}}><AnimatedCounter value={stats.total} /></span> Total</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="card card-enter card-enter-d5" style={{marginBottom:14}}>
        <div className="card-header">
          <span className="card-title">Quick Actions</span>
        </div>
        <div className="action-grid">
          <button className="action-btn action-btn-blue" onClick={() => navigate('/today/edit')}>
            <TodayIcon />
            Edit Today
          </button>
          <button className="action-btn action-btn-green" onClick={() => navigate('/attendance')}>
            <CalendarIcon />
            Attendance
          </button>
          <button className="action-btn action-btn-orange" onClick={() => navigate('/tasks')}>
            <TasksIcon />
            Tasks
          </button>
          <button className="action-btn action-btn-purple" onClick={() => navigate('/notes')}>
            <NotesIcon />
            Notes
          </button>
        </div>
      </div>

      {/* PENDING TASKS */}
      {pendingTasks.length > 0 && (
        <div className="card card-enter card-enter-d6">
          <div className="card-header">
            <span className="card-title">Pending Tasks</span>
            <span style={{fontSize:12, color:'var(--text-muted)'}}>{pendingTasks.length} remaining</span>
          </div>
          {pendingTasks.map(task => {
            const urgency = taskUrgency(task);
            return (
              <div key={task.id} className={`task-item task-item-${urgency || 'done'}`}
                onClick={() => navigate('/tasks')}>
                <span style={{fontWeight:500, fontSize:13}}>{task.title}</span>
                <span style={{fontSize:11, color:'var(--text-muted)'}}>
                  {task.dueDate ? format(parseISO(task.dueDate), 'MMM d') : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
