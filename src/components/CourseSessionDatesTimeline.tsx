import React from 'react';
import { ModularCourse } from '../types';
import { getCourseSessionsAnalysis } from '../utils/scheduleStatus';
import { Calendar } from 'lucide-react';

interface Props {
  course: ModularCourse;
  currentTime?: Date;
  compact?: boolean;
  isDark?: boolean;
}

export const CourseSessionDatesTimeline: React.FC<Props> = ({
  course,
  currentTime = new Date(),
  compact = true,
  isDark = false
}) => {
  const analysis = getCourseSessionsAnalysis(course, currentTime);
  const { sessions } = analysis;

  return (
    <div className="flex items-center gap-1.5 flex-wrap text-[10px] leading-none">
      <div className={`flex items-center gap-1 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <Calendar className="w-3 h-3 opacity-60 shrink-0" />
        <span className="font-medium text-[9.5px]">Fechas:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {sessions.map(session => {
          // 1. Currently in progress right now
          if (session.isCurrent) {
            return (
              <span
                key={session.dateIso}
                title={`Sesión ${session.sessionNumber} de ${session.totalSessions}: EN CURSO`}
                className={`inline-flex items-center gap-1 font-semibold ${
                  isDark ? 'text-emerald-300' : 'text-emerald-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="underline decoration-emerald-500 decoration-1 underline-offset-2">{session.fullLabel}</span>
              </span>
            );
          }

          // 2. Finished today
          if (session.isFinishedToday) {
            return (
              <span
                key={session.dateIso}
                title={`Sesión ${session.sessionNumber}: Finalizada hoy`}
                className={`inline-flex items-center gap-0.5 line-through decoration-slate-400/80 ${
                  isDark ? 'text-slate-400/80' : 'text-slate-500'
                }`}
              >
                <span>{session.fullLabel}</span>
                <span className="no-underline text-[8px] opacity-70">✓</span>
              </span>
            );
          }

          // 3. Past date from prior day (tached/strikethrough)
          if (session.isPast) {
            return (
              <span
                key={session.dateIso}
                title={`Sesión ${session.sessionNumber}: Concluida el ${session.fullFormatted}`}
                className={`inline-flex items-center line-through decoration-slate-400/70 opacity-60 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {session.fullLabel}
              </span>
            );
          }

          // 4. Upcoming later today
          if (session.isUpcomingToday) {
            return (
              <span
                key={session.dateIso}
                title={`Sesión ${session.sessionNumber}: Hoy a las ${course.startTime24}`}
                className={`inline-flex items-center gap-1 font-semibold ${
                  isDark ? 'text-sky-300' : 'text-slate-900'
                }`}
              >
                <span className="w-1 h-1 rounded-full bg-sky-500 shrink-0" />
                <span className="underline decoration-sky-400 decoration-1 underline-offset-2">{session.fullLabel}</span>
              </span>
            );
          }

          // 5. Next upcoming scheduled session (discreetly indicated)
          if (session.isNextUpcoming) {
            return (
              <span
                key={session.dateIso}
                title={`Próxima sesión a cursar: Sesión ${session.sessionNumber} de ${session.totalSessions}`}
                className={`inline-flex items-center gap-1 font-semibold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                <span className={`w-1 h-1 rounded-full shrink-0 ${isDark ? 'bg-slate-300' : 'bg-[#b7191f]'}`} />
                <span className="underline decoration-slate-400/80 decoration-1 underline-offset-2">{session.fullLabel}</span>
              </span>
            );
          }

          // 6. Normal future sessions
          return (
            <span
              key={session.dateIso}
              title={`Sesión ${session.sessionNumber} de ${session.totalSessions}`}
              className={`inline-flex items-center ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {session.fullLabel}
            </span>
          );
        })}
      </div>
    </div>
  );
};
