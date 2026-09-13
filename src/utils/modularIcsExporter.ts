import { ModularCourse } from '../types';
import { saveFileToDevice } from './androidBridge';

export function generateModularICS(courses: ModularCourse[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniGuajira//Horario Licenciatura C1//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Horario UniGuajira - Licenciatura C1',
    'X-WR-TIMEZONE:America/Bogota'
  ];

  courses.forEach((course) => {
    course.exactDates.forEach((dateStr) => {
      // dateStr is 'YYYY-MM-DD'
      const [year, month, day] = dateStr.split('-');
      const [startHour, startMin] = course.startTime24.split(':');
      const [endHour, endMin] = course.endTime24.split(':');

      const dtStart = `${year}${month}${day}T${startHour.padStart(2, '0')}${startMin.padStart(2, '0')}00`;
      const dtEnd = `${year}${month}${day}T${endHour.padStart(2, '0')}${endMin.padStart(2, '0')}00`;
      const uid = `${course.id}-${dateStr}@uniguajira.edu.co`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      lines.push(`DTSTART;TZID=America/Bogota:${dtStart}`);
      lines.push(`DTEND;TZID=America/Bogota:${dtEnd}`);
      lines.push(`SUMMARY:${course.name} (Grupo ${course.group})`);
      lines.push(`DESCRIPTION:Docente: ${course.professor}\\nHorario: ${course.timeRange}\\nFechas: ${course.datesDescription}\\nAula: ${course.classroom || 'Por asignar'}`);
      lines.push(`LOCATION:Universidad de La Guajira - ${course.classroom || 'Campus Riohacha'}`);
      lines.push('STATUS:CONFIRMED');
      // Native phone calendar alarms (Push notifications)
      // 1 hour before class
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT60M');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:🔔 En 1 hora: ${course.name} en ${course.classroom || 'UniGuajira'}`);
      lines.push('END:VALARM');
      // 15 minutes before class
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT15M');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:🚨 En 15 min inicia clase: ${course.name} (${course.timeRange})`);
      lines.push('END:VALARM');
      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export async function downloadModularICSFile(content: string, filename = 'horario_uniguajira_licenciatura_c1.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  await saveFileToDevice(blob, filename, 'text/calendar', 'Calendario de Clases UniGuajira');
}
