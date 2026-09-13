import { ModularCourse } from '../types';

/**
 * Returns YYYY-MM-DD using the device's local timezone (not UTC).
 */
export function getLocalDateIso(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a duration in minutes into a human-readable Spanish string.
 * e.g. 7 -> '7 min', 65 -> '1h 5m', 120 -> '2h'
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 min';
  if (minutes < 1) return 'Menos de 1 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Formats seconds into a digital countdown display (e.g. "01:45:22" or "25:10").
 */
export function formatCountdownClock(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Formats seconds into human-readable Spanish countdown string.
 * e.g. "1h 45m 20s" or "24m 12s" or "45s".
 */
export function formatCountdownHuman(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0 seg';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

/**
 * Formats device time to 12-hour format with AM/PM (e.g. "2:53 PM").
 */
export function formatDeviceTimeShort(d: Date = new Date()): string {
  return d.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formats device time with seconds (e.g. "2:53:15 PM").
 */
export function formatDeviceTimeWithSeconds(d: Date = new Date()): string {
  return d.toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

/**
 * Formats full Spanish date (e.g. "Sábado, 12 de septiembre de 2026").
 */
export function formatDeviceDateFull(d: Date = new Date()): string {
  const formatted = d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export type ClassSessionState = 'current' | 'upcoming_today' | 'completed_today' | 'future_date';

export interface CourseSessionStatus {
  state: ClassSessionState;
  course: ModularCourse;
  date: string;
  dateFormatted: string;
  secondsRemaining?: number;
  secondsElapsed?: number;
  totalDurationSeconds?: number;
  minutesRemaining?: number;
  minutesElapsed?: number;
  totalDurationMinutes?: number;
  progressPercent?: number; // 0 to 100
  timeUntilStartMinutes?: number;
  timeUntilStartSeconds?: number;
}

/**
 * Analyzes the status of all courses relative to the current device date and time.
 */
export function analyzeCurrentSchedule(
  courses: ModularCourse[],
  currentTime: Date = new Date()
): {
  activeClass: CourseSessionStatus | null;
  upcomingToday: CourseSessionStatus | null;
  nextScheduledSession: CourseSessionStatus | null;
  todayCompletedCount: number;
  isClassDay: boolean;
  currentDayName: string;
  targetCoursesToday: ModularCourse[];
} {
  const todayIso = getLocalDateIso(currentTime);
  const currentSeconds = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const dayOfWeek = currentTime.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
  const isFriday = dayOfWeek === 5;
  const isSaturday = dayOfWeek === 6;
  const isClassDay = isFriday || isSaturday;
  const currentDayName = isFriday ? 'Viernes' : isSaturday ? 'Sabado' : '';

  // 1. Identify which courses belong to TODAY.
  // First check if any course has an EXACT date match for today.
  const exactMatchingCourses = courses.filter(c => c.exactDates.includes(todayIso));

  let targetCoursesToday: ModularCourse[] = [];
  if (exactMatchingCourses.length > 0) {
    targetCoursesToday = exactMatchingCourses;
  } else if (isClassDay) {
    // If exact date doesn't match, but today is Friday or Saturday,
    // match the courses of the active module for today
    const month = currentTime.getMonth(); // 8 = Sep, 9 = Oct, 10 = Nov
    const modulePref = month === 10 ? 'Noviembre' : (month === 9 && currentTime.getDate() > 5) ? 'Octubre' : 'Septiembre - Octubre';
    const dayModuleCourses = courses.filter(c => c.day === currentDayName && c.moduleName === modulePref);
    targetCoursesToday = dayModuleCourses.length > 0 ? dayModuleCourses : courses.filter(c => c.day === currentDayName);
  }

  const todaySessions: CourseSessionStatus[] = [];
  let todayCompletedCount = 0;

  targetCoursesToday.forEach(course => {
    const [sH, sM] = course.startTime24.split(':').map(Number);
    const [eH, eM] = course.endTime24.split(':').map(Number);
    const startSec = sH * 3600 + sM * 60;
    const endSec = eH * 3600 + eM * 60;
    const totalDurationSec = endSec - startSec;

    const [startMin, endMin] = [sH * 60 + sM, eH * 60 + eM];
    const totalDurationMinutes = endMin - startMin;

    const dateObj = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
    const rawDateFormatted = dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const dateFormatted = rawDateFormatted.charAt(0).toUpperCase() + rawDateFormatted.slice(1);

    if (currentSeconds >= startSec && currentSeconds < endSec) {
      // Class is currently IN PROGRESS -> CLASE ACTUAL
      const secondsElapsed = currentSeconds - startSec;
      const secondsRemaining = endSec - currentSeconds;
      const progressPercent = Math.min(100, Math.max(0, Math.round((secondsElapsed / totalDurationSec) * 100)));

      todaySessions.push({
        state: 'current',
        course,
        date: todayIso,
        dateFormatted,
        secondsRemaining,
        secondsElapsed,
        totalDurationSeconds: totalDurationSec,
        minutesRemaining: Math.ceil(secondsRemaining / 60),
        minutesElapsed: Math.floor(secondsElapsed / 60),
        totalDurationMinutes,
        progressPercent
      });
    } else if (currentSeconds < startSec) {
      // Class is UPCOMING TODAY -> PRÓXIMA CLASE HOY
      const timeUntilStartSec = startSec - currentSeconds;
      todaySessions.push({
        state: 'upcoming_today',
        course,
        date: todayIso,
        dateFormatted,
        timeUntilStartSeconds: timeUntilStartSec,
        timeUntilStartMinutes: Math.ceil(timeUntilStartSec / 60),
        totalDurationMinutes
      });
    } else {
      // Class COMPLETED TODAY
      todayCompletedCount++;
      todaySessions.push({
        state: 'completed_today',
        course,
        date: todayIso,
        dateFormatted,
        totalDurationMinutes
      });
    }
  });

  // Active class is the currently ongoing one
  const activeClass = todaySessions.find(s => s.state === 'current') || null;

  // Upcoming today is the earliest one not yet started
  const upcomingToday = todaySessions
    .filter(s => s.state === 'upcoming_today')
    .sort((a, b) => (a.timeUntilStartSeconds || 0) - (b.timeUntilStartSeconds || 0))[0] || null;

  // 2. Find next scheduled session across the whole semester calendar
  const futureList: { course: ModularCourse; date: string }[] = [];
  courses.forEach(c => {
    c.exactDates.forEach(d => {
      if (d > todayIso) {
        futureList.push({ course: c, date: d });
      } else if (d === todayIso) {
        const [sH, sM] = c.startTime24.split(':').map(Number);
        const startSec = sH * 3600 + sM * 60;
        if (currentSeconds < startSec) {
          futureList.push({ course: c, date: d });
        }
      }
    });
  });

  futureList.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.course.startTime24.localeCompare(b.course.startTime24);
  });

  let nextScheduledSession: CourseSessionStatus | null = null;
  if (futureList.length > 0) {
    const nextItem = futureList[0];
    const [y, m, d] = nextItem.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const rawDateFormatted = dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const dateFormatted = rawDateFormatted.charAt(0).toUpperCase() + rawDateFormatted.slice(1);

    const [sH, sM] = nextItem.course.startTime24.split(':').map(Number);
    const [eH, eM] = nextItem.course.endTime24.split(':').map(Number);
    const startSec = sH * 3600 + sM * 60;
    const endSec = eH * 3600 + eM * 60;

    let timeUntilStartSeconds: number | undefined;
    let timeUntilStartMinutes: number | undefined;
    if (nextItem.date === todayIso) {
      timeUntilStartSeconds = startSec - currentSeconds;
      timeUntilStartMinutes = Math.ceil(timeUntilStartSeconds / 60);
    }

    nextScheduledSession = {
      state: nextItem.date === todayIso ? 'upcoming_today' : 'future_date',
      course: nextItem.course,
      date: nextItem.date,
      dateFormatted,
      timeUntilStartSeconds,
      timeUntilStartMinutes,
      totalDurationMinutes: eH * 60 + eM - (sH * 60 + sM)
    };
  } else if (courses.length > 0) {
    // Semester fallback to first course
    const firstCourse = courses[0];
    const firstDate = firstCourse.exactDates[0] || todayIso;
    const [y, m, d] = firstDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const rawDateFormatted = dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const dateFormatted = rawDateFormatted.charAt(0).toUpperCase() + rawDateFormatted.slice(1);

    nextScheduledSession = {
      state: 'future_date',
      course: firstCourse,
      date: firstDate,
      dateFormatted
    };
  }

  return {
    activeClass,
    upcomingToday,
    nextScheduledSession,
    todayCompletedCount,
    isClassDay,
    currentDayName,
    targetCoursesToday
  };
}

export interface SessionDateItem {
  dateIso: string;          // e.g. "2026-09-12"
  sessionNumber: number;    // 1, 2, 3, 4
  totalSessions: number;    // 4
  dayOfMonth: number;       // 12
  monthNameShort: string;   // "Sep"
  fullLabel: string;        // "12 de sep"
  fullFormatted: string;    // "Sábado, 12 de septiembre"
  isPast: boolean;          // Before today OR is today and class has finished
  isToday: boolean;         // Date is today
  isCurrent: boolean;       // Date is today and class is currently in progress
  isFinishedToday: boolean; // Date is today and class has already ended
  isUpcomingToday: boolean; // Date is today and class has not started yet
  isNextUpcoming: boolean;  // The earliest session not yet completed
}

export interface CourseSessionsAnalysis {
  sessions: SessionDateItem[];
  currentSession: SessionDateItem | null;
  todaySession: SessionDateItem | null;
  nextSession: SessionDateItem | null;
  activeOrNextSession: SessionDateItem | null;
  completedCount: number;
  totalCount: number;
  hasPassedAll: boolean;
  statusHeadline: string;
}

/**
 * Analyzes the scheduled dates for a specific course relative to current time.
 * Calculates which session corresponds to today, which are completed/past (to strike through),
 * and which is the next upcoming session.
 */
export function getCourseSessionsAnalysis(
  course: ModularCourse,
  now: Date = new Date()
): CourseSessionsAnalysis {
  const todayIso = getLocalDateIso(now);
  const curSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const [sH, sM] = course.startTime24.split(':').map(Number);
  const [eH, eM] = course.endTime24.split(':').map(Number);
  const startSec = sH * 3600 + sM * 60;
  const endSec = eH * 3600 + eM * 60;

  const totalCount = course.exactDates.length;
  let nextFound = false;

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const sessions: SessionDateItem[] = course.exactDates.map((dateIso, idx) => {
    const sessionNumber = idx + 1;
    const [y, m, d] = dateIso.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfMonth = d;
    const monthNameShort = monthNames[m - 1] || '';
    const fullLabel = `${d} ${monthNameShort}`;
    const rawFormatted = dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const fullFormatted = rawFormatted.charAt(0).toUpperCase() + rawFormatted.slice(1);

    const isToday = dateIso === todayIso;
    const isPastDate = dateIso < todayIso;

    let isFinishedToday = false;
    let isCurrent = false;
    let isUpcomingToday = false;
    let isPast = isPastDate;

    if (isToday) {
      if (curSeconds >= endSec) {
        isFinishedToday = true;
        isPast = true;
      } else if (curSeconds >= startSec) {
        isCurrent = true;
      } else {
        isUpcomingToday = true;
      }
    }

    let isNextUpcoming = false;
    if (!isPast && !nextFound) {
      isNextUpcoming = true;
      nextFound = true;
    }

    return {
      dateIso,
      sessionNumber,
      totalSessions: totalCount,
      dayOfMonth,
      monthNameShort,
      fullLabel,
      fullFormatted,
      isPast,
      isToday,
      isCurrent,
      isFinishedToday,
      isUpcomingToday,
      isNextUpcoming
    };
  });

  const currentSession = sessions.find(s => s.isCurrent) || null;
  const todaySession = sessions.find(s => s.isToday) || null;
  const nextSession = sessions.find(s => s.isNextUpcoming) || null;
  const activeOrNextSession = currentSession || nextSession;
  const completedCount = sessions.filter(s => s.isPast).length;
  const hasPassedAll = completedCount === totalCount;

  let statusHeadline = '';
  if (currentSession) {
    statusHeadline = `Sesión ${currentSession.sessionNumber} de ${totalCount} (En curso hoy)`;
  } else if (todaySession && todaySession.isFinishedToday) {
    statusHeadline = nextSession
      ? `Sesión ${todaySession.sessionNumber} de ${totalCount} finalizada hoy • Próxima: ${nextSession.fullLabel}`
      : `Última sesión finalizada hoy (${todaySession.sessionNumber} de ${totalCount})`;
  } else if (todaySession && todaySession.isUpcomingToday) {
    statusHeadline = `Hoy corresponde: Sesión ${todaySession.sessionNumber} de ${totalCount} (${todaySession.fullLabel})`;
  } else if (nextSession) {
    statusHeadline = `Próxima: Sesión ${nextSession.sessionNumber} de ${totalCount} (${nextSession.fullLabel})`;
  } else if (hasPassedAll) {
    statusHeadline = `Materia concluida (${totalCount} de ${totalCount} sesiones completadas)`;
  }

  return {
    sessions,
    currentSession,
    todaySession,
    nextSession,
    activeOrNextSession,
    completedCount,
    totalCount,
    hasPassedAll,
    statusHeadline
  };
}
