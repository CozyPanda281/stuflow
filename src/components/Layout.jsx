import { Outlet, NavLink } from 'react-router-dom';
import { DashboardIcon, TodayIcon, AttendanceIcon, TasksIcon, MoreIcon } from './Icons';

const primaryTabs = [
  { to: '/dashboard', label: 'Home', icon: DashboardIcon },
  { to: '/today', label: 'Today', icon: TodayIcon },
  { to: '/attendance', label: 'Attendance', icon: AttendanceIcon },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
  { to: '/more', label: 'More', icon: MoreIcon },
];

export default function Layout() {
  return (
    <div className="app-layout">
      <div className="page-wrap">
        <Outlet />
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
              <Icon />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
