import { useState, useEffect } from 'react';
import db from '../db/database';
import { format } from 'date-fns';
import { useToast } from '../App';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const all = await db.notes.orderBy('createdAt').reverse().toArray();
    setNotes(all);
  }

  function openNew() {
    setEditNote({ title: '', content: '', subject: '' });
    setShowModal(true);
  }

  function openEdit(note) {
    setEditNote({ ...note });
    setShowModal(true);
  }

  async function handleSave() {
    if (!editNote?.title?.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    const now = format(new Date(), 'yyyy-MM-dd HH:mm');
    if (editNote.id) {
      await db.notes.update(editNote.id, { ...editNote, updatedAt: now });
      showToast('Note updated', 'success');
    } else {
      await db.notes.add({ ...editNote, createdAt: now, updatedAt: now });
      showToast('Note added', 'success');
    }
    setShowModal(false);
    setEditNote(null);
    load();
  }

  async function handleDelete(id) {
    await db.notes.delete(id);
    showToast('Note deleted', 'info');
    setShowModal(false);
    load();
  }

  const filtered = notes.filter(n =>
    !search || n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <div>
          <h2>Notes</h2>
          <p>{notes.length} notes</p>
        </div>
        <div className="inline-flex">
          <input style={{width:200}} placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-primary" onClick={openNew}>+ New Note</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">&#128221;</div>
            <p>{search ? 'No matching notes' : 'No notes yet'}</p>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(note => (
            <div key={note.id} className="card" style={{cursor:'pointer'}} onClick={() => openEdit(note)}>
              <div className="card-header">
                <span className="card-title">{note.title || 'Untitled'}</span>
              </div>
              {note.subject && <div style={{fontSize:11, color:'var(--accent)', marginBottom:4}}>{note.subject}</div>}
              <div style={{fontSize:13, color:'var(--text-secondary)', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                {note.content || 'No content'}
              </div>
              <div style={{fontSize:11, color:'var(--text-muted)', marginTop:8}}>
                {note.createdAt}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editNote?.id ? 'Edit Note' : 'New Note'}</h3>
            <div className="form-group">
              <label>Title</label>
              <input value={editNote?.title || ''} onChange={e => setEditNote({...editNote, title: e.target.value})} placeholder="Note title" autoFocus />
            </div>
            <div className="form-group">
              <label>Subject (optional)</label>
              <input value={editNote?.subject || ''} onChange={e => setEditNote({...editNote, subject: e.target.value})} placeholder="e.g. Mathematics" />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea value={editNote?.content || ''} onChange={e => setEditNote({...editNote, content: e.target.value})}
                placeholder="Write your notes here..." style={{minHeight:150}} />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              {editNote?.id && <button className="btn btn-danger" onClick={() => handleDelete(editNote.id)}>Delete</button>}
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
