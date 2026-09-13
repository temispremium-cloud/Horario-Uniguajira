import React, { useState, useEffect } from 'react';
import { ModularCourse, TaskItem } from '../types';
import {
  X,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Award,
  Bell,
  CheckCircle2,
  Sparkles,
  Clock,
  BookOpen
} from 'lucide-react';
import { vibrateDevice } from '../utils/androidBridge';

interface TaskModalProps {
  isOpen: boolean;
  courses: ModularCourse[];
  initialCourseId?: string;
  taskToEdit?: TaskItem | null;
  onClose: () => void;
  onSaveTask: (task: Omit<TaskItem, 'id'>, existingId?: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  courses,
  initialCourseId,
  taskToEdit,
  onClose,
  onSaveTask,
  onDeleteTask
}) => {
  const isEditing = Boolean(taskToEdit);

  const [courseId, setCourseId] = useState(
    taskToEdit?.courseId || initialCourseId || courses[0]?.id || ''
  );
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [type, setType] = useState<TaskItem['type']>(taskToEdit?.type || 'Parcial');
  const [customType, setCustomType] = useState(taskToEdit?.customType || '');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate !== 'Por definir' ? (taskToEdit?.dueDate || '') : '');
  const [notes, setNotes] = useState(taskToEdit?.notes || '');
  const [completed, setCompleted] = useState(taskToEdit?.completed || false);
  const [reminderEnabled, setReminderEnabled] = useState(
    taskToEdit?.reminderEnabled !== undefined ? taskToEdit.reminderEnabled : true
  );

  // Grade state
  const [hasGrade, setHasGrade] = useState<boolean>(taskToEdit?.grade !== undefined);
  const [grade, setGrade] = useState<string>(
    taskToEdit?.grade !== undefined ? String(taskToEdit.grade) : ''
  );
  const [percentage, setPercentage] = useState<string>(
    taskToEdit?.percentage !== undefined ? String(taskToEdit.percentage) : ''
  );

  useEffect(() => {
    if (taskToEdit) {
      setCourseId(taskToEdit.courseId);
      setTitle(taskToEdit.title);
      setType(taskToEdit.type);
      setCustomType(taskToEdit.customType || '');
      setDueDate(taskToEdit.dueDate !== 'Por definir' ? taskToEdit.dueDate : '');
      setNotes(taskToEdit.notes || '');
      setCompleted(taskToEdit.completed);
      setReminderEnabled(taskToEdit.reminderEnabled !== undefined ? taskToEdit.reminderEnabled : true);
      setHasGrade(taskToEdit.grade !== undefined);
      setGrade(taskToEdit.grade !== undefined ? String(taskToEdit.grade) : '');
      setPercentage(taskToEdit.percentage !== undefined ? String(taskToEdit.percentage) : '');
    } else {
      setCourseId(initialCourseId || courses[0]?.id || '');
      setTitle('');
      setType('Parcial');
      setCustomType('');
      setDueDate('');
      setNotes('');
      setCompleted(false);
      setReminderEnabled(true);
      setHasGrade(false);
      setGrade('');
      setPercentage('');
    }
  }, [taskToEdit, initialCourseId, courses]);

  if (!isOpen) return null;

  // Quick date pickers for mobile
  const setQuickDate = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const iso = d.toISOString().split('T')[0];
    setDueDate(iso);
    vibrateDevice(30);
  };

  const parsedGrade = parseFloat(grade);
  const isValidGrade = !isNaN(parsedGrade) && parsedGrade >= 0 && parsedGrade <= 5.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    vibrateDevice(50);

    const taskPayload: Omit<TaskItem, 'id'> = {
      courseId,
      title: title.trim(),
      type,
      customType: type === 'Otro' ? (customType.trim() || 'Otro Compromiso') : undefined,
      dueDate: dueDate.trim() || 'Por definir',
      completed,
      notes: notes.trim() || undefined,
      grade: hasGrade && isValidGrade ? Math.round(parsedGrade * 10) / 10 : undefined,
      percentage: percentage ? Math.min(100, Math.max(1, parseFloat(percentage))) : undefined,
      reminderEnabled
    };

    onSaveTask(taskPayload, taskToEdit?.id);
    onClose();
  };

  const handleDelete = () => {
    if (!taskToEdit || !onDeleteTask) return;
    vibrateDevice([60, 40]);
    onDeleteTask(taskToEdit.id);
    onClose();
  };

  return (
    <div
      id="task-modal-backdrop"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))'
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center landscape:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="task-modal-card"
        className="bg-white rounded-t-3xl sm:rounded-2xl landscape:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] landscape:max-h-[92dvh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#b7191f]/10 text-[#b7191f] flex items-center justify-center shrink-0">
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                {isEditing ? 'Editar Compromiso y Calificación' : 'Nuevo Compromiso Académico'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isEditing ? 'Consulta o actualiza tus notas y apuntes' : 'Organiza parciales, tareas y calificaciones'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 min-h-0 text-xs text-slate-700">
          {/* 1. Asignatura */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Asignatura de Licenciatura
            </label>
            <select
              value={courseId}
              onChange={e => setCourseId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#b7191f]/20 focus:border-[#b7191f] text-xs font-medium text-slate-900"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  [{course.group}] {course.shortName} - Prof. {course.professor.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Tipo de Compromiso */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Tipo de Compromiso
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as TaskItem['type'])}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#b7191f]/20 focus:border-[#b7191f] text-xs font-medium text-slate-900"
            >
              <option value="Parcial">Examen Parcial</option>
              <option value="Tarea">Entrega de Tarea</option>
              <option value="Taller">Taller Práctico</option>
              <option value="Quiz">Quiz / Control de Lectura</option>
              <option value="Exposición">Exposición / Sustentación</option>
              <option value="Laboratorio">Práctica de Laboratorio</option>
              <option value="Proyecto">Proyecto de Aula</option>
              <option value="Otro">Otro (Especificar)</option>
            </select>

            {/* Si selecciona "Otro", permitir personalizar */}
            {type === 'Otro' && (
              <div className="mt-2 p-2.5 bg-red-50/70 border border-red-200/80 rounded-xl space-y-2 animate-in fade-in duration-150">
                <label className="block text-[11px] font-semibold text-[#b7191f]">
                  ¿Qué tipo de compromiso es?
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ensayo reflexivo, Lectura crítica, Foro virtual, Mesa redonda..."
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#b7191f]"
                  autoFocus
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-medium">Sugerencias:</span>
                  {['Ensayo', 'Foro evaluativo', 'Lectura', 'Mesa redonda'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setCustomType(sug)}
                      className="text-[10px] bg-white hover:bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Título del Compromiso */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Título o Tema del Compromiso *
            </label>
            <input
              type="text"
              placeholder="Ej. Parcial 1 de Modelado de Datos y SQL"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#b7191f]/20 focus:border-[#b7191f] text-xs text-slate-900 font-medium"
              required
            />
          </div>

          {/* 4. Fecha Límite con Accesos Rápidos */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Fecha de Entrega o Presentación
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#b7191f]/20 focus:border-[#b7191f] text-xs text-slate-900"
              />
            </div>
            {/* Quick buttons for mobile convenience */}
            <div className="flex items-center gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[10.5px] font-medium cursor-pointer transition-colors"
              >
                Para hoy
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[10.5px] font-medium cursor-pointer transition-colors"
              >
                Para mañana
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[10.5px] font-medium cursor-pointer transition-colors"
              >
                En 1 semana (+7d)
              </button>
            </div>
          </div>

          {/* 5. Apuntes, Instrucciones y Requisitos (Anotar notas de la tarea) */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl space-y-1.5">
            <label className="block text-xs font-semibold text-amber-950 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Apuntes e Instrucciones de la Tarea</span>
            </label>
            <p className="text-[10.5px] text-amber-800 leading-snug">
              Anota aquí requisitos pedidos por el docente, temas para estudiar, enlaces de consulta o criterios de entrega.
            </p>
            <textarea
              rows={3}
              placeholder="Ej. Estudiar capítulos 3 y 4 del libro guía. La entrega es en grupos de 2 personas en formato PDF con normas APA..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-600 text-xs text-slate-900 leading-relaxed"
            />
          </div>

          {/* 6. Registro de Calificación / Nota Obtenida (Anotar y ver notas) */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5 cursor-pointer">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Calificación Obtenida (Escala 0.0 - 5.0)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setHasGrade(!hasGrade);
                  if (!hasGrade && !grade) setGrade('4.0');
                }}
                className={`text-[10.5px] px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
                  hasGrade
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                {hasGrade ? '✓ Nota Registrada' : '+ Agregar Nota'}
              </button>
            </div>

            {hasGrade && (
              <div className="pt-1 grid grid-cols-2 gap-2.5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                    Nota (0.0 a 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5.0"
                    placeholder="Ej. 4.5"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                  {grade && !isNaN(parsedGrade) && (
                    <div className="mt-1">
                      {parsedGrade >= 3.0 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          ✓ Aprobado (UniGuajira ≥ 3.0)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          ⚠ Reprobado (&lt; 3.0)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                    Porcentaje (%) Opcional
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    placeholder="Ej. 25"
                    value={percentage}
                    onChange={e => setPercentage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                  <p className="text-[10px] text-emerald-700 mt-1">
                    Ponderación del corte (ej. 20%)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 7. Notificación y Estado de la Tarea */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            {/* Reminder switch */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-[#b7191f]" />
                <span className="text-xs font-semibold text-slate-800">
                  Recordatorio en el teléfono
                </span>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={e => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 text-[#b7191f] rounded border-slate-300 focus:ring-[#b7191f] cursor-pointer"
              />
            </label>

            {/* Completed status switch */}
            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${completed ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-800">
                  Marcar como Completada / Entregada
                </span>
              </div>
              <input
                type="checkbox"
                checked={completed}
                onChange={e => setCompleted(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
            {isEditing && onDeleteTask ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#b7191f] hover:bg-[#9c151a] active:scale-95 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {isEditing ? 'Guardar Cambios' : 'Guardar Compromiso'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
