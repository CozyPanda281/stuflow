import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import db, { getOrCreateDaySchedule } from '../db/database';
import { useToast } from '../App';
import { ClipboardIcon } from '../components/Icons';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [todayPeriods, setTodayPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [viewProof, setViewProof] = useState(null);
  const fileRef = useRef();
  const { showToast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const all = await db.attendance.orderBy('date').reverse().toArray();
    setRecords(all);

    const schedule = await getOrCreateDaySchedule(today);
    const subjects = schedule.actual.filter(p => p.subject && p.status !== 'cancelled');
    setTodayPeriods(subjects);
  }

  async function handleMarkAttendance(period) {
    const exists = records.find(r => r.date === today && r.subject === period.subject && r.period === period.period);
    if (exists) {
      setEditRecord(exists);
      setShowModal(true);
      return;
    }
    setEditRecord({
      date: today,
      subject: period.subject,
      faculty: period.faculty,
      period: period.period,
      status: 'present',
      notes: '',
      proofImage: null
    });
    setShowModal(true);
  }

  async function handleSaveAttendance() {
    if (!editRecord) return;
    const data = { ...editRecord, proofImage: proofImage || editRecord.proofImage };
    if (editRecord.id) {
      await db.attendance.update(editRecord.id, data);
      showToast('Attendance updated', 'success');
    } else {
      await db.attendance.add(data);
      showToast('Attendance marked', 'success');
    }
    setShowModal(false);
    setEditRecord(null);
    setProofImage(null);
    load();
  }

  async function handleDelete(id) {
    await db.attendance.delete(id);
    showToast('Attendance deleted', 'info');
    setShowModal(false);
    setEditRecord(null);
    load();
  }

  function handleImageCapture(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProofImage(ev.target.result);
    reader.readAsDataURL(file);
  }

  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    leave: records.filter(r => r.status === 'leave').length,
    cancelled: records.filter(r => r.status === 'cancelled').length
  };
  stats.percentage = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Track and manage attendance</p>
      </div>

      <div className="grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-value" style={{color:'var(--green)'}}>{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color:'var(--red)'}}>{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color:'var(--accent)'}}>{stats.percentage}%</div>
          <div className="stat-label">Percentage</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {todayPeriods.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <span className="card-title">Today's Classes</span>
          </div>
          {todayPeriods.map(p => (
            <div key={p.period} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'8px 0', borderBottom:'1px solid var(--border)'
            }}>
              <div>
                <div style={{fontSize:13, fontWeight:600}}>{p.subject}</div>
                <div style={{fontSize:11, color:'var(--text-muted)'}}>Period {p.period} &middot; {p.faculty}</div>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => handleMarkAttendance(p)}>
                Mark
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Records</span>
          <span style={{fontSize:12, color:'var(--text-muted)'}}>{records.length} entries</span>
        </div>
        {records.length === 0 ? (
          <div className="empty-state">
            <ClipboardIcon style={{ width: 48, height: 48, stroke: 'var(--text-muted)', strokeWidth: 1.5 }} />
            <p>No attendance records yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 50).map(r => (
                  <tr key={r.id}>
                    <td style={{whiteSpace:'nowrap'}}>{r.date}</td>
                    <td>{r.subject}</td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>{r.status}</span>
                    </td>
                    <td>
                      <div className="inline-flex">
                        <button className="btn btn-sm" onClick={() => {
                          setEditRecord(r);
                          setShowModal(true);
                        }}>Edit</button>
                        {r.proofImage && (
                          <button className="btn btn-sm" onClick={() => setViewProof(r.proofImage)}>Proof</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editRecord?.id ? 'Edit Attendance' : 'Mark Attendance'}</h3>
            <div className="form-group">
              <label>Subject</label>
              <input value={editRecord?.subject || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={editRecord?.status || 'present'}
                onChange={e => setEditRecord({...editRecord, status: e.target.value})}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="leave">Leave</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea value={editRecord?.notes || ''}
                onChange={e => setEditRecord({...editRecord, notes: e.target.value})}
                placeholder="Any notes..." />
            </div>
            <div className="form-group">
              <label>Proof Image (optional)</label>
              <input type="file" ref={fileRef} accept="image/*" capture="environment"
                onChange={handleImageCapture} style={{fontSize:12}} />
              {proofImage && <img src={proofImage} style={{width:'100%', maxHeight:200, objectFit:'contain', marginTop:8, borderRadius:8}} />}
              {editRecord?.proofImage && !proofImage && (
                <img src={editRecord.proofImage} style={{width:'100%', maxHeight:200, objectFit:'contain', marginTop:8, borderRadius:8}} />
              )}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => { setShowModal(false); setProofImage(null); }}>Cancel</button>
              {editRecord?.id && (
                <button className="btn btn-danger" onClick={() => handleDelete(editRecord.id)}>Delete</button>
              )}
              <button className="btn btn-primary" onClick={handleSaveAttendance}>Save</button>
            </div>
          </div>
        </div>
      )}

      {viewProof && (
        <div className="modal-overlay" onClick={() => setViewProof(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:400}}>
            <h3>Attendance Proof</h3>
            <img src={viewProof} style={{width:'100%', borderRadius:8}} />
            <div className="modal-actions">
              <button className="btn" onClick={() => setViewProof(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
