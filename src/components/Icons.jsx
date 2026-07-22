function useStroke(color) {
  return { stroke: color || 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
}

export function DashboardIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" {...s} />
    </svg>
  );
}

export function TimetableIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" {...s} />
      <line x1="3" y1="9" x2="21" y2="9" {...s} />
      <line x1="8" y1="2" x2="8" y2="6" {...s} />
      <line x1="16" y1="2" x2="16" y2="6" {...s} />
      <circle cx="8" cy="13" r="1" {...s} />
      <circle cx="8" cy="17" r="1" {...s} />
      <line x1="12" y1="12.5" x2="18" y2="12.5" {...s} />
      <line x1="12" y1="16.5" x2="18" y2="16.5" {...s} />
      <line x1="12" y1="20.5" x2="15" y2="20.5" {...s} />
    </svg>
  );
}

export function TodayIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" {...s} />
      <line x1="8" y1="2" x2="8" y2="6" {...s} />
      <line x1="16" y1="2" x2="16" y2="6" {...s} />
      <line x1="3" y1="10" x2="21" y2="10" {...s} />
      <circle cx="16" cy="16" r="3" {...s} />
      <polyline points="14,16 15.5,17.5 18,15" {...s} />
    </svg>
  );
}

export function AttendanceIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 3v4a1 1 0 001 1h4" {...s} />
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" {...s} />
      <polyline points="9,13 11,15 15,11" {...s} />
    </svg>
  );
}

export function AttendanceProofIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" {...s} />
      <circle cx="9" cy="10" r="2" {...s} />
      <path d="M21 15l-5-5-5 5-3-2-5 5" {...s} />
    </svg>
  );
}

export function TasksIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" {...s} />
      <polyline points="9,11 11,13 15,9" {...s} />
      <line x1="9" y1="16" x2="15" y2="16" {...s} />
    </svg>
  );
}

export function LeaveIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" {...s} />
      <line x1="8" y1="2" x2="8" y2="6" {...s} />
      <line x1="16" y1="2" x2="16" y2="6" {...s} />
      <line x1="3" y1="10" x2="21" y2="10" {...s} />
      <path d="M10 16l4-4" {...s} />
      <path d="M10 12l4 4" {...s} />
    </svg>
  );
}

export function NotificationsIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" {...s} />
      <path d="M13.73 21a2 2 0 01-3.46 0" {...s} />
    </svg>
  );
}

export function CalendarIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" {...s} />
      <line x1="8" y1="1" x2="8" y2="5" {...s} />
      <line x1="16" y1="1" x2="16" y2="5" {...s} />
      <line x1="3" y1="9" x2="21" y2="9" {...s} />
      <polyline points="11,14 12.5,15.5 15,13" {...s} />
      <circle cx="16" cy="16" r="2" {...s} />
    </svg>
  );
}

export function NotesIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" {...s} />
      <path d="M14 2v6h6" {...s} />
      <line x1="8" y1="13" x2="16" y2="13" {...s} />
      <line x1="8" y1="17" x2="14" y2="17" {...s} />
    </svg>
  );
}

export function AnalyticsIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="4" y="15" width="4" height="5" rx="1" {...s} />
      <rect x="10" y="11" width="4" height="9" rx="1" {...s} />
      <rect x="16" y="7" width="4" height="13" rx="1" {...s} />
    </svg>
  );
}

export function SettingsIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="3" {...s} />
      <path d="M12 1v2" {...s} />
      <path d="M12 21v2" {...s} />
      <path d="M4.22 4.22l1.42 1.42" {...s} />
      <path d="M18.36 18.36l1.42 1.42" {...s} />
      <path d="M1 12h2" {...s} />
      <path d="M21 12h2" {...s} />
      <path d="M4.22 19.78l1.42-1.42" {...s} />
      <path d="M18.36 5.64l1.42-1.42" {...s} />
    </svg>
  );
}

export function SearchIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="11" cy="11" r="7" {...s} />
      <line x1="16.5" y1="16.5" x2="21" y2="21" {...s} />
    </svg>
  );
}

export function AddIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" {...s} />
      <line x1="12" y1="8" x2="12" y2="16" {...s} />
      <line x1="8" y1="12" x2="16" y2="12" {...s} />
    </svg>
  );
}

export function EditIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...s} />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...s} />
    </svg>
  );
}

export function DeleteIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 6h18" {...s} />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" {...s} />
      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" {...s} />
      <line x1="10" y1="11" x2="10" y2="17" {...s} />
      <line x1="14" y1="11" x2="14" y2="17" {...s} />
    </svg>
  );
}

export function SaveIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" {...s} />
      <polyline points="17,21 17,13 7,13 7,21" {...s} />
      <polyline points="7,3 7,8 15,8" {...s} />
    </svg>
  );
}

export function BackIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="20" y1="12" x2="4" y2="12" {...s} />
      <polyline points="10,6 4,12 10,18" {...s} />
    </svg>
  );
}

export function MoreIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="1.5" {...s} />
      <circle cx="19" cy="12" r="1.5" {...s} />
      <circle cx="5" cy="12" r="1.5" {...s} />
    </svg>
  );
}

export function WarningIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2L2 21h20L12 2z" {...s} />
      <line x1="12" y1="9" x2="12" y2="14" {...s} />
      <circle cx="12" cy="18" r="1" {...s} />
    </svg>
  );
}

export function MoonIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" {...s} />
    </svg>
  );
}

export function ClipboardIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 3v4a1 1 0 001 1h4" {...s} />
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" {...s} />
      <line x1="9" y1="13" x2="15" y2="13" {...s} />
      <line x1="9" y1="17" x2="13" y2="17" {...s} />
    </svg>
  );
}

export function MemoIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5z" {...s} />
      <path d="M16 3v5h5" {...s} />
      <line x1="8" y1="12" x2="16" y2="12" {...s} />
      <line x1="8" y1="16" x2="14" y2="16" {...s} />
    </svg>
  );
}

export function CheckSquareIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" {...s} />
      <polyline points="9,12 11,14 15,10" {...s} />
    </svg>
  );
}

export function PriorityDot({ color, ...props }) {
  const s = useStroke(color);
  return <circle cx="6" cy="6" r="3" {...s} />;
}

export function MenuIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="4" y1="6" x2="20" y2="6" {...s} />
      <line x1="4" y1="12" x2="20" y2="12" {...s} />
      <line x1="4" y1="18" x2="20" y2="18" {...s} />
    </svg>
  );
}

export function CloseIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="6" y1="6" x2="18" y2="18" {...s} />
      <line x1="18" y1="6" x2="6" y2="18" {...s} />
    </svg>
  );
}

export function PlusIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" {...s} />
      <line x1="5" y1="12" x2="19" y2="12" {...s} />
    </svg>
  );
}

export function CheckIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <polyline points="4,13 9,18 20,7" {...s} />
    </svg>
  );
}
