const s = { strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };

export function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 10l9-7 9 7" {...s} />
      <path d="M5 9v9a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V9" {...s} />
    </svg>
  );
}

export function TimetableIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="3" {...s} />
      <line x1="3" y1="10" x2="21" y2="10" {...s} />
      <line x1="8" y1="2" x2="8" y2="6" {...s} />
      <line x1="16" y1="2" x2="16" y2="6" {...s} />
      <circle cx="8" cy="14" r="1.5" {...s} />
      <circle cx="8" cy="18" r="1.5" {...s} />
      <line x1="12" y1="12.5" x2="18" y2="12.5" {...s} />
      <line x1="12" y1="16.5" x2="18" y2="16.5" {...s} />
      <line x1="12" y1="20.5" x2="16" y2="20.5" {...s} />
    </svg>
  );
}

export function TodayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="3" {...s} />
      <line x1="8" y1="1" x2="8" y2="5" {...s} />
      <line x1="16" y1="1" x2="16" y2="5" {...s} />
      <line x1="4" y1="9" x2="20" y2="9" {...s} />
      <path d="M16 14l-1.5-1.5M16 14l-1.5 1.5" {...s} />
      <path d="M8 16.5h4" {...s} />
      <path d="M8 14a2 2 0 012-2h1" {...s} />
      <path d="M8 19h6" {...s} />
    </svg>
  );
}

export function AttendanceIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M8 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-1" {...s} />
      <path d="M8 3a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V3z" {...s} />
      <path d="M9 13l2 2 4-4" {...s} />
    </svg>
  );
}

export function AttendanceProofIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" {...s} />
      <circle cx="9" cy="10" r="2" {...s} />
      <path d="M21 15l-4-4-5 5-3-2-6 5" {...s} />
      <path d="M17 14.5l2 2" {...s} />
    </svg>
  );
}

export function TasksIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" {...s} />
      <line x1="9" y1="8" x2="17" y2="8" {...s} />
      <line x1="9" y1="12" x2="17" y2="12" {...s} />
      <line x1="9" y1="16" x2="17" y2="16" {...s} />
      <circle cx="6.5" cy="8" r="1.5" {...s} />
      <path d="M5.5 12l1 1 2-2" {...s} />
      <circle cx="6.5" cy="16" r="1.5" {...s} />
    </svg>
  );
}

export function LeaveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="3" {...s} />
      <line x1="8" y1="2" x2="8" y2="6" {...s} />
      <line x1="16" y1="2" x2="16" y2="6" {...s} />
      <line x1="3" y1="10" x2="21" y2="10" {...s} />
      <path d="M15 17c1.5-1 1.5-3 0-4s-3 0-3 2c0 1 1.5 3 1.5 3h3" {...s} />
    </svg>
  );
}

export function NotificationsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" {...s} />
      <path d="M13.73 21a2 2 0 01-3.46 0" {...s} />
      <circle cx="19" cy="5" r="2" {...s} />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" {...s} />
      <line x1="8" y1="1" x2="8" y2="5" {...s} />
      <line x1="16" y1="1" x2="16" y2="5" {...s} />
      <line x1="3" y1="9" x2="21" y2="9" {...s} />
      <line x1="7" y1="13" x2="9" y2="13" {...s} />
      <line x1="11" y1="13" x2="13" y2="13" {...s} />
      <line x1="15" y1="13" x2="17" y2="13" {...s} />
      <line x1="7" y1="17" x2="9" y2="17" {...s} />
      <line x1="11" y1="17" x2="13" y2="17" {...s} />
      <rect x="14" y="15" width="4" height="4" rx="1" {...s} />
    </svg>
  );
}

export function NotesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" {...s} />
      <path d="M14 3v6h6" {...s} />
      <line x1="8" y1="12" x2="16" y2="12" {...s} />
      <line x1="8" y1="15" x2="14" y2="15" {...s} />
      <line x1="8" y1="18" x2="12" y2="18" {...s} />
    </svg>
  );
}

