import React, { useState, useMemo } from 'react';
import { ModularCourse, TaskItem } from '../types';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  BookOpen,
  Filter,
  Award,
  FileText,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Bell
} from 'lucide-react';
import { vibrateDevice } from '../utils/androidBridge';

interface MobileTasksViewProps {
  courses: ModularCourse[];
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddTaskModal: (courseId?: string) => void;
  onEditTask: (task: TaskItem) => void;
}

export const MobileTasksView: React.FC<MobileTasksViewProps> = ({
  courses,
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenAddTaskModal,
  onEditTask
}) => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'graded' | 'completed' | 'all'>('pending');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const courseMap = useMemo(() => {
    const map = new Map<string, ModularCourse>();
    courses.forEach(c => map.set(c.id, c));
    return map;
  }, [courses]);

  // Calculate Academic Stats (Average grade, pending, completed)
  const stats = useMemo(() => {
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    // Filter tasks that have registered grades
    const gradedTasks = tasks.filter(t => t.grade !== undefined && !isNaN(t.grade));
    let totalGrade = 0;
    let totalWeight = 0;

    gradedTasks.forEach(t => {
      const weight = t.percentage || 1;
      totalGrade += (t.grade || 0) * weight;
      totalWeight += weight;
    });

    const average = totalWeight > 0 ? totalGrade / totalWeight : null;

    return {
      pending,
      completed,
      gradedCount: gradedTasks.length,
      average: average !== null ? Math.round(average * 10) / 10 : null
    };
  }, [tasks]);

  // Filter tasks based on status, course, and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'pending') matchesStatus = !t.completed;
      else if (filterStatus === 'completed') matchesStatus = t.completed;
      else if (filterStatus === 'graded') matchesStatus = t.grade !== undefined;

      // Course filter
      const matchesCourse = filterCourse === 'all' || t.courseId === filterCourse;

      // Search query filter (title, notes, or custom type)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.customType && t.customType.toLowerCase().includes(q));

      return matchesStatus && matchesCourse && matchesSearch;
    });
  }, [tasks, filterStatus, filterCourse, searchQuery]);

  const handleToggle = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    vibrateDevice(40);
    onToggleTask(taskId);
  };

  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    vibrateDevice([50, 40]);
    onDeleteTask(taskId);
  };

  return (
    <div className="space-y-3.5 pb-20 animate-in fade-in duration-200">
      {/* 1. Academic Performance & Summary Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#b7191f]/10 flex items-center justify-center text-[#b7191f]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Compromisos y Calificaciones
              </h2>
              <p className="text-[11px] text-slate-500">
                Parciales, talleres y seguimiento de notas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              vibrateDevice(30);
              onOpenAddTaskModal(undefined);
            }}
            className="px-3 py-2 bg-[#b7191f] hover:bg-[#9c151a] active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[38px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Compromiso</span>
          </button>
        </div>

        {/* Quick Academic Metric Chips */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Pendientes */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
            <span className="block text-base font-extrabold text-slate-900 leading-tight">
              {stats.pending}
            </span>
            <span className="text-[10.5px] font-medium text-slate-500">
              Pendientes
            </span>
          </div>

          {/* Entregadas */}
          <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
            <span className="block text-base font-extrabold text-slate-700 leading-tight">
              {stats.completed}
            </span>
            <span className="text-[10.5px] font-medium text-slate-500">
              Entregadas
            </span>
          </div>

          {/* Promedio de Notas */}
          <div
            className={`border p-2.5 rounded-xl text-center ${
              stats.average !== null
                ? stats.average >= 3.0
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200/80 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-emerald-700" />
              <span className="text-base font-extrabold leading-tight">
                {stats.average !== null ? stats.average.toFixed(1) : '—'}
              </span>
            </div>
            <span className="text-[10.5px] font-medium block truncate">
              {stats.average !== null
                ? stats.average >= 3.0
                  ? 'Aprobando'
                  : 'Atención'
                : 'Sin notas'}
            </span>
          </div>
        </div>

        {/* Search & Course Filter */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título o apuntes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#b7191f]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium text-[11px] shrink-0">Materia:</span>
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#b7191f] truncate"
            >
              <option value="all">Todas las 9 asignaturas</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips (Touch Friendly) */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs gap-1">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer min-h-[34px] font-medium ${
              filterStatus === 'pending'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendientes ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer min-h-[34px] font-medium ${
              filterStatus === 'graded'
                ? 'bg-white text-emerald-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Con Nota ({stats.gradedCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer min-h-[34px] font-medium ${
              filterStatus === 'completed'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completadas ({stats.completed})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer min-h-[34px] font-medium ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({tasks.length})
          </button>
        </div>
      </div>

      {/* 2. Tasks & Commitments List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">No hay compromisos que mostrar</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              {filterStatus === 'pending'
                ? '¡Estás al día! No tienes compromisos pendientes por entregar.'
                : filterStatus === 'graded'
                ? 'Aún no has registrado calificaciones en tus compromisos.'
                : 'No se encontraron tareas con los filtros seleccionados.'}
            </p>
            <button
              onClick={() => onOpenAddTaskModal(undefined)}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b7191f] text-white rounded-xl text-xs font-semibold hover:bg-[#9c151a] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Compromiso</span>
            </button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const course = courseMap.get(task.courseId);
            const isOtro = task.type === 'Otro';
            const displayType = isOtro && task.customType ? task.customType : task.type;

            return (
              <div
                key={task.id}
                onClick={() => onEditTask(task)}
                className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  task.completed
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs active:scale-[0.99]'
                }`}
              >
                {/* Top Row: Type badge, Course shortName, Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {/* Type Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        task.type === 'Parcial'
                          ? 'bg-red-50 text-[#b7191f] border border-red-200'
                          : task.type === 'Tarea'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : task.type === 'Taller'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : task.type === 'Quiz'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {displayType}
                    </span>

                    {/* Course Pill */}
                    {course && (
                      <span className="text-[11px] font-medium text-slate-600 truncate max-w-[170px] bg-slate-100 px-2 py-0.5 rounded-full">
                        {course.shortName}
                      </span>
                    )}
                  </div>

                  {/* Right side: Edit & Delete buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      title="Ver o editar apuntes y notas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={e => handleDelete(task.id, e)}
                      className="p-1.5 text-slate-300 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle: Title & Checkbox */}
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={e => handleToggle(task.id, e)}
                    className="mt-0.5 text-slate-400 hover:text-[#b7191f] cursor-pointer shrink-0 transition-colors p-0.5 min-w-[28px] min-h-[28px] flex items-center justify-center"
                    aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xs font-bold leading-snug ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Due Date Indicator */}
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Entrega: {task.dueDate}</span>
                      </span>

                      {task.reminderEnabled && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[#b7191f] bg-red-50 px-1.5 py-0.2 rounded-full font-medium">
                          <Bell className="w-2.5 h-2.5" />
                          Aviso activo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes Preview if available (Anotaciones de la estudiante) */}
                {task.notes && (
                  <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5 text-xs text-amber-950 flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        Apuntes & Instrucciones:
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-800 line-clamp-2 mt-0.5">
                        {task.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Grade Badge if registered (Ver notas de la estudiante) */}
                {task.grade !== undefined && (
                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] font-semibold text-slate-700">
                        Calificación Obtenida:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {task.percentage && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                          {task.percentage}% del corte
                        </span>
                      )}
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          task.grade >= 3.0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {task.grade.toFixed(1)} / 5.0
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
