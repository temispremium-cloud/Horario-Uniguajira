import React from 'react';
import {
  X,
  Bell,
  CalendarClock,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FileText,
  Download,
  Calendar,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Volume2
} from 'lucide-react';
import { MobileTab } from '../types';

interface HamburgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onOpenNotificationModal: () => void;
  notificationsEnabled: boolean;
  onDownloadPDF?: () => void;
  isDownloadingPDF?: boolean;
  onExportICS?: () => void;
  pendingTasksCount: number;
}

export const HamburgerMenuDrawer: React.FC<HamburgerMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onOpenNotificationModal,
  notificationsEnabled,
  onDownloadPDF,
  isDownloadingPDF = false,
  onExportICS,
  pendingTasksCount
}) => {
  if (!isOpen) return null;

  const handleNavClick = (tab: MobileTab) => {
    onTabChange(tab);
    onClose();
  };

  const handleInstallClick = () => {
    // Look for deferredPrompt stored on window or trigger PWA install event
    const installEvent = (window as any).__pwaInstallPrompt;
    if (installEvent && typeof installEvent.prompt === 'function') {
      installEvent.prompt();
    } else {
      // Fallback instruction
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIOS) {
        alert('Para instalar en iPhone/iPad:\n1. Toca el botón Compartir de Safari (ícono con flecha hacia arriba).\n2. Selecciona "Añadir a pantalla de inicio".');
      } else {
        alert('Para instalar en tu navegador o celular:\nToca el menú del navegador (los 3 puntos ⋮) y selecciona "Instalar aplicación" o "Añadir a pantalla principal".');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        id="hamburger-menu-drawer"
        aria-label="Menú principal de la aplicación"
        className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250 border-r border-slate-200"
      >
        {/* Header institucional del menú */}
        <div className="bg-[#b7191f] text-white p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 p-1">
              <img
                src="/icon-192.svg"
                alt="Escudo UniGuajira"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">UNIGUAJIRA</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono font-medium">
                  2026-II
                </span>
              </div>
              <p className="text-[11px] text-white/85 leading-tight mt-0.5">
                Lic. Básica Primaria • Grupo C1
              </p>
            </div>
          </div>

          <button
            id="btn-close-hamburger-menu"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          
          {/* ============================================================ */}
          {/* 1. APARTADO DE NOTIFICACIONES (REQUERIMIENTO PRINCIPAL) */}
          {/* ============================================================ */}
          <section
            id="apartado-notificaciones-menu"
            aria-labelledby="heading-notificaciones-menu"
            className="bg-red-50/60 border border-red-200/80 rounded-2xl p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#b7191f] text-white flex items-center justify-center shadow-2xs">
                  <Bell className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 id="heading-notificaciones-menu" className="text-xs font-bold text-slate-900 leading-tight">
                    Apartado de Notificaciones
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Avisos de clase y tareas
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  notificationsEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {notificationsEnabled ? 'Activas' : 'Inactivas'}
              </span>
            </div>

            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              {notificationsEnabled
                ? 'Las alertas programadas te avisarán en tu celular o computador antes de cada clase presencial (viernes y sábados).'
                : 'Activa las notificaciones para no olvidar ninguna clase presencial ni entrega de tareas.'}
            </p>

            <button
              id="btn-drawer-configurar-notificaciones"
              onClick={() => {
                onClose();
                onOpenNotificationModal();
              }}
              className="w-full py-2 px-3 bg-white text-[#b7191f] border border-red-300 hover:border-[#b7191f] hover:bg-red-50/50 active:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Volume2 className="w-4 h-4" />
              <span>Configurar Alertas y Sonidos</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-red-400" />
            </button>
          </section>

          {/* ============================================================ */}
          {/* 2. PWA: INSTALAR APLICACIÓN EN COMPUTADOR / CELULAR */}
          {/* ============================================================ */}
          <section
            id="apartado-instalacion-pwa"
            className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Instalar como Aplicación
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium">
                  Funciona sin conexión (Offline)
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Puedes instalar esta app directamente desde tu navegador en Android, iOS o Windows/Mac con acceso instantáneo desde tu pantalla de inicio.
            </p>

            <button
              id="btn-drawer-instalar-app"
              onClick={handleInstallClick}
              className="w-full py-2 px-3 bg-[#b7191f] text-white hover:bg-[#a0161b] active:scale-[0.98] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Instalar en este Dispositivo</span>
            </button>
          </section>

          {/* ============================================================ */}
          {/* 3. NAVEGACIÓN PRINCIPAL */}
          {/* ============================================================ */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
              Vistas del Horario
            </span>

            <button
              onClick={() => handleNavClick('today')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-red-50 text-[#b7191f]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-4 h-4" />
                <span>Horario de Hoy y Clase Actual</span>
              </div>
              {activeTab === 'today' && <span className="w-2 h-2 rounded-full bg-[#b7191f]" />}
            </button>

            <button
              onClick={() => handleNavClick('courses')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-red-50 text-[#b7191f]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Asignaturas Modulares (C1)</span>
              </div>
              {activeTab === 'courses' && <span className="w-2 h-2 rounded-full bg-[#b7191f]" />}
            </button>

            <button
              onClick={() => handleNavClick('calendar')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-red-50 text-[#b7191f]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4" />
                <span>Calendario de Sesiones</span>
              </div>
              {activeTab === 'calendar' && <span className="w-2 h-2 rounded-full bg-[#b7191f]" />}
            </button>

            <button
              onClick={() => handleNavClick('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-red-50 text-[#b7191f]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>Tareas y Compromisos</span>
              </div>
              {pendingTasksCount > 0 && (
                <span className="bg-[#b7191f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('official-sheet')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'official-sheet'
                  ? 'bg-red-50 text-[#b7191f]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Formato Oficial de Horarios</span>
              </div>
              {activeTab === 'official-sheet' && <span className="w-2 h-2 rounded-full bg-[#b7191f]" />}
            </button>
          </div>

          {/* ============================================================ */}
          {/* 4. EXPORTACIÓN Y ARCHIVOS */}
          {/* ============================================================ */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
              Exportación & Archivos
            </span>

            {onDownloadPDF && (
              <button
                onClick={() => {
                  onClose();
                  onDownloadPDF();
                }}
                disabled={isDownloadingPDF}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>{isDownloadingPDF ? 'Generando PDF...' : 'Descargar Horario en PDF'}</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {onExportICS && (
              <button
                onClick={() => {
                  onClose();
                  onExportICS();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Sincronizar con Google Calendar (.ics)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Footer institucional */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>UniGuajira PWA 2026-II</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.1</span>
        </div>
      </aside>
    </div>
  );
};