export function AnalyticsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="4" y="15" width="4" height="5" rx="1.5" {...s} />
      <rect x="10" y="11" width="4" height="9" rx="1.5" {...s} />
      <rect x="16" y="7" width="4" height="13" rx="1.5" {...s} />
      <line x1="4" y1="20" x2="20" y2="20" {...s} />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="3" {...s} />
      <path d="M12 1v3" {...s} />
      <path d="M12 20v3" {...s} />
      <path d="M4.22 4.22l2.12 2.12" {...s} />
      <path d="M17.66 17.66l2.12 2.12" {...s} />
      <path d="M1 12h3" {...s} />
      <path d="M20 12h3" {...s} />
      <path d="M4.22 19.78l2.12-2.12" {...s} />
      <path d="M17.66 6.34l2.12-2.12" {...s} />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="11" cy="11" r="7" {...s} />
      <line x1="16.5" y1="16.5" x2="21" y2="21" {...s} />
    </svg>
  );
}

export function AddIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" {...s} />
      <line x1="12" y1="8" x2="12" y2="16" {...s} />
      <line x1="8" y1="12" x2="16" y2="12" {...s} />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" {...s} />
      <path d="M16 7l-8 8" {...s} />
      <path d="M16 7l1 1-8 8H7v-2l8-8z" {...s} />
    </svg>
  );
}

export function DeleteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M4 7h16" {...s} />
      <path d="M10 11v5" {...s} />
      <path d="M14 11v5" {...s} />
      <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" {...s} />
      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" {...s} />
    </svg>
  );
}

export function SaveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" {...s} />
      <path d="M17 21v-7a1 1 0 00-1-1H8a1 1 0 00-1 1v7" {...s} />
      <path d="M7 3v4h8V3" {...s} />
    </svg>
  );
}

export function BackIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="20" y1="12" x2="4" y2="12" {...s} />
      <polyline points="10,6 4,12 10,18" {...s} />
    </svg>
  );
}

export function MoreIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="2" y="9" width="20" height="6" rx="3" {...s} />
      <circle cx="8" cy="12" r="1.5" {...s} />
      <circle cx="12" cy="12" r="1.5" {...s} />
      <circle cx="16" cy="12" r="1.5" {...s} />
    </svg>
  );
}

export function WarningIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 3L2 21h20L12 3z" {...s} />
      <line x1="12" y1="9" x2="12" y2="14" {...s} />
      <circle cx="12" cy="17.5" r="1" {...s} />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" {...s} />
    </svg>
  );
}

export function ClipboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M8 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-1" {...s} />
      <path d="M8 3a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V3z" {...s} />
      <line x1="9" y1="12" x2="15" y2="12" {...s} />
      <line x1="9" y1="15" x2="13" y2="15" {...s} />
    </svg>
  );
}

export function MemoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5z" {...s} />
      <path d="M16 3v5h5" {...s} />
      <line x1="8" y1="10" x2="16" y2="10" {...s} />
      <line x1="8" y1="14" x2="14" y2="14" {...s} />
      <line x1="8" y1="18" x2="12" y2="18" {...s} />
    </svg>
  );
}

export function CheckSquareIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" {...s} />
      <path d="M9 12l2 2 4-4" {...s} />
    </svg>
  );
}

export function PriorityDot(props) {
  return <circle cx="6" cy="6" r="3" {...s} />;
}

export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="4" y1="6" x2="20" y2="6" {...s} />
      <line x1="4" y1="12" x2="20" y2="12" {...s} />
      <line x1="4" y1="18" x2="20" y2="18" {...s} />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="6" y1="6" x2="18" y2="18" {...s} />
      <line x1="18" y1="6" x2="6" y2="18" {...s} />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" {...s} />
      <line x1="5" y1="12" x2="19" y2="12" {...s} />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <polyline points="4,13 9,18 20,7" {...s} />
    </svg>
  );
}
