import React, { useState } from 'react';
import { ModularCourse } from '../types';
import {
  Bell,
  BellRing,
  Calendar,
  CheckSquare,
  ChevronRight,
  FileText,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { getCourseSessionsAnalysis } from '../utils/scheduleStatus';
import { toHumanTitleCase, formatCleanTimeRange } from '../utils/textUtils';

interface ArjunHeroCardProps {
  course: ModularCourse;
  isActive: boolean;
  activeSecondsRemaining?: number;
  activeProgressPercent?: number;
  isUpcomingToday: boolean;
  upcomingDateFormatted?: string;
  upcomingTimeUntilStartMinutes?: number;
  todayCompletedCount: number;
  isClassDay: boolean;
  currentDayName: string;
  currentTime: Date;
  notificationsEnabled: boolean;
  onOpenNotificationSettings: () => void;
  onSelectCourse: (course: ModularCourse) => void;
  onGoToTasks?: () => void;
  onGoToCalendar?: () => void;
  onGoToOfficialSheet?: () => void;
}

export const ArjunHeroCard: React.FC<ArjunHeroCardProps> = ({
  course,
  isActive,
  activeSecondsRemaining = 0,
  activeProgressPercent = 0,
  isUpcomingToday,
  upcomingDateFormatted,
  upcomingTimeUntilStartMinutes,
  todayCompletedCount,
  isClassDay,
  currentDayName,
  currentTime,
  notificationsEnabled,
  onOpenNotificationSettings,
  onSelectCourse,
  onGoToTasks,
  onGoToCalendar,
  onGoToOfficialSheet
}) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Analyze course sessions for timeline
  const analysis = getCourseSessionsAnalysis(course, currentTime);
  const { sessions } = analysis;

  const formatCountdownHuman = (seconds: number): string => {
    if (seconds <= 0) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getTeacherInitials = (name: string): string => {
    if (!name) return 'PR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div
      id={isActive ? 'card-clase-actual' : 'card-proxima-clase'}
      onClick={() => onSelectCourse(course)}
      className="relative overflow-hidden w-full rounded-none border-x-0 border-t-0 border-b border-slate-200/90 shadow-xs bg-white cursor-pointer transition-all group"
    >
      {/* =========================================================================
          TOP SECTION: Atmospheric Photographic Header with Overlay & Teacher Info
          Full-bleed edge-to-edge covering complete screen width
          ========================================================================= */}
      <div className="relative min-h-[170px] sm:min-h-[195px] text-white flex flex-col justify-between overflow-hidden">
        {/* Background Image (Classic Arjun birds/sky texture) */}
        <div
          className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url('https://raw.githubusercontent.com/arjunamgain/FilterMenu/master/images/header.jpg')`
          }}
        />

        {/* Purple/Aubergine Overlay matching rgba(71, 32, 84, 0.58) */}
        <div
          className="absolute inset-0 transition-opacity"
          style={{
            backgroundColor: 'rgba(56, 28, 72, 0.62)',
            backdropFilter: 'blur(0.5px)'
          }}
        />

        {/* Top Mini-Nav */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-3.5 sm:px-6 sm:pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10.5px] font-bold tracking-wide shadow-xs backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                CLASE EN CURSO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
                <Clock className="w-3.5 h-3.5 text-pink-300" />
                <span>
                  {isUpcomingToday ? 'Próxima clase hoy' : 'Próxima sesión programada'}
                </span>
              </span>
            )}
          </div>

          {/* Bell button on top right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotificationSettings();
            }}
            title={notificationsEnabled ? 'Recordatorios activos' : 'Configurar recordatorios'}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-colors cursor-pointer backdrop-blur-xs"
          >
            {notificationsEnabled ? (
              <BellRing className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-white/90" />
            )}
          </button>
        </div>

        {/* User Profile / Teacher Details */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-8 sm:px-6 sm:pb-9 flex items-center gap-3">
          {/* Circular Avatar */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white/90 shadow-md bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
            <span className="tracking-tighter select-none">{getTeacherInitials(course.professor)}</span>
          </div>

          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-bold text-white leading-tight truncate drop-shadow-xs">
              {toHumanTitleCase(course.professor)}
            </h4>
            <p className="text-xs text-white/80 font-medium truncate">
              Docente • Cód. {course.codeNumber} • {course.moduleName}
            </p>
          </div>
        </div>

        {/* Slanted Diagonal Divider (Exact Cut spanning edge-to-edge) */}
        <div className="absolute -bottom-[1px] left-0 right-0 z-10 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            className="w-full h-8 sm:h-10 text-white fill-current block"
            viewBox="0 0 100 24"
            preserveAspectRatio="none"
          >
            <polygon points="0,24 100,4 100,24" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          FLOATING ACTION BUTTON (FAB) ON DIAGONAL SEAM with Radial Quick Menu
          ========================================================================= */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6">
        <div className="absolute -top-6 right-4 sm:right-6">
          {/* Radial options when open */}
          {isFilterMenuOpen && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              {/* Option 1: Bell / Notifications */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFilterMenuOpen(false);
                  onOpenNotificationSettings();
                }}
                className="absolute w-9 h-9 -translate-y-12 translate-x-2 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-transform active:scale-90 cursor-pointer animate-in zoom-in-75 duration-200"
                title="Configurar recordatorios"
              >
                <Bell className="w-4 h-4 text-amber-600" />
              </button>

              {/* Option 2: Calendar */}
              {onGoToCalendar && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterMenuOpen(false);
                    onGoToCalendar();
                  }}
                  className="absolute w-9 h-9 -translate-y-8 -translate-x-11 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-transform active:scale-90 cursor-pointer animate-in zoom-in-75 duration-200 delay-50"
                  title="Ver calendario modular"
                >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </button>
              )}

              {/* Option 3: Tasks */}
              {onGoToTasks && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterMenuOpen(false);
                    onGoToTasks();
                  }}
                  className="absolute w-9 h-9 translate-y-3 -translate-x-12 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-transform active:scale-90 cursor-pointer animate-in zoom-in-75 duration-200 delay-75"
                  title="Ver compromisos y tareas"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                </button>
              )}

              {/* Option 4: Official Sheet */}
              {onGoToOfficialSheet && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterMenuOpen(false);
                    onGoToOfficialSheet();
                  }}
                  className="absolute w-9 h-9 translate-y-11 -translate-x-3 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-transform active:scale-90 cursor-pointer animate-in zoom-in-75 duration-200 delay-100"
                  title="Ver horario oficial"
                >
                  <FileText className="w-4 h-4 text-pink-600" />
                </button>
              )}
            </div>
          )}

          {/* Main FAB Circle Button (Arjun #FA396B Pink/Coral) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterMenuOpen(!isFilterMenuOpen);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 cursor-pointer relative z-30 ${
              isFilterMenuOpen
                ? 'bg-[#DE3963] rotate-45'
                : 'bg-[#FA396B] hover:bg-[#eb2e60] hover:shadow-lg'
            }`}
            title="Opciones rápidas"
            aria-label="Menú de opciones rápidas"
          >
            {isFilterMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <SlidersHorizontal className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: Clean White Content, Subject Title & Timeline
          ========================================================================= */}
      <div className="w-full bg-white">
        <div className="max-w-4xl mx-auto px-4 pt-1 pb-5 sm:px-6 sm:pb-6 space-y-3">
          {/* Title Area */}
          <div className="pr-12">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            {isActive
              ? `En curso hasta las ${course.endTime24}`
              : upcomingDateFormatted
              ? upcomingDateFormatted.toUpperCase()
              : `${course.day.toUpperCase()} • ${course.timeRange}`}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {toHumanTitleCase(course.name)}
          </h3>
        </div>

        {/* Schedule & Classroom Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            {formatCleanTimeRange(course.timeRange)}
          </span>
          <span className="font-medium text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md">
            {course.classroom || 'Aula por asignar'}
          </span>
          {upcomingTimeUntilStartMinutes !== undefined && upcomingTimeUntilStartMinutes > 0 && (
            <span className="font-medium text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded text-[11px]">
              Inicia en {Math.floor(upcomingTimeUntilStartMinutes / 60)}h {upcomingTimeUntilStartMinutes % 60}m
            </span>
          )}
        </div>

        {/* Active Class Progress Bar */}
        {isActive && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-medium">
                Tiempo restante: <strong className="text-slate-900 font-mono">{formatCountdownHuman(activeSecondsRemaining)}</strong>
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-700">{activeProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${activeProgressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Finished status for earlier today */}
        {todayCompletedCount > 0 && isClassDay && !isActive && !isUpcomingToday && (
          <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Has completado las clases presenciales de hoy {currentDayName}.</span>
          </div>
        )}

        {/* =======================================================================
            TIMELINE OF SESSIONS: Authentic Arjun Amgain 'ul.tasks' vertical layout
            ======================================================================= */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Cronograma de Sesiones
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              {analysis.completedCount} de {analysis.totalCount} completadas
            </span>
          </div>

          <div className="relative pl-5 py-1 space-y-2.5 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
            {sessions.map((session) => {
              const isRed = session.isCurrent || session.isNextUpcoming;
              const isGreen = session.isFinishedToday || session.isPast;
              const isYellow = !isRed && !isGreen;

              return (
                <div key={session.dateIso} className="relative flex items-center justify-between text-xs">
                  {/* Timeline Dot */}
                  <span
                    className={`absolute -left-5 top-1.5 w-2 h-2 rounded-full border-2 border-white shadow-2xs ${
                      isRed
                        ? 'bg-[#FF3163] ring-2 ring-pink-200 animate-pulse'
                        : isGreen
                        ? 'bg-[#10b981]'
                        : 'bg-[#EAB429]'
                    }`}
                  />

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isRed
                          ? 'text-pink-700 font-bold'
                          : isGreen
                          ? 'text-slate-600 line-through'
                          : 'text-slate-700'
                      }`}
                    >
                      {session.fullLabel}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Sesión {session.sessionNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    {session.isCurrent ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        En curso
                      </span>
                    ) : session.isNextUpcoming ? (
                      <span className="text-pink-700 font-bold bg-pink-50 px-1.5 py-0.5 rounded">
                        Siguiente
                      </span>
                    ) : session.isPast || session.isFinishedToday ? (
                      <span className="text-slate-600">
                        Finalizada ✓
                      </span>
                    ) : (
                      <span className="text-slate-600">
                        Programada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action Link */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
          <span className="text-[11px] text-slate-600">
            {notificationsEnabled ? 'Recordatorio activo 1h antes' : 'Recordatorios desactivados'}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-900 group-hover:text-pink-600 transition-colors">
            Ver detalles de la materia <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  </div>
);
};
