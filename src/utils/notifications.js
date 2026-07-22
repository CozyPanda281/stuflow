import { format } from 'date-fns';
import db, { getOrCreateDaySchedule, getActiveLeave } from '../db/database';

let notificationInterval = null;
let lastNotified = {};

export async function requestPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/icon-192.svg' });
  } catch (e) {
  }
}

export async function checkUpcomingClasses() {
  try {
    const leave = await getActiveLeave();
    if (leave) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const schedule = await getOrCreateDaySchedule(today);
    if (!schedule?.actual) return;

    const now = new Date();
    const currentTime = format(now, 'HH:mm');

    for (const period of schedule.actual) {
      if (!period.subject || period.status === 'cancelled') continue;
      if (lastNotified[period.period]) continue;

      const [h, m] = period.startTime.split(':').map(Number);
      const classTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      const diffMs = classTime.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60000);

      if (diffMin > 0 && diffMin <= 5) {
        showNotification(
          `${period.subject} in ${diffMin} min`,
          `${period.faculty} · Room ${period.classroom} · Period ${period.period}`
        );
        lastNotified[period.period] = true;
      }
    }
  } catch (e) {
  }
}

export function startNotificationService() {
  requestPermission();
  if (notificationInterval) clearInterval(notificationInterval);
  notificationInterval = setInterval(checkUpcomingClasses, 30000);
  checkUpcomingClasses();
}

export function stopNotificationService() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}
