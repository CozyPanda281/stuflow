function useStroke(color) {
  return { stroke: color || 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
}
function useFill(fill) {
  return { fill };
}

export function DashboardIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 10.5L12 3l9 7.5" {...s} />
      <path d="M5 10v9a1 1 0 001 1h4a1 1 0 001-1v-5a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 001 1h3a1 1 0 001-1v-8" {...s} />
      <path d="M9 21V15h6v6" {...s} fill="none" opacity="0.3" />
    </svg>
  );
}

export function TimetableIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" {...s} />
      <path d="M3 9h18" {...s} />
      <path d="M8 2v4" {...s} />
      <path d="M16 2v4" {...s} />
      <path d="M8 13h2" {...s} />
      <path d="M14 13h4" {...s} />
      <path d="M8 17h2" {...s} />
      <path d="M14 17h4" {...s} />
      <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TodayIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" {...s} />
      <path d="M8 2v4" {...s} />
      <path d="M16 2v4" {...s} />
      <path d="M3 10h18" {...s} />
      <circle cx="16" cy="16" r="3.5" {...s} />
      <path d="M14.2 16l1.3 1.3 2.5-2.5" {...s} />
    </svg>
  );
}

export function AttendanceIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 3v4a1 1 0 001 1h4" {...s} />
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" {...s} />
      <path d="M9 13l2 2 4-4" {...s} />
      <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none" opacity="0.15" />
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
      <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

export function TasksIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" {...s} />
      <path d="M9 12l2 2 4-4" {...s} />
      <path d="M9 17h6" {...s} />
      <path d="M15 9h-6" {...s} opacity="0.3" />
    </svg>
  );
}

export function LeaveIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" {...s} />
      <path d="M8 2v4" {...s} />
      <path d="M16 2v4" {...s} />
      <path d="M3 10h18" {...s} />
      <path d="M10 14l4 4" {...s} />
      <path d="M14 14l-4 4" {...s} />
    </svg>
  );
}

export function NotificationsIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...s} />
      <path d="M13.73 21a2 2 0 01-3.46 0" {...s} />
      <circle cx="18" cy="5" r="2.5" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  );
}

export function CalendarIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" {...s} />
      <path d="M8 1v4" {...s} />
      <path d="M16 1v4" {...s} />
      <path d="M3 9h18" {...s} />
      <path d="M11 13.5l1.5 1.5 3-3" {...s} />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

export function NotesIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" {...s} />
      <path d="M14 2v6h6" {...s} />
      <path d="M8 13h8" {...s} />
      <path d="M8 17h6" {...s} />
      <path d="M8 9h2" {...s} opacity="0.3" />
    </svg>
  );
}

export function AnalyticsIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="4" y="14" width="4" height="6" rx="1" {...s} />
      <rect x="10" y="10" width="4" height="10" rx="1" {...s} />
      <rect x="16" y="6" width="4" height="14" rx="1" {...s} />
      <circle cx="18" cy="8" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

export function SettingsIcon({ color, ...props }) {
  const s = useStroke(color);
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
      <circle cx="12" cy="12" r="7" fill="currentColor" stroke="none" opacity="0.06" />
    </svg>
  );
}

export function SearchIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="11" cy="11" r="7" {...s} />
      <path d="M16.5 16.5L21 21" {...s} />
      <circle cx="11" cy="11" r="3" fill="currentColor" stroke="none" opacity="0.1" />
    </svg>
  );
}

export function AddIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="9" {...s} />
      <path d="M12 8v8" {...s} />
      <path d="M8 12h8" {...s} />
      <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" opacity="0.08" />
    </svg>
  );
}

export function EditIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...s} />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...s} />
      <circle cx="20" cy="4" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
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
      <path d="M10 10v6" {...s} />
      <path d="M14 10v6" {...s} />
      <path d="M6 6h12" {...s} opacity="0.2" strokeWidth="4" fill="none" />
    </svg>
  );
}

export function SaveIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" {...s} />
      <path d="M17 21v-8H7v8" {...s} />
      <path d="M7 3v5h8V3" {...s} />
      <rect x="9" y="14" width="6" height="7" fill="currentColor" stroke="none" opacity="0.08" />
    </svg>
  );
}

export function BackIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M20 12H4" {...s} />
      <path d="M10 6l-6 6 6 6" {...s} />
    </svg>
  );
}

export function MoreIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="5" r="1.5" {...s} />
      <circle cx="12" cy="12" r="1.5" {...s} />
      <circle cx="12" cy="19" r="1.5" {...s} />
      <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" opacity="0.06" />
    </svg>
  );
}

export function WarningIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2L2 21h20L12 2z" {...s} />
      <path d="M12 9v5" {...s} />
      <circle cx="12" cy="18" r="1" {...s} />
      <path d="M12 6v0" {...s} opacity="0.3" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" {...s} />
      <circle cx="17" cy="8" r="1.5" fill="currentColor" stroke="none" opacity="0.2" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" opacity="0.15" />
    </svg>
  );
}

export function ClipboardIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M14 3v4a1 1 0 001 1h4" {...s} />
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" {...s} />
      <path d="M9 13h6" {...s} />
      <path d="M9 17h4" {...s} />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none" opacity="0.15" />
    </svg>
  );
}

export function MemoIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5z" {...s} />
      <path d="M16 3v5h5" {...s} />
      <path d="M8 12h8" {...s} />
      <path d="M8 16h6" {...s} />
      <circle cx="10" cy="9" r="1" fill="currentColor" stroke="none" opacity="0.2" />
    </svg>
  );
}

export function CheckSquareIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" {...s} />
      <path d="M9 13l2 2 4-4" {...s} />
      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" stroke="none" opacity="0.04" />
    </svg>
  );
}

export function PriorityDot({ color, ...props }) {
  const s = useStroke(color);
  return <circle cx="6" cy="6" r="3" fill="currentColor" stroke="none" {...s} />;
}

export function MenuIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M4 6h16" {...s} />
      <path d="M4 12h16" {...s} />
      <path d="M4 18h16" {...s} />
      <circle cx="12" cy="12" r="8" fill="currentColor" stroke="none" opacity="0.04" />
    </svg>
  );
}

export function CloseIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M6 6l12 12" {...s} />
      <path d="M18 6l-12 12" {...s} />
    </svg>
  );
}

export function PlusIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 5v14" {...s} />
      <path d="M5 12h14" {...s} />
    </svg>
  );
}

export function CheckIcon({ color, ...props }) {
  const s = useStroke(color);
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M4 13l5 5L20 7" {...s} />
      <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" opacity="0.05" />
    </svg>
  );
}
