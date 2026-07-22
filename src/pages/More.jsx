import { useNavigate, useLocation } from 'react-router-dom';
import { TimetableIcon, NotesIcon, CalendarIcon, LeaveIcon, AnalyticsIcon, SettingsIcon, EditIcon } from '../components/Icons';

const items = [
  { to: '/timetable', label: 'Timetable', icon: TimetableIcon, desc: 'Manage your weekly schedule' },
  { to: '/notes', label: 'Notes', icon: NotesIcon, desc: 'Lecture notes and study material' },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon, desc: 'View history and catch up' },
  { to: '/leave', label: 'Leave', icon: LeaveIcon, desc: 'Schedule time off' },
  { to: '/analytics', label: 'Analytics', icon: AnalyticsIcon, desc: 'Attendance insights' },
  { to: '/today/edit', label: 'Live Edit', icon: EditIcon, desc: 'Modify today\'s schedule' },
];

export default function More() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <div className="page-header">
        <h2>More</h2>
        <p>All features</p>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <div key={item.to} className="card" style={{
              cursor:'pointer', padding:'14px 16px',
              borderLeft: isActive ? `3px solid var(--accent)` : '1px solid var(--border)',
              marginBottom:0
            }} onClick={() => navigate(item.to)}>
              <div style={{display:'flex', alignItems:'center', gap:14}}>
                <div style={{
                  width:40, height:40, borderRadius:10,
                  background:'var(--bg-surface)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'var(--accent)', flexShrink:0
                }}>
                  <Icon style={{width:22, height:22, stroke:'currentColor'}} />
                </div>
                <div>
                  <div style={{fontSize:15, fontWeight:600}}>{item.label}</div>
                  <div style={{fontSize:12, color:'var(--text-secondary)', marginTop:1}}>{item.desc}</div>
                </div>
                <div style={{marginLeft:'auto', color:'var(--text-muted)', fontSize:18}}>&rsaquo;</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
