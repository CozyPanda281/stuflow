import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { DashboardIcon, TodayIcon, AttendanceIcon, TasksIcon, MoreIcon } from './Icons';

const primaryTabs = [
  { to: '/dashboard', label: 'Home', icon: DashboardIcon },
  { to: '/today', label: 'Today', icon: TodayIcon },
  { to: '/attendance', label: 'Attendance', icon: AttendanceIcon },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
  { to: '/more', label: 'More', icon: MoreIcon },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="app-layout">
      <div className="ambient-bg" />
      <div className="page-wrap">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </div>
      <nav className="bottom-nav">
        {primaryTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/dashboard'}
              className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-tab-icon" />
              <span className="nav-label">{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
