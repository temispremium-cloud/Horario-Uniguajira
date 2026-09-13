import React, { useState } from 'react';
import { ModularCourse } from '../types';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Sparkles, DownloadCloud } from 'lucide-react';

interface ModularCalendarViewProps {
  courses: ModularCourse[];
  onSelectCourse: (course: ModularCourse) => void;
  onExportICS?: () => void;
}

export const ModularCalendarView: React.FC<ModularCalendarViewProps> = ({
  courses,
  onSelectCourse,
  onExportICS
}) => {
  const [selectedMonth, setSelectedMonth] = useState<'all' | '09' | '10' | '11'>('all');

  // Build list of all session days
  // map: date -> Array<{ course: ModularCourse }>
  const sessionsByDate: { [dateStr: string]: ModularCourse[] } = {};
  courses.forEach(course => {
    course.exactDates.forEach(dateStr => {
      if (!sessionsByDate[dateStr]) {
        sessionsByDate[dateStr] = [];
      }
      sessionsByDate[dateStr].push(course);
    });
  });

  // Sort dates
  const allDates = Object.keys(sessionsByDate).sort();

  // Filter dates by month if selected
  const filteredDates = selectedMonth === 'all'
    ? allDates
    : allDates.filter(d => d.startsWith(`2026-${selectedMonth}`));

  const todayIso = new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayName = dateObj.toLocaleDateString('es-CO', { weekday: 'long' });
    const monthName = dateObj.toLocaleDateString('es-CO', { month: 'long' });
    return {
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      dayNumber: day,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      year
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-16">
      {/* Top Banner and Month Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#b7191f]" />
            Cronograma de Sesiones Presenciales
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clases programadas en viernes y sábados del semestre 2026-II
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-stretch md:self-auto overflow-x-auto">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedMonth === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Todo ({allDates.length} días)
            </button>
            <button
              onClick={() => setSelectedMonth('09')}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedMonth === '09'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Septiembre
            </button>
            <button
              onClick={() => setSelectedMonth('10')}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedMonth === '10'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Octubre
            </button>
            <button
              onClick={() => setSelectedMonth('11')}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedMonth === '11'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Noviembre
            </button>
          </div>

          {onExportICS && (
            <button
              onClick={onExportICS}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar archivo .ics para agregar todas las clases a Google Calendar o iPhone"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-[#b7191f]" />
              <span>Sincronizar (.ics)</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredDates.map(dateStr => {
          const { dayName, dayNumber, monthName } = formatDisplayDate(dateStr);
          const isToday = dateStr === todayIso;
          const dayCourses = sessionsByDate[dateStr] || [];

          // Sort dayCourses by start time
          dayCourses.sort((a, b) => a.startTime24.localeCompare(b.startTime24));

          return (
            <div
              key={dateStr}
              className={`bg-white rounded-xl border transition-all flex flex-col overflow-hidden shadow-2xs ${
                isToday
                  ? 'border-[#b7191f] ring-1 ring-[#b7191f]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header with Date - Sober Clean Gray */}
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center leading-none ${
                      isToday
                        ? 'bg-[#b7191f] text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    <span className="text-[9.5px] uppercase font-medium tracking-tight">
                      {dayName.slice(0, 3)}
                    </span>
                    <span className="text-sm font-bold mt-0.5">{dayNumber}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {dayName} {dayNumber} de {monthName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal">
                      {dayCourses.length} Asignatura{dayCourses.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {isToday && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-50 text-[#b7191f] border border-red-200 px-2 py-0.5 rounded">
                    Hoy
                  </span>
                )}
              </div>

              {/* Sessions list inside date */}
              <div className="p-3 space-y-2 flex-1">
                {dayCourses.map(course => (
                  <div
                    key={course.id}
                    onClick={() => onSelectCourse(course)}
                    className="p-2.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 transition-colors cursor-pointer group bg-white"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {course.timeRange}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">
                        {course.classroom || 'Aula s/a'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#b7191f] transition-colors leading-snug">
                      {course.name}
                    </h4>

                    <div className="mt-1 text-[11px] text-slate-600 font-normal flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{course.professor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
