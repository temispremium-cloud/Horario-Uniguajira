import React from 'react';
import { ArrowLeft, Menu, Bell, Download, FileText, MonitorSmartphone } from 'lucide-react';
import { vibrateDevice } from '../utils/androidBridge';
import { MobileTab } from '../types';

interface MobileTopHeaderProps {
  onDownloadPDF?: () => void;
  isDownloadingPDF?: boolean;
  onExportICS?: () => void;
  onOpenNotificationModal: () => void;
  notificationsEnabled: boolean;
  onOpenInstallModal?: () => void;
  appIcon?: string;
  onGoHome?: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
  onOpenHamburgerMenu?: () => void;
  activeTab?: MobileTab;
  onTabChange?: (tab: MobileTab) => void;
  pendingTasksCount?: number;
}

export const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({
  onDownloadPDF,
  isDownloadingPDF = false,
  onOpenNotificationModal,
  notificationsEnabled,
  onOpenInstallModal,
  appIcon = '/icon-192.svg',
  onGoHome,
  canGoBack = false,
  onBack,
  onOpenHamburgerMenu,
  activeTab = 'today',
  onTabChange,
  pendingTasksCount = 0
}) => {
  const handleBackClick = () => {
    vibrateDevice(30);
    if (onBack) {
      onBack();
    } else if (onGoHome) {
      onGoHome();
    }
  };

  const handleHamburgerClick = () => {
    vibrateDevice(25);
    if (onOpenHamburgerMenu) {
      onOpenHamburgerMenu();
    }
  };

  return (
    <header
      id="mobile-top-header"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
      className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-2xs"
    >
      <div className="max-w-md landscape:max-w-4xl md:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5">
        
        {/* Left Controls: Hamburger Menu Button & Optional Back Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* BOTÓN MENÚ HAMBURGUESA (Requerimiento explícito del usuario) */}
          <button
            id="btn-header-hamburger"
            onClick={handleHamburgerClick}
            className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-slate-200/80"
            title="Abrir Menú Principal y Notificaciones"
            aria-label="Abrir Menú Hamburguesa"
          >
            <Menu className="w-5 h-5 text-slate-800 stroke-[2.2px]" />
          </button>

          {/* Volver button when inside sub-views */}
          {canGoBack && (
            <button
              id="btn-header-back"
              onClick={handleBackClick}
              className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200/80 shrink-0 transition-transform active:scale-95 select-none"
              title="Volver a la vista anterior"
              aria-label="Volver atrás"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700 stroke-[2.5px]" />
              <span className="hidden sm:inline">Volver</span>
            </button>
          )}
        </div>

        {/* Branding (Clicking returns to home) */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
          title="Ir al inicio"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center bg-white rounded-xl border border-slate-200/90 p-0.5 overflow-hidden shadow-2xs">
            <img
              src={appIcon}
              alt="Escudo oficial UniGuajira"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="font-bold text-slate-900 text-xs sm:text-base leading-tight truncate">
                Horario UniGuajira
              </h1>
              <span className="bg-red-50 text-[#b7191f] text-[10px] sm:text-[10.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border border-red-200/70 shrink-0">
                Grupo C1
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">
              Licenciatura Básica Primaria • Uribia
            </p>
          </div>
        </div>

        {/* Center/Right Desktop Navigation (Visible on Computer / md:flex) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 shrink-0">
            <button
              onClick={() => onTabChange('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-white text-[#b7191f] shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => onTabChange('courses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-white text-[#b7191f] shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Materias
            </button>
            <button
              onClick={() => onTabChange('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-[#b7191f] shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fechas
            </button>
            <button
              onClick={() => onTabChange('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-white text-[#b7191f] shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Tareas</span>
              {pendingTasksCount > 0 && (
                <span className="bg-[#b7191f] text-white text-[9.5px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingTasksCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onTabChange('official-sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'official-sheet'
                  ? 'bg-white text-[#b7191f] shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoja PDF
            </button>
          </nav>
        )}

        {/* Right Actions: Install PWA & Notifications Bell */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenInstallModal && (
            <button
              id="btn-header-install-app"
              onClick={onOpenInstallModal}
              className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Instalar como aplicación en PC (Computador) o Celular"
              aria-label="Instalar como aplicación en PC o Celular"
            >
              <MonitorSmartphone className="w-4 h-4 text-white shrink-0" />
              <span className="hidden sm:inline font-bold">Instalar App</span>
            </button>
          )}

          <button
            id="btn-header-notifications"
            onClick={onOpenNotificationModal}
            className={`min-h-[40px] min-w-[40px] p-2 rounded-xl text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative border ${
              notificationsEnabled
                ? 'bg-red-50 text-[#b7191f] border-red-200 hover:bg-red-100/80 active:scale-95'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95'
            }`}
            title={notificationsEnabled ? 'Recordatorios activos (toca para configurar)' : 'Activar notificaciones de clase'}
            aria-label="Configurar notificaciones y recordatorios"
          >
            <Bell className="w-5 h-5" />
            {notificationsEnabled && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
