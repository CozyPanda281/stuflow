import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getOrCreateDaySchedule, getActiveLeave } from '../db/database';
import { useToast } from '../App';

export default function TodaySchedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLeave, setActiveLeave] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayName = format(new Date(), 'EEEE');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const s = await getOrCreateDaySchedule(today);
    setSchedule(s);
    const leave = await getActiveLeave();
    setActiveLeave(leave);
    setLoading(false);
  }

  if (loading) return <div style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>Loading...</div>;

  const hasClasses = schedule?.actual?.some(p => p.subject);

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h2>Today's Schedule</h2>
          <p>{dayName}, {today}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/today/edit')}>
          Edit Today
        </button>
      </div>

      {activeLeave && (
        <div className="leave-banner">
          <span>&#9888;</span> On leave: {activeLeave.reason}
        </div>
      )}

      {!hasClasses && (
        <div className="card" style={{textAlign:'center', padding:40}}>
          <div style={{fontSize:32, marginBottom:8}}>&#127769;</div>
          <div style={{fontSize:16, fontWeight:600}}>No classes today</div>
          <div style={{fontSize:13, color:'var(--text-secondary)', marginTop:4}}>
            Enjoy your day off!
          </div>
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {schedule?.actual?.map((period, idx) => {
          if (!period.subject) return null;
          const planned = schedule.planned[idx];
          const isModified = planned && (
            planned.subject !== period.subject ||
            planned.faculty !== period.faculty ||
            planned.classroom !== period.classroom ||
            planned.startTime !== period.startTime
          );

          return (
            <div key={idx} className="period-card" style={{
              borderLeft: `3px solid ${
                period.status === 'cancelled' ? 'var(--red)' :
                period.status === 'self-study' ? 'var(--yellow)' :
                isModified ? 'var(--orange)' : 'var(--accent)'
              }`
            }}>
              <div className="period-time">
                Period {period.period}: {period.startTime} - {period.endTime}
                {isModified && <span style={{color:'var(--orange)', marginLeft:8}}>&#9888; Modified</span>}
                {period.status === 'cancelled' && <span className="status-badge status-cancelled" style={{marginLeft:8}}>Cancelled</span>}
                {period.status === 'self-study' && <span className="status-badge status-late" style={{marginLeft:8}}>Self Study</span>}
              </div>
              <div className="period-subject">{period.subject}</div>
              <div className="period-details">
                {period.faculty && <span>{period.faculty} &middot; </span>}
                {period.classroom && <span>Room {period.classroom}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
