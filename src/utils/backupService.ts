import { ModularCourse, TaskItem, NotificationSettings } from '../types';
import { saveFileToDevice } from './androidBridge';

export interface BackupPayload {
  version: 2;
  exportedAt: string;
  institution: 'Universidad de La Guajira';
  program: 'Licenciatura en Educación Básica Primaria';
  group: 'C1';
  courses: ModularCourse[];
  tasks: TaskItem[];
  settings: NotificationSettings;
}

/**
 * Generates and downloads a complete JSON backup of the user's schedule, notes, tasks and settings.
 */
export async function exportBackupFile(
  courses: ModularCourse[],
  tasks: TaskItem[],
  settings: NotificationSettings
): Promise<void> {
  const payload: BackupPayload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    institution: 'Universidad de La Guajira',
    program: 'Licenciatura en Educación Básica Primaria',
    group: 'C1',
    courses,
    tasks,
    settings
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const dateSuffix = new Date().toISOString().split('T')[0];
  const filename = `Respaldo_Horario_UniGuajira_C1_${dateSuffix}.json`;

  await saveFileToDevice(blob, filename, 'application/json', 'Copia de Seguridad Horario UniGuajira C1');
}

/**
 * Validates and parses an imported backup JSON file.
 */
export function parseBackupFile(jsonString: string): {
  courses: ModularCourse[];
  tasks: TaskItem[];
  settings?: NotificationSettings;
} {
  const data = JSON.parse(jsonString);

  if (!data || typeof data !== 'object') {
    throw new Error('El archivo no contiene un formato de datos válido.');
  }

  if (!Array.isArray(data.courses) || data.courses.length === 0) {
    throw new Error('El respaldo no contiene una lista de asignaturas válida.');
  }

  // Sanitize courses
  const courses: ModularCourse[] = data.courses.map((c: any) => ({
    id: String(c.id || `mod-${Date.now()}`),
    codeNumber: String(c.codeNumber || '000000'),
    credits: Number(c.credits) || 2,
    hs: Number(c.hs) || 2,
    name: String(c.name || 'ASIGNATURA'),
    shortName: String(c.shortName || c.name || 'Asignatura'),
    professor: String(c.professor || 'Docente'),
    timeRange: String(c.timeRange || ''),
    startTime24: String(c.startTime24 || '07:00'),
    endTime24: String(c.endTime24 || '09:15'),
    day: c.day === 'Sabado' ? 'Sabado' : 'Viernes',
    datesDescription: String(c.datesDescription || ''),
    exactDates: Array.isArray(c.exactDates) ? c.exactDates : [],
    group: 'C1',
    moduleName: c.moduleName || 'Septiembre - Octubre',
    color: c.color || '#fee2e2',
    classroom: c.classroom || '',
    notes: c.notes || ''
  }));

  // Sanitize tasks
  const tasks: TaskItem[] = Array.isArray(data.tasks)
    ? data.tasks.map((t: any) => ({
        id: String(t.id || `mod-tsk-${Date.now()}`),
        courseId: String(t.courseId || courses[0]?.id || ''),
        title: String(t.title || 'Compromiso'),
        dueDate: String(t.dueDate || 'Por definir'),
        completed: Boolean(t.completed),
        type: t.type || 'Otro',
        customType: t.customType,
        notes: t.notes || '',
        grade: typeof t.grade === 'number' ? t.grade : undefined,
        percentage: typeof t.percentage === 'number' ? t.percentage : undefined,
        reminderEnabled: t.reminderEnabled !== undefined ? Boolean(t.reminderEnabled) : true
      }))
    : [];

  return {
    courses,
    tasks,
    settings: data.settings
  };
}

/**
 * Formats a clean WhatsApp-ready message for a course or session.
 */
export function formatCourseShareText(course: ModularCourse, specificDate?: string): string {
  const parts = [
    `📚 *CLASE GRUPO C1 - UNIGUAJIRA*`,
    `📖 *Asignatura:* ${course.name}`,
    `👩‍🏫 *Docente:* ${course.professor}`,
    `⏰ *Horario:* ${course.day} • ${course.timeRange}`,
    `📍 *Aula / Campus:* ${course.classroom || 'Por asignar'}`,
    `📅 *Fechas del Módulo:* ${course.datesDescription}`,
    course.notes ? `📝 *Apuntes:* ${course.notes}` : '',
    `🏛️ *Universidad de La Guajira • Uribia*`
  ];

  return parts.filter(Boolean).join('\n');
}

/**
 * Triggers native share (WhatsApp, Telegram, etc.) or copies to clipboard.
 */
export async function shareCourseDetails(course: ModularCourse, specificDate?: string): Promise<'shared' | 'copied' | 'failed'> {
  const text = formatCourseShareText(course, specificDate);
  const title = `Clase: ${course.name} - UniGuajira C1`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text
      });
      return 'shared';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'shared'; // User closed share dialog, not an error
      }
    }
  }

  // Fallback: Copy to clipboard
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    // Fallback document.execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return 'copied';
  }

  return 'failed';
}
