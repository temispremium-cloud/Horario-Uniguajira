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
import { ArjunHeroCard } from './ArjunHeroCard';
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
      {/* 2. DYNAMIC MAIN HERO CARD: 'CLASE ACTUAL' vs 'PRÓXIMA CLASE' (Arjun Amgain Timeline Style) */}
      {activeClass ? (
        <ArjunHeroCard
          course={activeClass.course}
          isActive={true}
          activeSecondsRemaining={activeClass.secondsRemaining}
          activeProgressPercent={activeClass.progressPercent}
          isUpcomingToday={false}
          todayCompletedCount={todayCompletedCount}
          isClassDay={isClassDay}
          currentDayName={currentDayName}
          currentTime={currentTime}
          notificationsEnabled={notificationsEnabled}
          onOpenNotificationSettings={onOpenNotificationSettings}
          onSelectCourse={onSelectCourse}
          onGoToTasks={onGoToTasks}
          onGoToCalendar={onGoToCalendar}
          onGoToOfficialSheet={onGoToOfficialSheet}
        />
      ) : targetNextClass ? (
        <ArjunHeroCard
          course={targetNextClass.course}
          isActive={false}
          isUpcomingToday={isUpcomingToday}
          upcomingDateFormatted={isUpcomingToday ? `Hoy a las ${targetNextClass.course.startTime24}` : targetNextClass.dateFormatted}
          upcomingTimeUntilStartMinutes={upcomingToday?.timeUntilStartMinutes}
          todayCompletedCount={todayCompletedCount}
          isClassDay={isClassDay}
          currentDayName={currentDayName}
          currentTime={currentTime}
          notificationsEnabled={notificationsEnabled}
          onOpenNotificationSettings={onOpenNotificationSettings}
          onSelectCourse={onSelectCourse}
          onGoToTasks={onGoToTasks}
          onGoToCalendar={onGoToCalendar}
          onGoToOfficialSheet={onGoToOfficialSheet}
        />
      ) : null}

      {/* Centered container for secondary sections */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-3 pt-2 sm:pt-3">
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
  </div>
);
};
