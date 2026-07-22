import { useState, useEffect } from 'react';
import db from '../db/database';
import { format, parseISO } from 'date-fns';
import { useToast } from '../App';
import { CheckSquareIcon } from '../components/Icons';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const all = await db.tasks.orderBy('dueDate').toArray();
    setTasks(all);
  }

  function openNew() {
    setEditTask({ title: '', description: '', priority: 'medium', dueDate: '', completed: 0, reminder: '' });
    setShowModal(true);
  }

  function openEdit(task) {
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

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const priorityColors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--accent)' };

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
        {['all', 'pending', 'completed'].map(t => (
          <button key={t} className={`tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
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
        filtered.map(task => (
          <div key={task.id} className="card" style={{marginBottom:8, cursor:'pointer'}} onClick={() => openEdit(task)}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, flex:1}}>
                <input type="checkbox" checked={!!task.completed}
                  onChange={(e) => { e.stopPropagation(); handleToggleComplete(task); }}
                  style={{width:18, height:18, accentColor:'var(--accent)', cursor:'pointer'}} />
                <div>
                  <div style={{
                    fontSize:14, fontWeight:600,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}>{task.title}</div>
                  {task.description && <div style={{fontSize:12, color:'var(--text-secondary)', marginTop:2}}>{task.description}</div>}
                  <div style={{display:'flex', gap:8, marginTop:4, fontSize:11}}>
                    {task.priority && (
                      <span style={{display:'inline-flex', alignItems:'center', gap:4, color: priorityColors[task.priority]}}>
                        <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>
                        {task.priority}
                      </span>
                    )}
                    {task.dueDate && (
                      <span style={{color:'var(--text-muted)'}}>
                        Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
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
