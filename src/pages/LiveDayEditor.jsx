import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getOrCreateDaySchedule, markDayAsHoliday } from '../db/database';
import db from '../db/database';
import { useToast } from '../App';
import { PlusIcon } from '../components/Icons';

const ip = { width: 14, height: 14, stroke: 'currentColor', strokeWidth: 2.5 };

export default function LiveDayEditor() {
  const [schedule, setSchedule] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [swapMode, setSwapMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHolidayConfirm, setShowHolidayConfirm] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => { load(); }, []);

  async function load() {
    const s = await getOrCreateDaySchedule(today);
    setSchedule(s);
    setLoading(false);
  }

  async function saveActual(updatedActual) {
    if (!schedule) return;
    const newMod = { action: 'edit', timestamp: new Date().toISOString() };
    const modifications = [...(schedule.modifications || []), newMod];
    await db.daySchedules.update(schedule.id, { actual: updatedActual, modifications, isFinalized: false });
    const s = await getOrCreateDaySchedule(today);
    setSchedule(s);
    showToast('Schedule updated', 'success');
  }

  function handleEdit(period) {
    setEditModal({ ...period });
  }

  async function handleSaveEdit() {
    if (!editModal || !schedule) return;
    const updatedActual = schedule.actual.map(p =>
      p.period === editModal.period ? editModal : p
    );
    await saveActual(updatedActual);
    setEditModal(null);
  }

  async function handleCancel(period) {
    if (!schedule) return;
    const updatedActual = schedule.actual.map(p =>
      p.period === period
        ? { ...p, status: p.status === 'cancelled' ? 'scheduled' : 'cancelled' }
        : p
    );
    await saveActual(updatedActual);
  }

  async function handleSwapClick(period) {
    if (!swapMode) {
      setSwapMode(period);
      showToast('Tap the period to swap with', 'info');
      return;
    }
    if (swapMode === period) {
      setSwapMode(null);
      return;
    }
    const updatedActual = [...schedule.actual];
    const idx1 = updatedActual.findIndex(p => p.period === swapMode);
    const idx2 = updatedActual.findIndex(p => p.period === period);
    if (idx1 === -1 || idx2 === -1) { setSwapMode(null); return; }
    [updatedActual[idx1], updatedActual[idx2]] = [updatedActual[idx2], updatedActual[idx1]];
    await saveActual(updatedActual);
    setSwapMode(null);
    showToast('Periods swapped', 'success');
  }

  async function handleExtend(period) {
    if (!schedule) return;
    const idx = schedule.actual.findIndex(p => p.period === period);
    if (idx === -1 || idx >= schedule.actual.length - 1) {
      showToast('No next period to extend into', 'error');
      return;
    }
    const nextPeriod = schedule.actual[idx + 1];
    const updatedActual = schedule.actual.map((p, i) => {
      if (i === idx) return { ...p, endTime: nextPeriod.endTime };
      if (i === idx + 1) return { ...p, status: 'cancelled', subject: '' };
      return p;
    });
    await saveActual(updatedActual);
    showToast('Class extended', 'success');
  }

  async function handleMerge(period) {
    if (!schedule) return;
    const idx = schedule.actual.findIndex(p => p.period === period);
    if (idx === -1 || idx >= schedule.actual.length - 1) {
      showToast('No next period to merge with', 'error');
      return;
    }
    const current = schedule.actual[idx];
    const next = schedule.actual[idx + 1];
    if (!current.subject || !next.subject) {
      showToast('Both periods must have subjects', 'error');
      return;
    }
    const mergedName = `${current.subject} + ${next.subject}`;
    const updatedActual = schedule.actual.map((p, i) => {
      if (i === idx) return { ...p, subject: mergedName, endTime: next.endTime };
      if (i === idx + 1) return { ...p, status: 'cancelled', subject: '' };
      return p;
    });
    await saveActual(updatedActual);
    showToast('Classes merged', 'success');
  }

  async function handleAddExtra() {
    if (!schedule) return;
    const maxPeriod = Math.max(...schedule.actual.map(p => p.period));
    const lastEntry = schedule.actual[schedule.actual.length - 1];
    const newPeriod = {
      period: maxPeriod + 1,
      subject: '',
      faculty: '',
      classroom: '',
      startTime: lastEntry ? lastEntry.endTime : '16:00',
      endTime: lastEntry ? addHour(lastEntry.endTime) : '16:50',
      status: 'scheduled'
    };
    const updatedActual = [...schedule.actual, newPeriod];
    await saveActual(updatedActual);
    showToast('Extra period added', 'success');
  }

  function addHour(time) {
    const [h, m] = time.split(':').map(Number);
    return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  async function handleResetDay() {
    if (!schedule) return;
    const s = await getOrCreateDaySchedule(today);
    await db.daySchedules.update(schedule.id, {
      actual: JSON.parse(JSON.stringify(s.planned)),
      modifications: [],
      isFinalized: false, finalizedAt: null, isHoliday: false
    });
    const updated = await getOrCreateDaySchedule(today);
    setSchedule(updated);
    showToast('Reset to planned schedule', 'info');
  }

  async function handleHoliday() {
    await markDayAsHoliday(today);
    setShowHolidayConfirm(false);
    load();
    showToast('Today marked as holiday', 'success');
  }

  if (loading) return <div style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>Loading...</div>;
  if (schedule?.isHoliday) {
    return (
      <div>
        <div className="page-header">
          <h2>Live Day Editor</h2>
          <p>{today}</p>
        </div>
        <div className="card" style={{textAlign:'center', padding:40}}>
          <div style={{fontSize:16, fontWeight:600, marginBottom:8}}>Today is marked as a holiday</div>
          <button className="btn btn-primary" onClick={handleResetDay}>Remove Holiday</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <div>
          <h2>Live Day Editor</h2>
          <p>{today} — Modify today's schedule</p>
        </div>
        <div className="inline-flex" style={{flexWrap:'wrap'}}>
          <button className="btn btn-sm btn-warning" onClick={() => setShowHolidayConfirm(true)}>&#127774; Holiday</button>
          <button className="btn btn-sm" onClick={handleResetDay}>Reset</button>
          <button className="btn btn-sm btn-primary" onClick={handleAddExtra}><PlusIcon style={ip} /> Extra</button>
          <button className="btn btn-sm" onClick={() => navigate('/today')}>Done</button>
        </div>
      </div>

      {swapMode && (
        <div style={{background:'rgba(79,140,255,0.15)', border:'1px solid var(--accent)', borderRadius:10, padding:'8px 12px', marginBottom:12, fontSize:13}}>
          Swap mode active. Tap another period to swap with Period {swapMode}.
          <button className="btn btn-sm" style={{marginLeft:8}} onClick={() => setSwapMode(null)}>Cancel</button>
        </div>
      )}

      <div style={{marginBottom:12, fontSize:12, color:'var(--text-secondary)', display:'flex', flexWrap:'wrap', gap:6}}>
        <span className="status-badge status-scheduled">Scheduled</span>
        <span className="status-badge status-cancelled">Cancelled</span>
        <span className="status-badge status-late">Self Study</span>
        <span className="status-badge status-leave">Modified</span>
        <span style={{marginLeft:'auto', color:'var(--text-muted)'}}>Tap actions below each period</span>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {schedule.actual.map((period, idx) => {
          const planned = schedule.planned.find(p => p.period === period.period);
          const isDifferent = planned && (
            planned.subject !== period.subject || planned.faculty !== period.faculty ||
            planned.classroom !== period.classroom || planned.startTime !== period.startTime
          );
          const isSwapTarget = swapMode && swapMode !== period.period;

          return (
            <div key={period.period} className="period-card" style={{
              borderLeft: `3px solid ${
                period.status === 'cancelled' ? 'var(--red)' :
                period.status === 'self-study' ? 'var(--yellow)' :
                isDifferent ? 'var(--orange)' : 'var(--accent)'
              }`,
              opacity: period.status === 'cancelled' || !period.subject ? 0.5 : 1,
              background: isSwapTarget ? 'rgba(79,140,255,0.1)' : undefined,
              cursor: isSwapTarget ? 'pointer' : undefined
            }} onClick={isSwapTarget ? () => handleSwapClick(period.period) : undefined}>
              <div className="period-time">
                Period {period.period}: {period.startTime} - {period.endTime}
                {isDifferent && <span style={{color:'var(--orange)', marginLeft:8, display:'inline-flex', alignItems:'center', gap:4}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3L2 21h20L12 3z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17.5" r="1"/></svg> Modified
                </span>}
              </div>
              {period.subject ? (
                <>
                  <div className="period-subject">{period.subject}</div>
                  <div className="period-details">
                    {period.faculty && <span>{period.faculty} &middot; </span>}
                    {period.classroom && <span>Room {period.classroom}</span>}
                  </div>
                </>
              ) : (
                <div className="period-subject" style={{color:'var(--text-muted)', fontStyle:'italic'}}>
                  {period.status === 'cancelled' ? 'Cancelled' : 'Empty period'}
                </div>
              )}
              <div className="period-actions">
                {!isSwapTarget && (
                  <>
                    <button className="btn btn-sm" onClick={() => handleEdit(period)}>Edit</button>
                    {period.subject && period.status !== 'cancelled' && (
                      <>
                        <button className="btn btn-sm" onClick={() => handleSwapClick(period.period)}>
                          {swapMode ? 'Cancel Swap' : 'Swap'}
                        </button>
                        {idx < schedule.actual.length - 1 && schedule.actual[idx + 1]?.subject && (
                          <button className="btn btn-sm" onClick={() => handleMerge(period.period)}>Merge</button>
                        )}
                        {idx < schedule.actual.length - 1 && (
                          <button className="btn btn-sm" onClick={() => handleExtend(period.period)}>Extend</button>
                        )}
                      </>
                    )}
                    <button className={`btn btn-sm ${period.subject ? 'btn-warning' : ''}`}
                      onClick={() => handleCancel(period.period)}>
                      {period.status === 'cancelled' ? 'Restore' : period.subject ? 'Cancel' : 'Remove'}
                    </button>
                  </>
                )}
                {isSwapTarget && <span style={{fontSize:12, color:'var(--accent)'}}>Tap to swap</span>}
              </div>
            </div>
          );
        })}
      </div>

      {showHolidayConfirm && (
        <div className="modal-overlay" onClick={() => setShowHolidayConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Mark Today as Holiday?</h3>
            <p style={{fontSize:13, color:'var(--text-secondary)', marginBottom:16}}>
              This will clear today's schedule and mark the day as a holiday. You can undo this later.
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowHolidayConfirm(false)}>Cancel</button>
              <button className="btn btn-warning" onClick={handleHoliday}>Mark as Holiday</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Period {editModal.period}</h3>
            <div className="form-group">
              <label>Subject</label>
              <input value={editModal.subject || ''} onChange={e => setEditModal({...editModal, subject: e.target.value})} placeholder="e.g. Mathematics" />
            </div>
            <div className="form-group">
              <label>Faculty</label>
              <input value={editModal.faculty || ''} onChange={e => setEditModal({...editModal, faculty: e.target.value})} placeholder="e.g. Dr. Smith" />
            </div>
            <div className="form-group">
              <label>Classroom</label>
              <input value={editModal.classroom || ''} onChange={e => setEditModal({...editModal, classroom: e.target.value})} placeholder="e.g. A-201" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={editModal.startTime} onChange={e => setEditModal({...editModal, startTime: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" value={editModal.endTime} onChange={e => setEditModal({...editModal, endTime: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={editModal.status || 'scheduled'} onChange={e => setEditModal({...editModal, status: e.target.value})}>
                <option value="scheduled">Scheduled</option>
                <option value="self-study">Self Study</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
