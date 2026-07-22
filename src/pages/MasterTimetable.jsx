import { useState, useEffect } from 'react';
import db, { defaultTimetable, saveTimetableDay } from '../db/database';
import { useToast } from '../App';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MasterTimetable() {
  const [timetableData, setTimetableData] = useState({});
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || 'Monday');
  const [loading, setLoading] = useState(true);
  const [copyModal, setCopyModal] = useState(null);
  const [smartFillModal, setSmartFillModal] = useState(null);
  const { showToast } = useToast();

  useEffect(() => { loadTimetable(); }, []);

  async function loadTimetable() {
    setLoading(true);
    const data = {};
    for (const day of DAYS) {
      const entries = await db.timetable.where('dayOfWeek').equals(day).sortBy('period');
      const defaultPeriods = defaultTimetable[day] || [];
      data[day] = entries.length > 0 ? entries.map(e => ({
        period: e.period, subject: e.subject || '', faculty: e.faculty || '',
        startTime: e.startTime, endTime: e.endTime
      })) : defaultPeriods.map(p => ({
        period: p.period, subject: '', faculty: '',
        startTime: p.startTime, endTime: p.endTime
      }));
    }
    setTimetableData(data);
    setLoading(false);
  }

  function getFacultyForSubject(subject) {
    const counts = {};
    for (const d of DAYS) {
      for (const p of (timetableData[d] || [])) {
        if (p.subject.toLowerCase() === subject.toLowerCase() && p.faculty) {
          counts[p.faculty] = (counts[p.faculty] || 0) + 1;
        }
      }
    }
    const entries = Object.entries(counts);
    return entries.length ? entries.sort((a, b) => b[1] - a[1])[0][0] : '';
  }

  function updatePeriod(day, idx, field, value) {
    const updated = { ...timetableData };
    updated[day] = updated[day].map((p, i) => i === idx ? { ...p, [field]: value } : p);
    if (field === 'subject' && value) {
      const faculty = getFacultyForSubject(value);
      if (faculty && !updated[day][idx].faculty) {
        updated[day][idx] = { ...updated[day][idx], faculty };
      }
    }
    setTimetableData(updated);
  }

  function renumber(periods) {
    return periods.map((p, i) => ({ ...p, period: i + 1 }));
  }

  function handleMerge(idx) {
    const day = activeDay;
    const periods = timetableData[day];
    if (idx >= periods.length - 1) {
      showToast('No next period to merge with', 'error');
      return;
    }
    const current = periods[idx];
    const next = periods[idx + 1];
    const mergedName = current.subject && next.subject
      ? `${current.subject} + ${next.subject}`
      : (current.subject || next.subject);
    const updated = { ...timetableData };
    const merged = { ...current, subject: mergedName, endTime: next.endTime };
    updated[day] = renumber([...periods.slice(0, idx), merged, ...periods.slice(idx + 2)]);
    setTimetableData(updated);
    showToast('Periods merged', 'success');
  }

  function handleDelete(idx) {
    const day = activeDay;
    const periods = timetableData[day];
    if (periods.length <= 1) {
      showToast('Cannot delete the last period', 'error');
      return;
    }
    const updated = { ...timetableData };
    updated[day] = renumber([...periods.slice(0, idx), ...periods.slice(idx + 1)]);
    setTimetableData(updated);
    showToast('Period deleted', 'info');
  }

  function handleClear(idx) {
    const day = activeDay;
    const updated = { ...timetableData };
    updated[day] = updated[day].map((p, i) => i === idx ? { ...p, subject: '', faculty: '' } : p);
    setTimetableData(updated);
  }

  function handleAddPeriod() {
    const day = activeDay;
    const periods = timetableData[day];
    const last = periods[periods.length - 1];
    const [h, m] = (last?.endTime || '17:00').split(':').map(Number);
    const newStart = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const newEnd = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const newPeriod = {
      period: periods.length + 1, subject: '', faculty: '',
      startTime: newStart, endTime: newEnd
    };
    const updated = { ...timetableData };
    updated[day] = renumber([...periods, newPeriod]);
    setTimetableData(updated);
  }

  function openCopyModal(idx) {
    const period = timetableData[activeDay][idx];
    if (!period.subject) { showToast('Add a subject first', 'error'); return; }
    setCopyModal({
      periodIdx: idx,
      subject: period.subject,
      faculty: period.faculty,
      days: DAYS.filter(d => d !== activeDay)
    });
  }

  function toggleCopyDay(day) {
    if (!copyModal) return;
    const days = copyModal.days.includes(day)
      ? copyModal.days.filter(d => d !== day)
      : [...copyModal.days, day];
    setCopyModal({ ...copyModal, days });
  }

  function handleCopyConfirm() {
    if (!copyModal) return;
    const updated = { ...timetableData };
    const sourcePeriod = updated[activeDay][copyModal.periodIdx];
    for (const day of copyModal.days) {
      updated[day] = updated[day].map(p =>
        p.period === sourcePeriod.period
          ? { ...p, subject: copyModal.subject, faculty: copyModal.faculty }
          : p
      );
    }
    setTimetableData(updated);
    setCopyModal(null);
    showToast(`Copied to ${copyModal.days.length} day(s)`, 'success');
  }

  function detectPatterns() {
    const suggestions = [];
    const maxPeriods = Math.max(...DAYS.map(d => (timetableData[d] || []).length));

    for (let pi = 0; pi < maxPeriods; pi++) {
      const filled = [];
      const emptyDays = [];

      for (const day of DAYS) {
        const periods = timetableData[day];
        if (!periods || pi >= periods.length) continue;
        const p = periods[pi];
        if (p.subject) {
          filled.push({ day, subject: p.subject, faculty: p.faculty });
        } else {
          emptyDays.push(day);
        }
      }

      if (emptyDays.length === 0) continue;

      const groups = {};
      for (const f of filled) {
        if (!groups[f.subject]) groups[f.subject] = { subject: f.subject, entries: [], faculties: {} };
        groups[f.subject].entries.push(f.day);
        groups[f.subject].faculties[f.faculty] = (groups[f.subject].faculties[f.faculty] || 0) + 1;
      }

      for (const subjectKey of Object.keys(groups)) {
        const g = groups[subjectKey];
        if (g.entries.length < 2) continue;
        const bestFaculty = Object.keys(g.faculties).sort((a, b) => g.faculties[b] - g.faculties[a])[0] || '';
        for (const day of emptyDays) {
          const exists = suggestions.some(s => s.day === day && s.periodIdx === pi);
          if (!exists) {
            suggestions.push({ day, periodIdx: pi, subject: subjectKey, faculty: bestFaculty });
          }
        }
      }
    }
    return suggestions;
  }

  function handleSmartFill() {
    const suggestions = detectPatterns();
    if (suggestions.length === 0) {
      showToast('No patterns detected to fill', 'info');
      return;
    }
    setSmartFillModal(suggestions);
  }

  function applySmartFill() {
    if (!smartFillModal) return;
    const updated = { ...timetableData };
    for (const s of smartFillModal) {
      updated[s.day] = updated[s.day].map((p, i) =>
        i === s.periodIdx ? { ...p, subject: s.subject, faculty: s.faculty } : p
      );
    }
    setTimetableData(updated);
    setSmartFillModal(null);
    showToast(`Filled ${smartFillModal.length} empty slot(s)`, 'success');
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

  function handleClearDay() {
    const day = activeDay;
    const periods = timetableData[day];
    const updated = { ...timetableData };
    updated[day] = periods.map(p => ({ ...p, subject: '', faculty: '' }));
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
          <button className="btn btn-sm" onClick={handleSmartFill} style={{color:'var(--accent)'}}>&#9889; Smart Fill</button>
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
          <div className="inline-flex" style={{flexWrap:'wrap', gap:4}}>
            {DAYS.filter(d => d !== activeDay).map(day => (
              <button key={day} className="btn btn-sm" onClick={() => handleCopyFrom(day)} style={{fontSize:11, padding:'4px 8px'}}>
                Copy {day.slice(0, 3)}
              </button>
            ))}
            <button className="btn btn-sm btn-primary" onClick={handleAddPeriod} style={{fontSize:11, padding:'4px 8px'}}>
              + Period
            </button>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{width:40}}>#</th>
                <th style={{width:90}}>Time</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th style={{width:180}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(timetableData[activeDay] || []).map((period, idx) => (
                <tr key={idx} style={{opacity: period.subject ? 1 : 0.5}}>
                  <td style={{fontSize:12, color:'var(--text-muted)', textAlign:'center'}}>{idx + 1}</td>
                  <td style={{whiteSpace:'nowrap', fontSize:12}}>
                    <input type="time" value={period.startTime}
                      onChange={e => updatePeriod(activeDay, idx, 'startTime', e.target.value)}
                      style={{width:65, padding:'4px', fontSize:12}} />
                    <span style={{margin:'0 2px', color:'var(--text-muted)'}}>-</span>
                    <input type="time" value={period.endTime}
                      onChange={e => updatePeriod(activeDay, idx, 'endTime', e.target.value)}
                      style={{width:65, padding:'4px', fontSize:12}} />
                  </td>
                  <td>
                    <input value={period.subject}
                      onChange={e => updatePeriod(activeDay, idx, 'subject', e.target.value)}
                      placeholder="Subject" style={{fontSize:13, padding:'5px 8px'}} />
                  </td>
                  <td>
                    <input value={period.faculty}
                      onChange={e => updatePeriod(activeDay, idx, 'faculty', e.target.value)}
                      placeholder="Faculty" style={{fontSize:13, padding:'5px 8px', width:120}} />
                  </td>
                  <td>
                    <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                      <button className="btn btn-sm" onClick={() => handleClear(idx)}
                        style={{fontSize:10, padding:'3px 6px'}}>Clear</button>
                      {idx < timetableData[activeDay].length - 1 && (
                        <button className="btn btn-sm" onClick={() => handleMerge(idx)}
                          style={{fontSize:10, padding:'3px 6px'}}>Merge</button>
                      )}
                      <button className="btn btn-sm" onClick={() => handleDelete(idx)}
                        style={{fontSize:10, padding:'3px 6px', color:'var(--red)'}}>Delete</button>
                      {period.subject && (
                        <button className="btn btn-sm" onClick={() => openCopyModal(idx)}
                          style={{fontSize:10, padding:'3px 6px'}}>Copy to...</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!timetableData[activeDay]?.length && (
          <div style={{textAlign:'center', padding:20}}>
            <button className="btn btn-primary" onClick={handleAddPeriod}>Add First Period</button>
          </div>
        )}
      </div>

      {smartFillModal && (
        <div className="modal-overlay" onClick={() => setSmartFillModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>&#9889; Smart Fill Suggestions</h3>
            <p style={{fontSize:13, color:'var(--text-secondary)', marginBottom:12}}>
              Found patterns across your week. Fill these empty slots?
            </p>
            <div style={{maxHeight:300, overflowY:'auto', marginBottom:12}}>
              {smartFillModal.map((s, i) => (
                <div key={i} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'6px 8px', borderRadius:6, fontSize:13,
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-hover)',
                  marginBottom:2
                }}>
                  <span style={{fontWeight:600, minWidth:70}}>{s.day.slice(0, 3)}</span>
                  <span style={{flex:1}}>Period {s.periodIdx + 1}: <strong>{s.subject}</strong></span>
                  {s.faculty && <span style={{color:'var(--text-muted)', fontSize:12}}>{s.faculty}</span>}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setSmartFillModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={applySmartFill}>
                Fill {smartFillModal.length} slot(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {copyModal && (
        <div className="modal-overlay" onClick={() => setCopyModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Copy "{copyModal.subject}" to...</h3>
            <p style={{fontSize:13, color:'var(--text-secondary)', marginBottom:12}}>
              Select days to copy this period's subject &amp; faculty to the same slot.
            </p>
            {DAYS.filter(d => d !== activeDay).map(day => (
              <label key={day} className="checkbox-label" style={{marginBottom:8, fontSize:14}}>
                <input type="checkbox" checked={copyModal.days.includes(day)}
                  onChange={() => toggleCopyDay(day)} />
                {day}
              </label>
            ))}
            <div className="modal-actions">
              <button className="btn" onClick={() => setCopyModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCopyConfirm}
                disabled={copyModal.days.length === 0}>
                Copy to {copyModal.days.length} day(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
