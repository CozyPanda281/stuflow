import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import db, { getActiveLeave } from '../db/database';
import { useToast } from '../App';
import { WarningIcon, CalendarIcon } from '../components/Icons';

const iw = { width: 18, height: 18, stroke: 'currentColor', flexShrink: 0 };

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [activeLeave, setActiveLeaveState] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const { showToast, setActiveLeave } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const all = await db.leaves.orderBy('startDate').reverse().toArray();
    setLeaves(all);
    const active = await getActiveLeave();
    setActiveLeaveState(active);
  }

  function openNew() {
    setEditLeave({ startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', reason: '', active: 1 });
    setShowModal(true);
  }

  function openEdit(leave) {
    setEditLeave({ ...leave });
    setShowModal(true);
  }

  async function handleSave() {
    if (!editLeave?.startDate || !editLeave?.endDate || !editLeave?.reason?.trim()) {
      showToast('All fields are required', 'error');
      return;
    }
    if (editLeave.endDate < editLeave.startDate) {
      showToast('End date must be after start date', 'error');
      return;
    }
    if (editLeave.id) {
      await db.leaves.update(editLeave.id, editLeave);
      showToast('Leave updated', 'success');
    } else {
      await db.leaves.add(editLeave);
      showToast('Leave added', 'success');
    }
    setShowModal(false);
    setEditLeave(null);
    load();
    const active = await getActiveLeave();
    setActiveLeave(active);
  }

  async function handleDelete(id) {
    await db.leaves.delete(id);
    showToast('Leave removed', 'info');
    setShowModal(false);
    load();
    const active = await getActiveLeave();
    setActiveLeave(active);
  }

  async function handleEndEarly(leave) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newEnd = leave.startDate > today ? leave.startDate : today;
    if (newEnd < leave.startDate) {
      showToast('Cannot end before start date', 'error');
      return;
    }
    await db.leaves.update(leave.id, {
      endDate: newEnd,
      active: leave.startDate <= today && today <= newEnd ? 1 : 0
    });
    showToast('Leave ended early', 'success');
    load();
    const active = await getActiveLeave();
    setActiveLeave(active);
  }

  const isCurrentlyOnLeave = activeLeave && (() => {
    const today = new Date();
    const start = new Date(activeLeave.startDate + 'T00:00:00');
    const end = new Date(activeLeave.endDate + 'T00:00:00');
    return today >= start && today <= end;
  })();

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h2>Leave Management</h2>
          <p>Schedule and manage your leaves</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Leave</button>
      </div>

      {isCurrentlyOnLeave && (
        <div className="leave-banner">
          <WarningIcon style={iw} />
          <span>You are currently on leave: {activeLeave.reason}</span>
          <button className="btn btn-sm" style={{marginLeft:'auto'}} onClick={() => handleEndEarly(activeLeave)}>
            End Early
          </button>
        </div>
      )}

      {leaves.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CalendarIcon style={{ width: 48, height: 48, stroke: 'var(--text-muted)', strokeWidth: 1.5 }} />
            <p>No leaves recorded</p>
          </div>
        </div>
      ) : (
        leaves.map(leave => {
          const today = new Date();
          const start = new Date(leave.startDate + 'T00:00:00');
          const end = new Date(leave.endDate + 'T00:00:00');
          const isActive = leave.active && today >= start && today <= end;
          const isUpcoming = today < start;

          return (
            <div key={leave.id} className="card" style={{marginBottom:8, cursor:'pointer',
              borderLeft: `3px solid ${isActive ? 'var(--orange)' : isUpcoming ? 'var(--yellow)' : 'var(--text-muted)'}`
            }} onClick={() => openEdit(leave)}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:14, fontWeight:600}}>{leave.reason}</div>
                  <div style={{fontSize:12, color:'var(--text-secondary)', marginTop:4}}>
                    {format(parseISO(leave.startDate), 'MMM d, yyyy')} - {format(parseISO(leave.endDate), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="inline-flex">
                  {isActive && (
                    <button className="btn btn-sm btn-warning" onClick={(e) => { e.stopPropagation(); handleEndEarly(leave); }}>
                      End Early
                    </button>
                  )}
                  <span className={`status-badge ${isActive ? 'status-leave' : isUpcoming ? 'status-late' : 'status-cancelled'}`}>
                    {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Past'}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editLeave?.id ? 'Edit Leave' : 'New Leave'}</h3>
            <div className="form-group">
              <label>Reason</label>
              <input value={editLeave?.reason || ''} onChange={e => setEditLeave({...editLeave, reason: e.target.value})} placeholder="e.g. Sick, Personal..." autoFocus />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={editLeave?.startDate || ''} onChange={e => setEditLeave({...editLeave, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={editLeave?.endDate || ''} onChange={e => setEditLeave({...editLeave, endDate: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              {editLeave?.id && <button className="btn btn-danger" onClick={() => handleDelete(editLeave.id)}>Delete</button>}
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
