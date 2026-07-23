import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import db, { getOrCreateDaySchedule, getActiveLeave } from '../db/database';

let notificationInterval = null;
let lastNotified = {};
let lastTaskNotified = {};

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
    new Notification(title, { body, icon: '/icon-192.png' });
  } catch {}
}

export async function checkUpcomingClasses() {
  try {
    const leave = await getActiveLeave();
    if (leave) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const schedule = await getOrCreateDaySchedule(today);
    if (!schedule?.actual) return;

    const now = new Date();

    for (const period of schedule.actual) {
      if (!period.subject || period.status === 'cancelled') continue;
      if (lastNotified[`class_${period.period}`]) continue;

      const [h, m] = period.startTime.split(':').map(Number);
      const classTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      const diffMs = classTime.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60000);

      lastNotified = {};
      if (diffMin > 0 && diffMin <= 99999) {
        const todayFormatted = format(new Date(), 'EEEE, MMM d');
        showNotification(
          `${period.subject} at ${period.startTime}`,
          `${todayFormatted} · Period ${period.period} · ${period.faculty}`
        );
        lastNotified[`class_${period.period}`] = true;
      }
    }
  } catch {}
}

export async function checkUpcomingTasks() {
  try {
    const leave = await getActiveLeave();
    if (leave) return;

    const tasks = await db.tasks.where('completed').equals(0).toArray();
    const now = new Date();
    const todayStart = startOfDay(now);

    for (const task of tasks) {
      if (lastTaskNotified[task.id]) continue;
      if (!task.dueDate) continue;

      try {
        const dueDate = parseISO(task.dueDate);
        const daysUntilDue = differenceInDays(dueDate, todayStart);

        if (daysUntilDue < 0) {
          showNotification('Overdue: ' + task.title, 'Was due ' + format(dueDate, 'MMM d'));
          lastTaskNotified[task.id] = true;
        } else if (daysUntilDue === 0) {
          showNotification('Due Today: ' + task.title, task.priority ? `Priority: ${task.priority}` : '');
          lastTaskNotified[task.id] = true;
        } else if (daysUntilDue === 1) {
          showNotification('Due Tomorrow: ' + task.title, task.priority ? `Priority: ${task.priority}` : '');
          lastTaskNotified[task.id] = true;
        }
      } catch {}
    }
  } catch {}
}

export function startNotificationService() {
  requestPermission();
  if (notificationInterval) clearInterval(notificationInterval);
  notificationInterval = setInterval(() => {
    checkUpcomingClasses();
    checkUpcomingTasks();
  }, 30000);
  checkUpcomingClasses();
  checkUpcomingTasks();
}

export function stopNotificationService() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}
