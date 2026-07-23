import { useNavigate } from 'react-router-dom';
import { TimetableIcon, NotesIcon, CalendarIcon, LeaveIcon, AnalyticsIcon, EditIcon } from '../components/Icons';
import { APP_VERSION } from '../App';

const items = [
  { to: '/timetable', label: 'Timetable', icon: TimetableIcon, desc: 'Manage your weekly schedule', color: 'blue' },
  { to: '/notes', label: 'Notes', icon: NotesIcon, desc: 'Lecture notes and study material', color: 'green' },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon, desc: 'View history and catch up', color: 'purple' },
  { to: '/leave', label: 'Leave', icon: LeaveIcon, desc: 'Schedule time off', color: 'orange' },
  { to: '/analytics', label: 'Analytics', icon: AnalyticsIcon, desc: 'Attendance insights', color: 'pink' },
  { to: '/today/edit', label: 'Live Edit', icon: EditIcon, desc: "Modify today's schedule", color: 'blue' },
];

export default function More() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <h2>More</h2>
        <p>All features</p>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:0}}>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.to} className="more-item" onClick={() => navigate(item.to)}
              style={{animationDelay: `${i * 0.05}s`}}>
              <div className={`more-icon-box more-icon-${item.color}`}>
                <Icon style={{width:22, height:22, stroke:'currentColor'}} />
              </div>
              <div>
                <div style={{fontSize:15, fontWeight:600}}>{item.label}</div>
                <div style={{fontSize:12, color:'var(--text-secondary)', marginTop:1}}>{item.desc}</div>
              </div>
              <div style={{marginLeft:'auto', color:'var(--text-muted)', fontSize:18}}>&rsaquo;</div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:'center', fontSize:11, color:'var(--text-muted)', padding:'20px 0 8px'}}>
        Aditya v{APP_VERSION}
      </div>
    </div>
  );
}
