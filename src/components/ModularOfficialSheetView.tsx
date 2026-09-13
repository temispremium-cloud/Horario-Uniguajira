import React, { useState } from 'react';
import { ModularCourse } from '../types';
import { CheckCircle2, Download, Loader2, Share2 } from 'lucide-react';
import { UniGuajiraLogo } from './UniGuajiraLogo';
import { exportElementToPDF, ExportPDFResult } from '../utils/pdfExporter';
import { PDFExportModal } from './PDFExportModal';
import { vibrateDevice } from '../utils/androidBridge';

interface ModularOfficialSheetViewProps {
  courses: ModularCourse[];
  onSelectCourse: (course: ModularCourse) => void;
  selectedModule: 'all' | 'Septiembre - Octubre' | 'Octubre' | 'Noviembre';
  onSelectModule: (module: 'all' | 'Septiembre - Octubre' | 'Octubre' | 'Noviembre') => void;
}

export const ModularOfficialSheetView: React.FC<ModularOfficialSheetViewProps> = ({
  courses,
  onSelectCourse,
  selectedModule,
  onSelectModule
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportResult, setExportResult] = useState<ExportPDFResult | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [pdfOrientation, setPdfOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const handleDownloadPDF = async () => {
    const el = document.getElementById('modular-official-sheet');
    if (!el) return;
    vibrateDevice(50);
    setIsExportingPDF(true);
    try {
      const isLandscape = pdfOrientation === 'landscape';
      const res = await exportElementToPDF(el, {
        filename: `Horario_Oficial_UniGuajira_C1_${isLandscape ? 'Horizontal' : 'Vertical'}.pdf`,
        landscape: isLandscape
      });
      setExportResult(res);
      setDownloadSuccess(true);
      // Open the interactive preview & save sheet immediately
      setIsExportModalOpen(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Hubo un inconveniente al generar el documento. Por favor intenta de nuevo.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getCourseById = (id: string | null) => {
    if (!id) return null;
    return courses.find(c => c.id === id) || null;
  };

  // Filtered courses for the detailed list below
  const displayedCourses = selectedModule === 'all'
    ? courses
    : courses.filter(c => c.moduleName === selectedModule);

  return (
    <div className="space-y-4">
      {/* Institutional @page orientation rule */}
      <style>{`
        @page {
          size: ${pdfOrientation};
          margin: ${pdfOrientation === 'landscape' ? '6mm 8mm' : '8mm 10mm'};
        }
      `}</style>

      {/* Control bar limpia y optimizada para móvil y PC */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de módulo */}
          <div className="flex items-center gap-2">
            <label htmlFor="select-module-sheet" className="text-xs font-semibold text-slate-700 shrink-0">
              Módulo:
            </label>
            <select
              id="select-module-sheet"
              value={selectedModule}
              onChange={e => onSelectModule(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none cursor-pointer transition-colors"
            >
              <option value="all">Todos ({courses.length})</option>
              <option value="Septiembre - Octubre">Módulo I</option>
              <option value="Octubre">Módulo II</option>
              <option value="Noviembre">Módulo III</option>
            </select>
          </div>

          {/* Selector de Orientación del PDF (Horizontal vs Vertical) */}
          <div className="flex items-center gap-2">
            <label htmlFor="select-orientation-sheet" className="text-xs font-semibold text-slate-700 shrink-0">
              Orientación PDF:
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setPdfOrientation('landscape')}
                className={`px-2.5 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                  pdfOrientation === 'landscape'
                    ? 'bg-white text-[#b7191f] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Formato horizontal: Llena la hoja completa, texto grande y máxima legibilidad"
              >
                Horizontal (Recomendado)
              </button>
              <button
                type="button"
                onClick={() => setPdfOrientation('portrait')}
                className={`px-2.5 py-1.5 rounded-md font-semibold cursor-pointer transition-all ${
                  pdfOrientation === 'portrait'
                    ? 'bg-white text-[#b7191f] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Formato vertical"
              >
                Vertical
              </button>
            </div>
          </div>
        </div>

        {/* Botón principal grande fácil de presionar */}
        <button
          id="btn-download-official-pdf"
          onClick={handleDownloadPDF}
          disabled={isExportingPDF}
          className="w-full md:w-auto min-h-[44px] px-5 py-2.5 bg-[#b7191f] hover:bg-[#9c151a] active:bg-[#851216] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer select-none"
          title="Descargar horario oficial en formato PDF institucional"
        >
          {isExportingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generando PDF {pdfOrientation === 'landscape' ? 'Horizontal' : 'Vertical'}...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>¡PDF Descargado!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Descargar PDF ({pdfOrientation === 'landscape' ? 'Horizontal' : 'Vertical'})</span>
            </>
          )}
        </button>
      </div>

      {/* OFFICIAL UNIVERSITY SHEET */}
      <div id="modular-official-sheet" className="sheet-container max-w-[1150px] mx-auto bg-white p-4 sm:p-8 shadow-xl border border-gray-300 rounded-lg text-black overflow-x-auto print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
        {/* Top Header UniGuajira */}
        <div className="flex items-start justify-between gap-2 print:gap-1">
          {/* Logo Oficial Universidad de La Guajira */}
          <div className="w-[80px] sm:w-[95px] print:w-[65px] text-center select-none shrink-0 flex flex-col items-center justify-center pt-0.5">
            <UniGuajiraLogo width={46} height={69} />
          </div>

          {/* Center Titles */}
          <div className="text-center flex-1">
            <h1 className="text-[18px] sm:text-[22px] print:text-[15px] font-bold tracking-wide uppercase my-0.5 text-gray-900">
              UNIVERSIDAD DE LA GUAJIRA
            </h1>
            <div className="text-[11.5px] print:text-[9.5px] my-0 text-gray-800 font-medium">
              NIT: 892115029-4 <span className="hidden print:inline">•</span> <span className="print:hidden"><br /></span> Telefono: (5) 728 2729
            </div>
          </div>

          {/* Right Info */}
          <div className="w-[120px] sm:w-[150px] print:w-[110px] text-[10.5px] print:text-[9px] text-left shrink-0">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.2 px-1">Pag:</td>
                  <td className="py-0.2 px-1">1</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.2 px-1">Impreso:</td>
                  <td className="py-0.2 px-1">11/08/2026</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-0.2 px-1">10:35 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr className="border-none border-t-2 border-[#1a1a1a] my-1 print:my-0.5" />
        <div className="text-center font-bold text-[14px] print:text-[12px] my-0.5 text-black">
          Horario Estudiante
        </div>
        <div className="text-center text-[11.5px] print:text-[9.5px] text-gray-700 -mt-1 mb-2 print:mb-0.5 font-medium">
          Licenciatura en Educación Básica Primaria • Grupo C1 (Viernes y Sábados)
        </div>
        <hr className="border-none border-t border-[#1a1a1a] mt-0.5 mb-1.5 print:mb-1" />

        {/* ========================================================================= */}
        {/* RESTRUCTURED OFFICIAL CUADRO (TABLE) WITHOUT LUNES - JUEVES               */}
        {/* ========================================================================= */}

        {/* ================= MATRIZ CONSOLIDADA OFICIAL ================= */}
          <div className="overflow-x-auto print:overflow-visible mb-3 print:mb-1">
            <table className="w-full border-collapse text-[11px] print:text-[9.5px] min-w-[760px] print:min-w-0 print:w-full">
              <thead>
                <tr>
                  <th className="bg-[#e4e4e4] border border-[#999] py-1.5 px-2 print:py-0.5 print:px-1 text-[12px] print:text-[10px] font-bold text-black w-[80px]">
                    Día
                  </th>
                  <th className="bg-[#e4e4e4] border border-[#999] py-1.5 px-2 print:py-0.5 print:px-1 text-[12px] print:text-[10px] font-bold text-black w-[125px]">
                    Horario
                  </th>
                  <th className="bg-[#e4e4e4] border border-[#999] py-1.5 px-2 print:py-0.5 print:px-1 text-[12px] print:text-[10px] font-bold text-black">
                    <div>MÓDULO I (Septiembre - Octubre)</div>
                    <div className="text-[10px] print:text-[8.5px] font-normal text-gray-700">
                      11, 12, 18, 19, 25, 26 Sep y 2, 3 Oct
                    </div>
                  </th>
                  <th className="bg-[#e4e4e4] border border-[#999] py-1.5 px-2 print:py-0.5 print:px-1 text-[12px] print:text-[10px] font-bold text-black">
                    <div>MÓDULO II (Octubre)</div>
                    <div className="text-[10px] print:text-[8.5px] font-normal text-gray-700">
                      9, 10, 16, 17, 23, 24, 30 y 31 Oct
                    </div>
                  </th>
                  <th className="bg-[#e4e4e4] border border-[#999] py-1.5 px-2 print:py-0.5 print:px-1 text-[12px] print:text-[10px] font-bold text-black">
                    <div>MÓDULO III (Noviembre)</div>
                    <div className="text-[10px] print:text-[8.5px] font-normal text-gray-700">
                      6, 13, 20 y 27 Noviembre
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Viernes Row */}
                <tr>
                  <td className="bg-[#f0f0f0] font-bold text-center border border-[#999] py-1.5 px-1 print:py-0.5 text-[12px] print:text-[9.5px] text-gray-900">
                    Viernes
                  </td>
                  <td className="bg-[#dbeef2] font-bold text-center border border-[#999] py-1.5 px-1 print:py-0.5 text-[11px] print:text-[9px] text-gray-900">
                    14:45-17:00
                    <div className="text-[9.5px] print:text-[8px] font-normal text-gray-700">2:45 PM - 5:00 PM</div>
                  </td>

                  {/* Mod 1 - Friday */}
                  {(() => {
                    const c = getCourseById('mod-1');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}

                  {/* Mod 2 - Friday */}
                  {(() => {
                    const c = getCourseById('mod-5');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}

                  {/* Mod 3 - Friday */}
                  {(() => {
                    const c = getCourseById('mod-9');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}
                </tr>

                {/* Sábado Row 1: 07:00 - 09:15 */}
                <tr>
                  <td
                    rowSpan={3}
                    className="bg-[#f0f0f0] font-bold text-center border border-[#999] py-2 px-1 text-[12px] text-gray-900"
                  >
                    Sábado
                    <div className="text-[9.5px] font-normal text-gray-600 mt-1">Jornada Continua</div>
                  </td>
                  <td className="bg-[#dbeef2] font-bold text-center border border-[#999] py-2 px-1 text-[11px] text-gray-900">
                    07:00-09:15
                    <div className="text-[9.5px] font-normal text-gray-700">7:00 AM - 9:15 AM</div>
                  </td>

                  {/* Mod 1 - Sat slot 1 */}
                  {(() => {
                    const c = getCourseById('mod-2');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}

                  {/* Mod 2 - Sat slot 1 */}
                  {(() => {
                    const c = getCourseById('mod-6');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}

                  {/* Mod 3 - Sat slot 1 (Empty) */}
                  <td
                    rowSpan={3}
                    className="border border-[#999] p-2 align-middle text-center bg-gray-50/70 text-gray-400 italic text-[11px]"
                  >
                    Sin asignaturas sabatinas programadas en Módulo III
                    <div className="text-[9.5px] text-gray-400 not-italic mt-1">
                      (Periodo autónomo de investigación y práctica docente)
                    </div>
                  </td>
                </tr>

                {/* Sábado Row 2: 09:30 - 11:45 */}
                <tr>
                  <td className="bg-[#dbeef2] font-bold text-center border border-[#999] py-2 px-1 text-[11px] text-gray-900">
                    09:30-11:45
                    <div className="text-[9.5px] font-normal text-gray-700">9:30 AM - 11:45 AM</div>
                  </td>

                  {/* Mod 1 - Sat slot 2 */}
                  {(() => {
                    const c = getCourseById('mod-3');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}

                  {/* Mod 2 - Sat slot 2 */}
                  {(() => {
                    const c = getCourseById('mod-7');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}
                </tr>

                {/* Sábado Row 3: 12:45 - 15:00 */}
                <tr>
                  <td className="bg-[#dbeef2] font-bold text-center border border-[#999] py-2 px-1 text-[11px] text-gray-900">
                    12:45-15:00
                    <div className="text-[9.5px] font-normal text-gray-700">12:45 PM - 03:00 PM</div>
                  </td>

                  {/* Mod 1 - Sat slot 3 */}
                  {(() => {
                    const c = getCourseById('mod-4');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}

                  {/* Mod 2 - Sat slot 3 */}
                  {(() => {
                    const c = getCourseById('mod-8');
                    return (
                      <td
                        onClick={() => c && onSelectCourse(c)}
                        className="border border-[#999] p-1.5 align-middle cursor-pointer hover:brightness-95 transition-all text-center"
                        style={{ backgroundColor: c?.color || '#fff' }}
                      >
                        {c && (
                          <div>
                            <div className="font-bold text-gray-950 text-[11.5px] leading-tight">
                              [{c.group}] {c.name}
                            </div>
                            <div className="text-[10px] text-gray-700 font-semibold mt-0.5">
                              Docente: {c.professor}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })()}
                </tr>
              </tbody>
            </table>
          </div>

        {/* ========================================================================= */}
        {/* EL APARTADO QUE TE GUSTA TANTO: MATERIAS, DOCENTES, FECHAS Y AULAS        */}
        {/* ========================================================================= */}
        <div className="mt-2.5 pt-1.5 print:mt-1 print:pt-0.5 border-t-2 border-[#1a1a1a]">
          <div className="text-[12px] print:text-[10px] font-bold text-gray-900 uppercase tracking-wide mb-1.5 print:mb-0.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>Detalle de Asignaturas, Docentes, Fechas y Aulas</span>
              <span className="text-xs font-normal text-gray-600 lowercase">
                ({displayedCourses.length} de {courses.length} asignaturas)
              </span>
            </div>

          </div>

          {/* Grid de Asignaturas de 2 Columnas (Óptimo para visualización y PDF) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5 print:grid-cols-2 print:gap-x-2 print:gap-y-1.5">
            {displayedCourses.map(course => (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="border border-gray-300 rounded p-2 print:p-1 text-[11px] print:text-[9.5px] hover:bg-amber-50/50 cursor-pointer transition-colors bg-white select-none leading-snug break-inside-avoid shadow-2xs print:shadow-none"
                title="Haz clic para ver o editar aula y apuntes"
              >
                {/* Fila 1: Materia */}
                <div className="flex items-start gap-1.5">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0 mt-0.5 border border-[#888]"
                    style={{ backgroundColor: course.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-gray-900">Materia: </span>
                    <span className="text-[#1a3a8f] font-bold">[{course.group}] {course.name}</span>
                    <span className="text-gray-500 text-[10px] print:text-[8.5px] ml-1 whitespace-nowrap">
                      ({course.codeNumber} • {course.credits}Cr)
                    </span>
                  </div>
                </div>

                {/* Fila 2: Docente y Aula */}
                <div className="flex items-center justify-between gap-2 text-[10.5px] print:text-[9px] mt-0.5 pl-4.5 text-gray-800">
                  <div className="truncate">
                    <span className="font-bold text-gray-900">Docente: </span>
                    <span className="text-[#1a3a8f] font-medium">{course.professor}</span>
                  </div>
                  <div className="shrink-0 text-gray-700">
                    <span className="font-bold text-gray-900">Aula: </span>
                    <span className="italic font-medium">{course.classroom || 'Por asignar'}</span>
                  </div>
                </div>

                {/* Fila 3: Fechas */}
                <div className="flex items-center gap-1.5 text-[10.5px] print:text-[9px] mt-0.5 pl-4.5 text-gray-800 leading-tight">
                  <span className="font-bold text-gray-900 shrink-0">Fechas: </span>
                  <span className="bg-emerald-50 text-emerald-900 font-bold px-1.5 py-0.2 rounded text-[9.5px] print:text-[8.5px] border border-emerald-200 shrink-0">
                    {course.day}: {course.timeRange}
                  </span>
                  <span className="text-gray-700 text-[10px] print:text-[8.5px] truncate">
                    {course.datesDescription}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN OFICIAL DE VALIDACIÓN INSTITUCIONAL Y FIRMAS (LLENA LA HOJA)      */}
        {/* ========================================================================= */}
        <div className="border-t border-gray-400 pt-2 mt-3.5 print:mt-2">
          {/* Resumen Académico */}
          <div className="bg-gray-50 border border-gray-300 rounded p-1.5 text-[11px] print:text-[9.5px] mb-2 print:mb-1.5 flex flex-wrap items-center justify-between gap-2 text-gray-800">
            <div>
              <span className="font-bold text-gray-900">Total Asignaturas:</span> 9 materias
            </div>
            <div>
              <span className="font-bold text-gray-900">Total Créditos Académicos:</span> 18 créditos (2 por asignatura)
            </div>
            <div>
              <span className="font-bold text-gray-900">Periodo:</span> 2026-II • Semestre Modular Concentrado
            </div>
            <div>
              <span className="font-bold text-gray-900">Modalidad:</span> Presencial (Viernes y Sábados)
            </div>
          </div>

          {/* Firmas Institucionales */}
          <div className="grid grid-cols-3 gap-4 pt-1 pb-1 text-center text-[10.5px] print:text-[9px] text-gray-700 break-inside-avoid">
            <div className="flex flex-col items-center justify-end">
              <div className="w-36 border-b border-black mb-1"></div>
              <div className="font-bold text-black">Firma del Estudiante</div>
              <div className="text-[9.5px] print:text-[8px] text-gray-500">C.C. / T.I. Estudiante</div>
            </div>
            <div className="flex flex-col items-center justify-end">
              <div className="w-36 border-b border-black mb-1"></div>
              <div className="font-bold text-black">Coordinación de Licenciatura</div>
              <div className="text-[9.5px] print:text-[8px] text-gray-500">Facultad de Ciencias de la Educación</div>
            </div>
            <div className="flex flex-col items-center justify-end">
              <div className="w-36 border-b border-black mb-1"></div>
              <div className="font-bold text-black">Registro y Control Académico</div>
              <div className="text-[9.5px] print:text-[8px] text-gray-500">Sello Oficial Institucional</div>
            </div>
          </div>
        </div>

        {/* Footer Oficial Institucional */}
        <div className="flex justify-between items-center mt-2.5 print:mt-1 text-[11px] print:text-[9px] border-t border-[#999] pt-1.5 print:pt-0.5 font-bold text-gray-800">
          <div>Universidad de La Guajira • Vicerrectoría Académica • Horario Estudiante</div>
          <div>CL SMA LTD</div>
          <div>Pag: 1</div>
        </div>
      </div>

      {/* Modal interactivo de previsualización y descarga para Android y Móviles */}
      <PDFExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pdfBlob={exportResult?.pdfBlob || null}
        imgData={exportResult?.imgData || null}
        pdfBase64={exportResult?.pdfBase64}
        filename="Horario_Oficial_UniGuajira_Licenciatura_C1.pdf"
      />
    </div>
  );
};
