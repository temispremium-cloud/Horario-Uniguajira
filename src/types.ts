export type DayOfWeek = 'Viernes' | 'Sabado';

export type MobileTab = 'today' | 'courses' | 'calendar' | 'tasks' | 'official-sheet';

export type ModuleCategory = 'all' | 'Septiembre - Octubre' | 'Octubre' | 'Noviembre';

export interface ModularCourse {
  id: string;
  codeNumber: string;    // e.g. "199226"
  credits: number;       // 2
  hs: number;            // 2 (Horas Semanales)
  name: string;          // "RECURSOS DIDÁCTICOS PARA EL APRENDIZAJE"
  shortName: string;
  professor: string;     // "MAIRENE GONZALEZ GOMEZ"
  timeRange: string;     // "2:45 PM A 5:00 PM"
  startTime24: string;   // "14:45"
  endTime24: string;     // "17:00"
  day: 'Viernes' | 'Sabado';
  datesDescription: string; // "11, 18, 25 de septiembre y 2 de octubre"
  exactDates: string[];  // ISO YYYY-MM-DD: ["2026-09-11", "2026-09-18", "2026-09-25", "2026-10-02"]
  group: string;         // "D1"
  moduleName: 'Septiembre - Octubre' | 'Octubre' | 'Noviembre';
  color: string;
  classroom?: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  type: 'Parcial' | 'Tarea' | 'Exposición' | 'Laboratorio' | 'Quiz' | 'Taller' | 'Proyecto' | 'Otro';
  customType?: string;      // Nombre cuando type === 'Otro' (ej: 'Ensayo pedagógico')
  notes?: string;           // Apuntes, temas a estudiar, instrucciones de entrega
  grade?: number;           // Calificación obtenida (0.0 a 5.0 en escala UniGuajira)
  percentage?: number;      // Ponderación o porcentaje del corte (ej. 20%)
  reminderEnabled?: boolean;// Alerta activa en el dispositivo móvil
}

export interface NotificationSettings {
  enabled: boolean;
  leadTimeMinutes: number; // e.g. 60 (1 hora antes), 30, 15, 120
  nightBeforeAlert: boolean; // Alerta a las 8:00 PM la noche anterior
  taskAlerts: boolean; // Alertas para fechas límite de tareas y parciales
  soundEnabled: boolean; // Sonido de aviso
  vibrationEnabled: boolean; // Vibración háptica en móvil
  lastNotifiedId?: string; // Para evitar repetición
}

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  courseId?: string;
  timestamp: number;
}



