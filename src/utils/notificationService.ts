import { ModularCourse, NotificationSettings, InAppNotification, TaskItem } from '../types';
import { getLocalDateIso } from './scheduleStatus';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  leadTimeMinutes: 60, // 1 hora antes por defecto
  nightBeforeAlert: true,
  taskAlerts: true,
  soundEnabled: true,
  vibrationEnabled: true
};

export const NOTIFICATION_STORAGE_KEY = 'uniguajira_notification_settings_v1';
export const NOTIFIED_HISTORY_KEY = 'uniguajira_notified_history_v1';
export const PERMISSION_ASKED_KEY = 'uniguajira_permission_asked_once_v1';

// Check if notification permission has already been requested once on this mobile device
export function hasPermissionBeenAsked(): boolean {
  try {
    return localStorage.getItem(PERMISSION_ASKED_KEY) === 'true';
  } catch {
    return false;
  }
}

// Mark that notification permission has been requested once
export function markPermissionAsked(): void {
  try {
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Request permission from browser / mobile OS (only once unless force is true)
export async function requestNotificationPermission(force: boolean = false): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    markPermissionAsked();
    return 'denied';
  }

  // If already asked once and not explicitly forced, return current permission without re-prompting
  if (!force && hasPermissionBeenAsked()) {
    return Notification.permission;
  }

  try {
    markPermissionAsked();
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('Permiso de notificación no disponible o restringido por el entorno:', error);
    return Notification.permission || 'denied';
  }
}

// Play pleasant chime tone using Web Audio API
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First bell tone (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second bell tone (A5 - 880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.15);
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (e) {
    // Audio may be blocked by autoplay policies until user interaction
  }
}

// Trigger mobile haptic vibration
export function triggerVibration(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 200]);
    } catch {
      // Ignore vibration errors
    }
  }
}

