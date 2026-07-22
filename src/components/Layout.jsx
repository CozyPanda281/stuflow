import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '../App';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u2302' },
  { to: '/today', label: 'Today', icon: '\u2606' },
  { to: '/timetable', label: 'Timetable', icon: '\u2630' },
  { to: '/attendance', label: 'Attendance', icon: '\u2713' },
  { to: '/tasks', label: 'Tasks', icon: '\u2611' },
  { to: '/notes', label: 'Notes', icon: '\u270E' },
  { to: '/calendar', label: 'Calendar', icon: '\u25A6' },
  { to: '/leave', label: 'Leave', icon: '\u2716' },
  { to: '/analytics', label: 'Analytics', icon: '\u2261' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '\u2715' : '\u2630'}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>Aditya</h1>
          <p>Academic Companion</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
