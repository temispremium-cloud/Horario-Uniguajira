import React, { useState, useEffect, useMemo } from 'react';
import { ModularCourse, TaskItem } from '../types';
import {
  Sparkles,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  FileText,
  Bell,
  BellRing,
  CheckSquare,
  Radio,
  Timer,
  Play,
  RotateCcw
} from 'lucide-react';
import {
  analyzeCurrentSchedule,
  formatDeviceTimeWithSeconds,
  formatDeviceDateFull,
  formatDuration,
  formatCountdownClock,
  formatCountdownHuman,
  getLocalDateIso
} from '../utils/scheduleStatus';
import { CourseSessionDatesTimeline } from './CourseSessionDatesTimeline';
import { toHumanTitleCase, formatCleanTimeRange } from '../utils/textUtils';

interface MobileTodayViewProps {
  courses: ModularCourse[];
  tasks: TaskItem[];
  onSelectCourse: (course: ModularCourse) => void;
  onGoToOfficialSheet: () => void;
  onGoToCalendar: () => void;
  onGoToTasks?: () => void;
  onOpenNotificationSettings: () => void;
  notificationsEnabled: boolean;
  notificationLeadMinutes: number;
}

export const MobileTodayView: React.FC<MobileTodayViewProps> = ({
  courses,
  tasks,
  onSelectCourse,
  onGoToOfficialSheet,
  onGoToCalendar,
  onGoToTasks,
  onOpenNotificationSettings,
  notificationsEnabled,
  notificationLeadMinutes
}) => {
  // Live ticking device clock (updates every second) - Production mode always
  const [deviceClock, setDeviceClock] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDeviceClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Always use real device clock in production
  const currentTime = deviceClock;

  // Live schedule analysis comparing device time with course schedules
  const scheduleAnalysis = useMemo(() => {
    return analyzeCurrentSchedule(courses, currentTime);
  }, [courses, currentTime]);

  const {
    activeClass,
    upcomingToday,
    nextScheduledSession,
    todayCompletedCount,
    isClassDay,
    currentDayName
  } = scheduleAnalysis;

  // Smart day selection: defaults to today if it's Saturday (6), else Viernes
  const [selectedDayTab, setSelectedDayTab] = useState<'Viernes' | 'Sabado'>(() => {
    const day = currentTime.getDay();
    return day === 6 ? 'Sabado' : 'Viernes';
  });

  // Keep day tab in sync if day changes
  useEffect(() => {
    const day = currentTime.getDay();
    if (day === 6) setSelectedDayTab('Sabado');
    else if (day === 5) setSelectedDayTab('Viernes');
  }, [currentTime]);

  // Smart module selection based on current month
  const [filterModule, setFilterModule] = useState<'all' | 'Septiembre - Octubre' | 'Octubre' | 'Noviembre'>(() => {
    const m = currentTime.getMonth(); // 8 = Sep, 9 = Oct, 10 = Nov
    if (m === 10) return 'Noviembre';
    if (m === 9) {
      return currentTime.getDate() <= 3 ? 'Septiembre - Octubre' : 'Octubre';
    }
    return 'Septiembre - Octubre';
  });

  // Pending tasks summary
  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const nextUrgentTask = useMemo(() => {
    if (pendingTasks.length === 0) return null;
    return [...pendingTasks].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];
  }, [pendingTasks]);

  // Filter courses for selected day tab and selected module
  const dayCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesDay = c.day === selectedDayTab;
      const matchesModule = filterModule === 'all' || c.moduleName === filterModule;
      return matchesDay && matchesModule;
    }).sort((a, b) => a.startTime24.localeCompare(b.startTime24));
  }, [courses, selectedDayTab, filterModule]);

  const currentSecondsOfDay = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();

  // Target next course to display when NO class is active
  const targetNextClass = upcomingToday || nextScheduledSession;
  const isUpcomingToday = Boolean(upcomingToday);

  return (
    <div className="space-y-2.5 pb-20 animate-in fade-in duration-200">
      {/* 2. DYNAMIC MAIN HERO CARD: 'CLASE ACTUAL' vs 'PRÓXIMA CLASE' (Clean Human Light Theme) */}
      {activeClass ? (
        // =========================================================================
        // CASE 1: CLASE ACTUAL (In progress right now)
        // Background #EAF2F8 and pure black text #000000 as requested
        // =========================================================================
        <div
          id="card-clase-actual"
          onClick={() => onSelectCourse(activeClass.course)}
          className="hero-card-celeste p-4 sm:p-5 rounded-xl cursor-pointer active:scale-[0.99] transition-all space-y-3 border border-[#9ecdf0]"
          style={{ backgroundColor: '#BFE3FA', color: '#000000' }}
        >
          {/* Header row: Status and subtle notifications switch */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold tracking-wide text-emerald-800">
                Clase en curso
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-[#000000] font-medium opacity-80">
                Termina a las {activeClass.course.endTime24}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenNotificationSettings();
              }}
              title={notificationsEnabled ? 'Recordatorios activos' : 'Configurar recordatorios'}
              className="p-1.5 rounded-lg text-[#000000] hover:bg-black/5 transition-colors cursor-pointer"
            >
              {notificationsEnabled ? (
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Course Name in clean Human Title Case */}
          <div>
            <div className="flex items-center gap-2 text-[11.5px] text-[#000000] opacity-75 font-mono mb-1">
              <span>Cód. {activeClass.course.codeNumber}</span>
              <span>•</span>
              <span>{activeClass.course.group}</span>
              <span>•</span>
              <span>{activeClass.course.moduleName}</span>
            </div>
            <h2 className="font-bold text-lg sm:text-xl leading-snug text-[#000000]">
              {toHumanTitleCase(activeClass.course.name)}
            </h2>
          </div>

          {/* Single clean line for Schedule & Room */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-[#000000]">
            <span className="font-medium text-[#000000]">{formatCleanTimeRange(activeClass.course.timeRange)}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-[#000000] bg-white/85 border border-slate-300/70 px-2 py-0.5 rounded text-[11px] font-medium">
              {activeClass.course.classroom || 'Aula por asignar'}
            </span>
          </div>

          {/* Teacher name */}
          <div className="text-xs text-[#000000] flex items-center gap-1.5">
            <span>Docente: <strong className="font-semibold text-[#000000]">{toHumanTitleCase(activeClass.course.professor)}</strong></span>
          </div>

          {/* Progress indicator */}
          <div className="pt-0.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#000000]">
              <span>Tiempo restante: <strong className="text-[#000000] font-mono font-bold">{formatCountdownHuman(activeClass.secondsRemaining || 0)}</strong></span>
              <span className="font-mono text-[11px] text-[#000000] font-semibold">{activeClass.progressPercent}%</span>
            </div>
            <div className="w-full bg-[#d5e4ef] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${activeClass.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Session dates clean row */}
          <div className="pt-2 border-t border-[#d4e2ee]">
            <CourseSessionDatesTimeline course={activeClass.course} currentTime={currentTime} isDark={false} />
          </div>

          {/* Bottom discreet action */}
          <div className="pt-0.5 flex items-center justify-end text-xs text-[#000000]">
            <span className="flex items-center gap-1 font-semibold hover:underline transition-colors">
              Ver detalles de la materia <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ) : targetNextClass ? (
        // =========================================================================
        // CASE 2: PRÓXIMA CLASE / PRÓXIMA SESIÓN PROGRAMADA
        // Background #EAF2F8 and pure black text #000000 as requested
        // =========================================================================
        <div
          id="card-proxima-clase"
          onClick={() => onSelectCourse(targetNextClass.course)}
          className="hero-card-celeste p-4 sm:p-5 rounded-xl cursor-pointer active:scale-[0.99] transition-all space-y-3 border border-[#9ecdf0]"
          style={{ backgroundColor: '#BFE3FA', color: '#000000' }}
        >
          {/* Header row: subtle text label and clean notification switch */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#000000] font-medium opacity-80">
                {isUpcomingToday ? 'Próxima clase hoy' : 'Próxima sesión programada'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[#000000] font-bold">
                {isUpcomingToday ? `Hoy a las ${targetNextClass.course.startTime24}` : targetNextClass.dateFormatted}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenNotificationSettings();
              }}
              title={notificationsEnabled ? 'Recordatorios activos' : 'Configurar recordatorios'}
              className="p-1.5 rounded-lg text-[#000000] hover:bg-black/5 transition-colors cursor-pointer"
            >
              {notificationsEnabled ? (
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Course Name in clean Human Title Case */}
          <div>
            <div className="flex items-center gap-2 text-[11.5px] text-[#000000] opacity-75 font-mono mb-1">
              <span>Cód. {targetNextClass.course.codeNumber}</span>
              <span>•</span>
              <span>{targetNextClass.course.day}</span>
              <span>•</span>
              <span>{targetNextClass.course.moduleName}</span>
            </div>
            <h2 className="font-bold text-lg sm:text-xl leading-snug text-[#000000]">
              {toHumanTitleCase(targetNextClass.course.name)}
            </h2>
          </div>

          {/* Single clean line for Date, Time & Room */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-[#000000]">
            <span className="font-medium text-[#000000]">{formatCleanTimeRange(targetNextClass.course.timeRange)}</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-[#000000] bg-white/85 border border-slate-300/70 px-2 py-0.5 rounded text-[11px] font-medium">
              {targetNextClass.course.classroom || 'Aula por asignar'}
            </span>
          </div>

          {/* Teacher name */}
          <div className="text-xs text-[#000000] flex items-center gap-1.5">
            <span>Docente: <strong className="font-semibold text-[#000000]">{toHumanTitleCase(targetNextClass.course.professor)}</strong></span>
          </div>

          {/* Context status when class is later today */}
          {todayCompletedCount > 0 && isClassDay && !upcomingToday ? (
            <div className="text-xs text-[#000000] flex items-center gap-2 pt-1 border-t border-[#d4e2ee]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Has finalizado las clases presenciales de hoy {currentDayName}.</span>
            </div>
          ) : isUpcomingToday && upcomingToday?.timeUntilStartMinutes !== undefined ? (
            <div className="text-xs text-[#000000] bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 flex items-center gap-2">
              <span className="font-medium">Inicia en {formatDuration(upcomingToday.timeUntilStartMinutes)}</span>
            </div>
          ) : null}

          {/* Clean Session Timeline */}
          <div className="pt-2 border-t border-[#d4e2ee]">
            <CourseSessionDatesTimeline course={targetNextClass.course} currentTime={currentTime} isDark={false} />
          </div>

          {/* Discreet Footer link */}
          <div className="pt-0.5 flex items-center justify-between text-xs text-[#000000]">
            <span className="text-[11px] text-[#000000] opacity-75">
              {notificationsEnabled ? 'Recordatorio activo 1h antes' : 'Recordatorios desactivados'}
            </span>
            <span className="flex items-center gap-1 text-[#000000] font-semibold hover:underline transition-colors">
              Ver detalles <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ) : null}

      {/* 3. Pending Tasks Alert Card (Neutral Clean Theme) */}
      {pendingTasks.length > 0 && onGoToTasks && (
        <div
          id="card-pending-tasks-alert"
          onClick={onGoToTasks}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer active:scale-98 transition-all hover:bg-slate-100"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {pendingTasks.length} compromiso{pendingTasks.length !== 1 ? 's' : ''} pendiente{pendingTasks.length !== 1 ? 's' : ''}
                </span>
                {nextUrgentTask && (
                  <span className="text-[9.5px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-medium shrink-0">
                    {nextUrgentTask.type === 'Otro' && nextUrgentTask.customType ? nextUrgentTask.customType : nextUrgentTask.type}
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-slate-600 truncate">
                {nextUrgentTask ? `${nextUrgentTask.title} • Entrega: ${nextUrgentTask.dueDate}` : 'Toca para revisar tus compromisos y notas'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      )}

      {/* 4. Module Selector Tabs */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Módulos Académicos
          </span>
          <button
            onClick={onGoToCalendar}
            className="text-[10.5px] text-slate-600 hover:text-[#b7191f] font-medium flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            Ver calendario <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-md">
          <button
            onClick={() => setFilterModule('Septiembre - Octubre')}
            className={`py-1 px-1.5 rounded text-xs font-medium flex flex-col items-center justify-center transition-colors cursor-pointer ${
              filterModule === 'Septiembre - Octubre'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-[10.5px]">Módulo I</span>
            <span className="text-[9px] text-slate-400 font-normal">Sep - Oct</span>
          </button>

          <button
            onClick={() => setFilterModule('Octubre')}
            className={`py-1 px-1.5 rounded text-xs font-medium flex flex-col items-center justify-center transition-colors cursor-pointer ${
              filterModule === 'Octubre'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-[10.5px]">Módulo II</span>
            <span className="text-[9px] text-slate-400 font-normal">Octubre</span>
          </button>

          <button
            onClick={() => setFilterModule('Noviembre')}
            className={`py-1 px-1.5 rounded text-xs font-medium flex flex-col items-center justify-center transition-colors cursor-pointer ${
              filterModule === 'Noviembre'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-[10.5px]">Módulo III</span>
            <span className="text-[9px] text-slate-400 font-normal">Noviembre</span>
          </button>
        </div>
      </div>

      {/* 5. Day of Week Switcher (Viernes vs Sábado) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Jornada Presencial
            </h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-1.5 py-0.2 rounded border border-slate-200/60">
            Grupo C1
          </span>
        </div>

        {/* Day Segmented Tabs */}
        <div className="flex rounded-md bg-slate-100 p-0.5">
          <button
            onClick={() => setSelectedDayTab('Viernes')}
            className={`flex-1 py-1 text-xs rounded transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              selectedDayTab === 'Viernes'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Viernes</span>
            <span className="text-[9.5px] text-slate-400">(Tarde: 2:45 PM)</span>
          </button>
          <button
            onClick={() => setSelectedDayTab('Sabado')}
            className={`flex-1 py-1 text-xs rounded transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              selectedDayTab === 'Sabado'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Sábado</span>
            <span className="text-[9.5px] text-slate-400">(Jornada Completa)</span>
          </button>
        </div>

        {/* Courses List for this day - Highlight active class & time states */}
        <div className="space-y-2 pt-0.5">
          {dayCourses.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs">
              No hay clases programadas para {selectedDayTab} en {filterModule}.
            </div>
          ) : (
            dayCourses.map(course => {
              const [sH, sM] = course.startTime24.split(':').map(Number);
              const [eH, eM] = course.endTime24.split(':').map(Number);
              const startSec = sH * 3600 + sM * 60;
              const endSec = eH * 3600 + eM * 60;

              const isDayActive = isClassDay && selectedDayTab === currentDayName;
              const isCourseCurrent = isDayActive && currentSecondsOfDay >= startSec && currentSecondsOfDay < endSec;
              const isCourseFinished = isDayActive && currentSecondsOfDay >= endSec;
              const isCourseUpcoming = isDayActive && currentSecondsOfDay < startSec;

              const secondsRemaining = isCourseCurrent ? endSec - currentSecondsOfDay : 0;
              const progressPercent = isCourseCurrent
                ? Math.min(100, Math.max(0, Math.round(((currentSecondsOfDay - startSec) / (endSec - startSec)) * 100)))
                : 0;

              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className={`p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer space-y-1.5 relative overflow-hidden ${
                    isCourseCurrent
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : isCourseFinished
                      ? 'border-slate-200/80 bg-slate-50/60 opacity-80'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs active:scale-[0.99]'
                  }`}
                >
                  {/* Top status & timing */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs ${isCourseCurrent ? 'text-emerald-950 font-bold' : isCourseFinished ? 'text-slate-600 font-medium' : 'font-semibold text-slate-800'}`}>
                      {formatCleanTimeRange(course.timeRange)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCourseCurrent && (
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9.5px] font-semibold px-2 py-0.5 rounded shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          En curso • {formatCountdownClock(secondsRemaining)}
                        </span>
                      )}
                      {isCourseFinished && (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          Finalizada
                        </span>
                      )}
                      {isCourseUpcoming && (
                        <span className="text-[9.5px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                          Inicia en {formatDuration(Math.ceil((startSec - currentSecondsOfDay) / 60))}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200/60">
                        Cód. {course.codeNumber}
                      </span>
                    </div>
                  </div>

                  {/* Course Name */}
                  <div>
                    <h4 className={`font-bold text-xs leading-snug ${isCourseCurrent ? 'text-emerald-950' : isCourseFinished ? 'text-slate-800' : 'text-slate-900'}`}>
                      {toHumanTitleCase(course.name)}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 font-normal mt-0.5 flex items-center gap-1">
                      <span className="truncate">{toHumanTitleCase(course.professor)}</span>
                    </p>
                  </div>

                  {/* Mini countdown progress bar if in course */}
                  {isCourseCurrent && (
                    <div className="pt-0.5 pb-0.5 space-y-1">
                      <div className="w-full bg-emerald-200/80 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] text-emerald-800 font-medium">
                        <span>{progressPercent}% transcurrido</span>
                        <span>Resta: {formatCountdownHuman(secondsRemaining)}</span>
                      </div>
                    </div>
                  )}

                  {/* Dates timeline with discreet session indication, strikethrough for past dates, and classroom */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <CourseSessionDatesTimeline course={course} currentTime={currentTime} compact={true} />
                    </div>
                    <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] shrink-0 border border-slate-200/50">
                      {course.classroom || 'Por asignar'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Action to Official PDF Sheet */}
      <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 shadow-sm flex items-center justify-between gap-2.5">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-[#e57373] shrink-0" />
            <span>Formato Oficial Universitario</span>
          </div>
          <p className="text-xs text-slate-400">
            Descarga directa del horario oficial en PDF con formato institucional.
          </p>
        </div>
        <button
          onClick={onGoToOfficialSheet}
          className="px-3 py-2 bg-[#b7191f] hover:bg-[#9c151a] active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <span>Ver Hoja</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
