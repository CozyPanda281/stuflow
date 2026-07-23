import { useState, useEffect } from 'react';
import db from '../db/database';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { useToast } from '../context';
import { CheckSquareIcon } from '../components/Icons';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const all = await db.tasks.orderBy('dueDate').toArray();
    setTasks(all);
  }

  function openNew() {
    setEditTask({ title: '', description: '', priority: 'medium', dueDate: '', completed: 0 });
    setShowModal(true);
  }

  function openEdit(e, task) {
    e.stopPropagation();
    setEditTask({ ...task });
    setShowModal(true);
  }

  async function handleSave() {
    if (!editTask?.title?.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (editTask.id) {
      await db.tasks.update(editTask.id, editTask);
      showToast('Task updated', 'success');
    } else {
      await db.tasks.add({ ...editTask, completed: 0 });
      showToast('Task added', 'success');
    }
    setShowModal(false);
    setEditTask(null);
    load();
  }

  async function handleDelete(id) {
    await db.tasks.delete(id);
    showToast('Task deleted', 'info');
    setShowModal(false);
    load();
  }

  async function handleToggleComplete(task) {
    await db.tasks.update(task.id, { completed: task.completed ? 0 : 1 });
    load();
  }

  function getTaskUrgency(task) {
    if (task.completed) return 'done';
    if (!task.dueDate) return 'none';
    const today = startOfDay(new Date());
    const due = startOfDay(parseISO(task.dueDate));
    const days = differenceInDays(due, today);
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    if (days <= 2) return 'due-soon';
    return 'none';
  }

  const urgencyColors = {
    done: { bg: 'rgba(52,211,153,0.08)', border: 'var(--green)', text: 'var(--green)' },
    overdue: { bg: 'rgba(248,113,113,0.08)', border: 'var(--red)', text: 'var(--red)' },
    'due-today': { bg: 'rgba(248,113,113,0.08)', border: 'var(--red)', text: 'var(--red)' },
    'due-soon': { bg: 'rgba(251,191,36,0.08)', border: 'var(--yellow)', text: 'var(--yellow)' },
    none: { bg: '', border: 'var(--border)', text: 'var(--text-secondary)' },
  };

  const priorityColors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--accent)' };

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h2>Tasks</h2>
          <p>{tasks.filter(t => !t.completed).length} pending</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Task</button>
      </div>

      <div className="tabs">
        {[
          { key: 'all', label: 'All', color: 'var(--accent)' },
          { key: 'pending', label: 'Pending', color: 'var(--orange)' },
          { key: 'completed', label: 'Done', color: 'var(--green)' },
        ].map(t => (
          <button key={t.key} className={`tab ${filter === t.key ? 'active' : ''}`}
            style={filter === t.key ? { background: t.color, color:'#fff' } : {}}
            onClick={() => setFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckSquareIcon style={{ width: 48, height: 48, stroke: 'var(--text-muted)', strokeWidth: 1.5 }} />
            <p>No tasks found</p>
          </div>
        </div>
      ) : (
        filtered.map((task, i) => {
          const urgency = getTaskUrgency(task);
          const colors = urgencyColors[urgency];
          return (
            <div key={task.id} className="card card-enter" style={{
              marginBottom:8, cursor:'pointer', padding:'12px 14px',
              background: colors.bg || 'var(--bg-card)',
              borderLeft: `3px solid ${colors.border}`,
              transition: 'all 0.12s',
              animationDelay: `${i * 0.04}s`
            }} onClick={() => handleToggleComplete(task)}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10}}>
                <div style={{display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0}}>
                  <div style={{
                    width:22, height:22, borderRadius:6, flexShrink:0,
                    border: `2px solid ${task.completed ? 'var(--green)' : urgency === 'overdue' || urgency === 'due-today' ? 'var(--red)' : urgency === 'due-soon' ? 'var(--yellow)' : 'var(--text-muted)'}`,
                    background: task.completed ? 'var(--green)' : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition: 'all 0.12s'
                  }}>
                    {task.completed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="4,13 9,18 20,7"/></svg>}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{
                      fontSize:14, fontWeight:600,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'var(--green)' : 'var(--text)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                    }}>{task.title}</div>
                    {task.description && <div style={{
                      fontSize:12, color:'var(--text-secondary)', marginTop:2,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                    }}>{task.description}</div>}
                    <div style={{display:'flex', gap:10, marginTop:4, fontSize:11, flexWrap:'wrap'}}>
                      {task.priority && (
                        <span style={{display:'inline-flex', alignItems:'center', gap:3, color: priorityColors[task.priority]}}>
                          <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span style={{color: colors.text}}>
                          Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                          {urgency === 'overdue' && ' (Overdue!)'}
                          {urgency === 'due-today' && ' (Today!)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost" style={{flexShrink:0, fontSize:16, lineHeight:1, padding:'2px 6px'}}
                  onClick={(e) => openEdit(e, task)}>
                  &#8942;
                </button>
              </div>
            </div>
          );
        })
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editTask?.id ? 'Edit Task' : 'New Task'}</h3>
            <div className="form-group">
              <label>Title *</label>
              <input value={editTask?.title || ''} onChange={e => setEditTask({...editTask, title: e.target.value})} placeholder="What needs to be done?" autoFocus />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={editTask?.description || ''} onChange={e => setEditTask({...editTask, description: e.target.value})} placeholder="Optional details" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Priority</label>
                <select value={editTask?.priority || 'medium'} onChange={e => setEditTask({...editTask, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={editTask?.dueDate || ''} onChange={e => setEditTask({...editTask, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              {editTask?.id && <button className="btn btn-danger" onClick={() => handleDelete(editTask.id)}>Delete</button>}
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
