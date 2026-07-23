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

export async function showNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/badge.png',
      vibrate: [400, 50, 200, 100, 600, 50, 500],
      tag: 'upcoming-class',
      requireInteraction: true,
    });
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
    const nowTime = now.getHours() * 60 + now.getMinutes();

    const upcoming = schedule.actual
      .filter(p => p.subject && p.status !== 'cancelled')
      .map(p => {
        const [h, m] = p.startTime.split(':').map(Number);
        const classMin = h * 60 + m;
        return { ...p, diffMin: classMin - nowTime };
      })
      .filter(p => p.diffMin > 0)
      .sort((a, b) => a.diffMin - b.diffMin)[0];

    lastNotified = {};
    if (upcoming && upcoming.diffMin <= 99999 && !lastNotified[`class_${upcoming.period}`]) {
      const todayFormatted = format(new Date(), 'EEEE, MMM d');
      showNotification(
        `${upcoming.subject} at ${upcoming.startTime}`,
        `${todayFormatted} · Period ${upcoming.period} · ${upcoming.faculty}`
      );
      lastNotified[`class_${upcoming.period}`] = true;
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

export async function startNotificationService() {
  const granted = await requestPermission();
  if (notificationInterval) clearInterval(notificationInterval);
  notificationInterval = setInterval(() => {
    checkUpcomingClasses();
    checkUpcomingTasks();
  }, 30000);
  if (granted) {
    showNotification('Aditya', 'Notifications are working ✓');
  }
  checkUpcomingClasses();
  checkUpcomingTasks();
}

export function stopNotificationService() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}
