import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { DashboardIcon, TimetableIcon, TodayIcon, AttendanceIcon, TasksIcon, NotesIcon, CalendarIcon, LeaveIcon, AnalyticsIcon, MenuIcon, CloseIcon } from './Icons';

const iconStyle = { width: 20, height: 20, stroke: 'currentColor' };

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/today', label: 'Today', icon: TodayIcon },
  { to: '/timetable', label: 'Timetable', icon: TimetableIcon },
  { to: '/attendance', label: 'Attendance', icon: AttendanceIcon },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
  { to: '/notes', label: 'Notes', icon: NotesIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/leave', label: 'Leave', icon: LeaveIcon },
  { to: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <CloseIcon style={iconStyle} /> : <MenuIcon style={iconStyle} />}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>Aditya</h1>
          <p>Your Academic Companion</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon"><Icon style={iconStyle} /></span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
