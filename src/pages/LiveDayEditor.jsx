import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getOrCreateDaySchedule } from '../db/database';
import db from '../db/database';
import { useToast } from '../App';

export default function LiveDayEditor() {
  const [schedule, setSchedule] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const s = await getOrCreateDaySchedule(today);
    setSchedule(s);
    setLoading(false);
  }

  async function saveActual(updatedActual) {
    if (!schedule) return;
    const newMod = { action: 'edit', timestamp: new Date().toISOString() };
    const modifications = [...(schedule.modifications || []), newMod];
    await db.daySchedules.update(schedule.id, { actual: updatedActual, modifications });
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

  async function handleSwap(period1, period2) {
    if (!schedule) return;
    const updatedActual = [...schedule.actual];
    const idx1 = updatedActual.findIndex(p => p.period === period1);
    const idx2 = updatedActual.findIndex(p => p.period === period2);
    if (idx1 === -1 || idx2 === -1) return;
    [updatedActual[idx1], updatedActual[idx2]] = [updatedActual[idx2], updatedActual[idx1]];
    await saveActual(updatedActual);
  }

  async function handleExtend(period) {
    if (!schedule) return;
    const idx = schedule.actual.findIndex(p => p.period === period);
    if (idx === -1 || idx >= schedule.actual.length - 1) return;
    const nextPeriod = schedule.actual[idx + 1];
    const updatedActual = schedule.actual.map((p, i) => {
      if (i === idx) return { ...p, endTime: nextPeriod.endTime };
      if (i === idx + 1) return { ...p, status: 'cancelled', subject: '' };
      return p;
    });
    await saveActual(updatedActual);
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
      isFinalized: false,
      finalizedAt: null
    });
    const updated = await getOrCreateDaySchedule(today);
    setSchedule(updated);
    showToast('Reset to planned schedule', 'info');
  }

  const [swapMode, setSwapMode] = useState(null);
  const [swapFrom, setSwapFrom] = useState(null);

  if (loading) return <div style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <div>
          <h2>Live Day Editor</h2>
          <p>{today} — Modify today's schedule</p>
        </div>
        <div className="inline-flex">
          <button className="btn btn-sm btn-warning" onClick={handleResetDay}>Reset to Planned</button>
          <button className="btn btn-sm btn-primary" onClick={handleAddExtra}>&#43; Add Extra Period</button>
          <button className="btn btn-sm" onClick={() => navigate('/today')}>Done</button>
        </div>
      </div>

      <div style={{marginBottom:12, fontSize:13, color:'var(--text-secondary)'}}>
        <span className="status-badge status-scheduled" style={{marginRight:6}}>Scheduled</span>
        <span className="status-badge status-cancelled" style={{marginRight:6}}>Cancelled</span>
        <span className="status-badge status-late" style={{marginRight:6}}>Self Study</span>
        <span className="status-badge status-leave" style={{marginRight:6}}>Modified</span>
        Tap a period to edit its details.
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {schedule.actual.map((period) => {
          const planned = schedule.planned.find(p => p.period === period.period);
          const isDifferent = planned && (
            planned.subject !== period.subject ||
            planned.faculty !== period.faculty ||
            planned.classroom !== period.classroom
          );

          return (
            <div key={period.period} className="period-card" style={{
              borderLeft: `3px solid ${
                period.status === 'cancelled' ? 'var(--red)' :
                period.status === 'self-study' ? 'var(--yellow)' :
                isDifferent ? 'var(--orange)' : 'var(--accent)'
              }`,
              opacity: period.status === 'cancelled' || !period.subject ? 0.5 : 1
            }}>
              <div className="period-time">
                Period {period.period}: {period.startTime} - {period.endTime}
              </div>
              {period.subject ? (
                <>
                  <div className="period-subject">{period.subject}</div>
                  <div className="period-details">
                    {period.faculty && <span>{period.faculty} &middot; </span>}
                    {period.classroom && <span>Room {period.classroom}</span>}
                    {!period.faculty && !period.classroom && <span style={{color:'var(--text-muted)'}}>No details</span>}
                  </div>
                </>
              ) : (
                <div className="period-subject" style={{color:'var(--text-muted)', fontStyle:'italic'}}>
                  {period.status === 'cancelled' ? 'Cancelled' : 'Empty period'}
                </div>
              )}
              <div className="period-actions">
                <button className="btn btn-sm" onClick={() => handleEdit(period)}>Edit</button>
                {period.subject && (
                  <button className="btn btn-sm btn-warning" onClick={() => handleCancel(period.period)}>
                    {period.status === 'cancelled' ? 'Restore' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
