import React, { useState, useMemo } from 'react';
import { ModularCourse, TaskItem } from '../types';
import { analyzeCurrentSchedule, formatDuration } from '../utils/scheduleStatus';
import { CourseSessionDatesTimeline } from './CourseSessionDatesTimeline';
import { toHumanTitleCase, formatCleanTimeRange } from '../utils/textUtils';
import {
  Search,
  BookOpen,
  ChevronRight
} from 'lucide-react';

interface MobileCoursesViewProps {
  courses: ModularCourse[];
  tasks: TaskItem[];
  onSelectCourse: (course: ModularCourse) => void;
  onOpenTaskModal: (courseId: string) => void;
}

export const MobileCoursesView: React.FC<MobileCoursesViewProps> = ({
  courses,
  tasks,
  onSelectCourse,
  onOpenTaskModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 'Septiembre - Octubre' | 'Octubre' | 'Noviembre'>('all');
  const [selectedDay, setSelectedDay] = useState<'all' | 'Viernes' | 'Sabado'>('all');

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.codeNumber.includes(searchTerm);

      const matchesModule = selectedModule === 'all' || course.moduleName === selectedModule;
      const matchesDay = selectedDay === 'all' || course.day === selectedDay;

      return matchesSearch && matchesModule && matchesDay;
    });
  }, [courses, searchTerm, selectedModule, selectedDay]);

  // Schedule analysis
  const scheduleAnalysis = useMemo(() => {
    return analyzeCurrentSchedule(courses, new Date());
  }, [courses]);

  // Tasks count per course
  const taskCountByCourse = useMemo(() => {
    const counts: { [courseId: string]: number } = {};
    tasks.forEach(t => {
      if (!t.completed) {
        counts[t.courseId] = (counts[t.courseId] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);

  return (
    <div className="space-y-2.5 pb-20 animate-in fade-in duration-200">
      {/* Search and Filters Header */}
      <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar asignatura, docente o código..."
            className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#b7191f] focus:border-[#b7191f]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Module Filter Buttons - Unified Sober Style */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedModule('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
              selectedModule === 'all'
                ? 'bg-[#b7191f] text-white border-[#b7191f]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Todas (9)
          </button>
          <button
            onClick={() => setSelectedModule('Septiembre - Octubre')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
              selectedModule === 'Septiembre - Octubre'
                ? 'bg-[#b7191f] text-white border-[#b7191f]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Módulo I (Sep-Oct)
          </button>
          <button
            onClick={() => setSelectedModule('Octubre')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
              selectedModule === 'Octubre'
                ? 'bg-[#b7191f] text-white border-[#b7191f]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Módulo II (Oct)
          </button>
          <button
            onClick={() => setSelectedModule('Noviembre')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
              selectedModule === 'Noviembre'
                ? 'bg-[#b7191f] text-white border-[#b7191f]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Módulo III (Nov)
          </button>
        </div>

        {/* Day Filter Sub-Pills */}
        <div className="flex items-center gap-1.5 text-xs pt-0.5 border-t border-slate-100">
          <span className="text-slate-400 font-medium mr-0.5 text-[10.5px]">Día:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                selectedDay === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedDay('Viernes')}
              className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                selectedDay === 'Viernes' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Viernes
            </button>
            <button
              onClick={() => setSelectedDay('Sabado')}
              className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer ${
                selectedDay === 'Sabado' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sábados
            </button>
          </div>
          <span className="ml-auto text-slate-400 text-[10.5px] font-medium">
            {filteredCourses.length} de {courses.length}
          </span>
        </div>
      </div>

      {/* Courses List - Clean & Professional */}
      <div className="space-y-2">
        {filteredCourses.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No se encontraron asignaturas</p>
            <p className="text-[11px] text-slate-400">Prueba con otro término de búsqueda o cambia los filtros.</p>
          </div>
        ) : (
          filteredCourses.map(course => {
            const pendingTasks = taskCountByCourse[course.id] || 0;
            const isActive = scheduleAnalysis.activeClass?.course.id === course.id;
            const isFinishedToday = scheduleAnalysis.isClassDay && course.day === scheduleAnalysis.currentDayName && (
              (() => {
                const [eH, eM] = course.endTime24.split(':').map(Number);
                const endSec = eH * 3600 + eM * 60;
                const now = new Date();
                const curSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
                return curSec >= endSec;
              })()
            );

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className={`p-2.5 sm:p-3 rounded-lg border shadow-2xs active:scale-[0.99] transition-all cursor-pointer space-y-1.5 ${
                  isActive
                    ? 'bg-emerald-50/40 border-emerald-500 shadow-xs'
                    : isFinishedToday
                    ? 'bg-red-50/20 border-red-200/80'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top row: Code, Module & Day */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <span className="bg-emerald-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Clase actual
                      </span>
                    ) : isFinishedToday ? (
                      <span className="bg-red-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <span className="w-1 h-1 rounded-full bg-white" />
                        Clase finalizada
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-1.5 py-0.2 rounded border border-slate-200/50">
                        {course.moduleName.replace('Septiembre - Octubre', 'Módulo I').replace('Octubre', 'Módulo II').replace('Noviembre', 'Módulo III')}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">
                      Cód. {course.codeNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pendingTasks > 0 && (
                      <span className="bg-red-50 text-[#b7191f] border border-red-200 text-[9.5px] font-semibold px-1.5 py-0.2 rounded">
                        {pendingTasks} pend.
                      </span>
                    )}
                    <span className="text-[10px] bg-slate-50 text-slate-600 font-medium px-1.5 py-0.2 rounded border border-slate-200/40">
                      {course.credits} Créditos
                    </span>
                  </div>
                </div>

                {/* Course Name */}
                <div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">
                    {toHumanTitleCase(course.name)}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                    <span className="truncate">{toHumanTitleCase(course.professor)}</span>
                  </p>
                </div>

                {/* Schedule & Classroom Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[10.5px] pt-1 border-t border-slate-100">
                  <div className="text-slate-700">
                    <span className="font-medium truncate">
                      {course.day}: {formatCleanTimeRange(course.timeRange)}
                    </span>
                  </div>
                  <div className="text-right text-slate-700">
                    <span className="font-medium truncate">
                      {course.classroom || 'Aula por asignar'}
                    </span>
                  </div>
                </div>

                {/* Dates Timeline & Actions footer */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CourseSessionDatesTimeline course={course} compact={true} />
                  </div>
                  <span className="text-[#b7191f] text-[10.5px] font-medium flex items-center gap-0.5 shrink-0 hover:underline">
                    Detalles <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