// Dispatch native system push / browser notification
export async function dispatchNativeNotification(
  title: string,
  options: {
    body: string;
    courseId?: string;
    tag?: string;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
  }
): Promise<boolean> {
  const { body, courseId, tag, soundEnabled = true, vibrationEnabled = true } = options;

  // Sound and vibration feedback
  if (soundEnabled) {
    playNotificationChime();
  }
  if (vibrationEnabled) {
    triggerVibration();
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Try via ServiceWorker registration first (required on mobile Chrome and iOS PWA)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, {
          body,
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          tag: tag || 'uniguajira-class',
          data: { courseId, timestamp: Date.now() }
        });
        return true;
      }
    } catch (err) {
      console.warn('Fallo al enviar notificación vía Service Worker, usando fallback:', err);
    }
  }

  // Fallback to standard desktop/browser Notification constructor
  try {
    const notif = new Notification(title, {
      body,
      icon: '/icon-192.svg',
      tag: tag || 'uniguajira-class'
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('No se pudo mostrar la notificación nativa:', err);
    return false;
  }
}

// Get history of sent notification keys to avoid repeated alerts
function getNotifiedHistory(): Set<string> {
  try {
    const saved = localStorage.getItem(NOTIFIED_HISTORY_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function saveNotifiedHistory(history: Set<string>): void {
  try {
    // Keep max 100 items
    const arr = Array.from(history).slice(-100);
    localStorage.setItem(NOTIFIED_HISTORY_KEY, JSON.stringify(arr));
  } catch {
    // Ignore storage errors
  }
}

// Check schedule and fire notifications
export function evaluateUpcomingClasses(
  courses: ModularCourse[],
  settings: NotificationSettings,
  onInAppAlert?: (notification: InAppNotification) => void
): void {
  if (!settings.enabled) return;

  const now = new Date();
  const todayIso = getLocalDateIso(now); // Local device 'YYYY-MM-DD'
  const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();

  const history = getNotifiedHistory();

  courses.forEach((course) => {
    // Check if course has a session today
    if (course.exactDates.includes(todayIso)) {
      const [startHour, startMinute] = course.startTime24.split(':').map(Number);
      const classStartMinutes = startHour * 60 + startMinute;
      const minutesUntilClass = classStartMinutes - currentMinutesOfDay;

      // Window check: triggers when time remaining is between leadTimeMinutes - 5 and leadTimeMinutes
      // e.g. for 60 min lead: triggers between 55 and 62 minutes before
      if (minutesUntilClass > 0 && minutesUntilClass <= settings.leadTimeMinutes && minutesUntilClass >= settings.leadTimeMinutes - 7) {
        const notifyKey = `${course.id}-${todayIso}-${settings.leadTimeMinutes}min`;

        if (!history.has(notifyKey)) {
          history.add(notifyKey);
          saveNotifiedHistory(history);

          const title = `🔔 En ${minutesUntilClass} min: ${course.name}`;
          const body = `Aula: ${course.classroom || 'Por asignar'} • Docente: ${course.professor} • Horario: ${course.timeRange}`;

          dispatchNativeNotification(title, {
            body,
            courseId: course.id,
            tag: `class-${course.id}`,
            soundEnabled: settings.soundEnabled,
            vibrationEnabled: settings.vibrationEnabled
          });

          if (onInAppAlert) {
            onInAppAlert({
              id: notifyKey,
              title,
              body,
              courseId: course.id,
              timestamp: Date.now()
            });
          }
        }
      }
    }
  });
}

// Send immediate test notification
export function triggerTestNotification(
  settings: NotificationSettings,
  sampleCourse: ModularCourse,
  onInAppAlert?: (notification: InAppNotification) => void
): void {
  const leadLabel = settings.leadTimeMinutes >= 60 
    ? `${Math.round(settings.leadTimeMinutes / 60)} hora` 
    : `${settings.leadTimeMinutes} minutos`;

  const title = `🔔 Prueba de Notificación (${leadLabel} antes)`;
  const body = `Clase de ${sampleCourse.shortName} • Docente: ${sampleCourse.professor} • Aula: ${sampleCourse.classroom || 'Aula 101'} • ${sampleCourse.timeRange}`;

  dispatchNativeNotification(title, {
    body,
    courseId: sampleCourse.id,
    tag: `test-${Date.now()}`,
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled
  });

  if (onInAppAlert) {
    onInAppAlert({
      id: `test-${Date.now()}`,
      title,
      body,
      courseId: sampleCourse.id,
      timestamp: Date.now()
    });
  }
}

// Evaluate upcoming tasks and partials to notify the student
export function evaluateUpcomingTasks(
  tasks: TaskItem[],
  courses: ModularCourse[],
  settings: NotificationSettings,
  onInAppAlert?: (notification: InAppNotification) => void
): void {
  if (!settings.enabled || !settings.taskAlerts) return;

  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().split('T')[0];

  const history = getNotifiedHistory();
  const courseMap = new Map<string, ModularCourse>();
  courses.forEach(c => courseMap.set(c.id, c));

  tasks.forEach(task => {
    // Only alert for uncompleted tasks with reminders enabled
    if (task.completed || task.reminderEnabled === false) return;
    if (!task.dueDate || task.dueDate === 'Por definir') return;

    const isToday = task.dueDate === todayIso;
    const isTomorrow = task.dueDate === tomorrowIso;

    if (!isToday && !isTomorrow) return;

    const alertType = isToday ? 'hoy' : 'manana';
    const notifyKey = `task-${task.id}-${todayIso}-${alertType}`;

    if (history.has(notifyKey)) return;

    history.add(notifyKey);
    saveNotifiedHistory(history);

    const course = courseMap.get(task.courseId);
    const courseLabel = course ? course.shortName : 'UniGuajira';
    const typeLabel = task.type === 'Otro' && task.customType ? task.customType : task.type;

    const title = isToday
      ? `⏰ ¡${typeLabel} para HOY!: ${task.title}`
      : `📅 Recordatorio para MAÑANA: ${task.title}`;

    const body = `Materia: ${courseLabel}${task.notes ? ` • ${task.notes.slice(0, 70)}...` : ''}`;

    dispatchNativeNotification(title, {
      body,
      courseId: task.courseId,
      tag: `task-${task.id}`,
      soundEnabled: settings.soundEnabled,
      vibrationEnabled: settings.vibrationEnabled
    });

    if (onInAppAlert) {
      onInAppAlert({
        id: notifyKey,
        title,
        body,
        courseId: task.courseId,
        timestamp: Date.now()
      });
    }
  });
}
