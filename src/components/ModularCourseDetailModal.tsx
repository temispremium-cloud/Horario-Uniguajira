import React, { useState, useEffect } from 'react';
import { ModularCourse } from '../types';
import {
  X,
  Clock,
  User,
  Calendar,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  Bookmark,
  Layers,
  GraduationCap,
  Share2
} from 'lucide-react';
import { shareCourseDetails } from '../utils/backupService';
import { vibrateDevice } from '../utils/androidBridge';
import { CourseSessionDatesTimeline } from './CourseSessionDatesTimeline';
import { toHumanTitleCase, formatCleanTimeRange } from '../utils/textUtils';

interface ModularCourseDetailModalProps {
  course: ModularCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (updated: ModularCourse) => void;
  onOpenTaskModal: (courseId: string) => void;
}

export const ModularCourseDetailModal: React.FC<ModularCourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaveCourse,
  onOpenTaskModal
}) => {
  const [classroom, setClassroom] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setClassroom(course.classroom || '');
      setNotes(course.notes || '');
      setSaved(false);
      setShareFeedback(null);
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const handleShare = async () => {
    vibrateDevice(40);
    const result = await shareCourseDetails({
      ...course,
      classroom,
      notes
    });
    if (result === 'copied') {
      setShareFeedback('¡Información copiada! Lista para pegar en WhatsApp.');
      setTimeout(() => setShareFeedback(null), 3500);
    } else if (result === 'shared') {
      setShareFeedback('¡Compartido!');
      setTimeout(() => setShareFeedback(null), 2500);
    }
  };

  const handleSave = () => {
    onSaveCourse({
      ...course,
      classroom,
      notes
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))'
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[88vh] landscape:max-h-[92dvh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Sober Slate */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-slate-300 text-[10.5px] font-medium px-2 py-0.5 rounded border border-slate-700 uppercase">
                {course.group} • Modular
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Código: {course.codeNumber}
              </span>
            </div>
            <h3 className="font-bold text-base leading-snug text-white">
              {toHumanTitleCase(course.name)}
            </h3>
            <p className="text-xs text-slate-400">
              {course.credits} Créditos • {course.hs} Horas Semanales
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 min-h-0 text-sm text-slate-700">
          {/* Key details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Docente Asignado
              </span>
              <p className="font-bold text-slate-900 text-xs mt-1">
                {toHumanTitleCase(course.professor)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Horario y Jornada
              </span>
              <p className="font-bold text-slate-900 text-xs mt-1">
                {course.day}: {formatCleanTimeRange(course.timeRange)}
              </p>
            </div>
          </div>

          {/* Scheduled Dates */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> Cronograma y Fechas Establecidas
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {course.exactDates.length} Sesiones
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              {course.datesDescription}
            </p>
            <div className="pt-1">
              <CourseSessionDatesTimeline course={course} />
            </div>
          </div>

          {/* Classroom / Location Edit */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Aula / Ubicación (Campus UniGuajira)
            </label>
            <input
              type="text"
              value={classroom}
              onChange={e => setClassroom(e.target.value)}
              placeholder="Ej: Bloque 2 - Aula 204 o Sala de Bilingüismo"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#b7191f] focus:border-[#b7191f] outline-none text-slate-900"
            />
          </div>

          {/* Notes & Topics */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Apuntes y Contenido de la Materia
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Escribe aquí enlaces a classroom, libros guía, correo docente o temas acordados..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#b7191f] focus:border-[#b7191f] outline-none resize-none text-slate-900"
            />
          </div>
          {/* Share feedback message */}
          {shareFeedback && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shareFeedback}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenTaskModal(course.id);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              + Tarea
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Compartir clase en WhatsApp o redes"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compartir</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-[#b7191f] hover:bg-[#9c151a] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Guardado
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
