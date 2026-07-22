import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MasterTimetable from './pages/MasterTimetable';
import TodaySchedule from './pages/TodaySchedule';
import LiveDayEditor from './pages/LiveDayEditor';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Leave from './pages/Leave';
import More from './pages/More';
import { getActiveLeave } from './db/database';
import { startNotificationService, stopNotificationService } from './utils/notifications';

export const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

export const APP_VERSION = '1.0.1';

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [activeLeave, setActiveLeave] = useState(null);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    getActiveLeave().then(setActiveLeave);
    startNotificationService();
    return () => stopNotificationService();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, activeLeave, setActiveLeave }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="timetable" element={<MasterTimetable />} />
          <Route path="today" element={<TodaySchedule />} />
          <Route path="today/edit" element={<LiveDayEditor />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="notes" element={<Notes />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="leave" element={<Leave />} />
          <Route path="more" element={<More />} />
        </Route>
      </Routes>
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}
