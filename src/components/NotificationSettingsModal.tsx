import React, { useState, useEffect, useRef } from 'react';
import { ModularCourse, NotificationSettings, InAppNotification, TaskItem } from '../types';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  hasPermissionBeenAsked,
  playNotificationChime,
  dispatchNativeNotification
} from '../utils/notificationService';
import {
  requestDeviceStoragePermission,
  requestDeviceNotificationPermission,
  vibrateDevice,
  isAndroidDevice
} from '../utils/androidBridge';
import { exportBackupFile, parseBackupFile } from '../utils/backupService';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  Smartphone,
  HardDrive,
  Check,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  FileCheck
} from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  courses: ModularCourse[];
  tasks?: TaskItem[];
  onInAppAlert?: (notification: InAppNotification) => void;
  onRestoreData?: (courses: ModularCourse[], tasks: TaskItem[], settings?: NotificationSettings) => void;
  onResetOfficialSchedule?: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  courses,
  tasks = [],
  onInAppAlert,
  onRestoreData,
  onResetOfficialSchedule
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasAskedOnce, setHasAskedOnce] = useState(false);
  const [storagePersisted, setStoragePersisted] = useState<boolean>(false);
  const [isRequestingStorage, setIsRequestingStorage] = useState(false);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [testAlertStatus, setTestAlertStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supported = isNotificationSupported();

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
      setHasAskedOnce(hasPermissionBeenAsked());

      // Check current device storage persistence status
      if (typeof navigator !== 'undefined' && navigator.storage?.persisted) {
        navigator.storage.persisted().then(val => {
          setStoragePersisted(val);
        }).catch(() => {});
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestNotificationPermission = async () => {
    vibrateDevice(50);
    // Request via Android Bridge + Web Notification API
    const res = await requestDeviceNotificationPermission();
    setPermission(res);
    setHasAskedOnce(true);
    if (res === 'granted') {
      onUpdateSettings({ ...settings, enabled: true });
    }
  };

  const handleRequestStoragePermission = async () => {
    setIsRequestingStorage(true);
    vibrateDevice([60, 40, 60]);
    try {
      const res = await requestDeviceStoragePermission();
      setStoragePersisted(res.persisted || res.granted);
      setStorageMessage(res.message || 'Permiso de almacenamiento autorizado correctamente en el dispositivo.');
    } catch (e) {
      setStorageMessage('Almacenamiento listo para descargas de archivos.');
    } finally {
      setIsRequestingStorage(false);
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    if (enabled && !hasAskedOnce && permission === 'default' && supported) {
      handleRequestNotificationPermission();
    } else {
      onUpdateSettings({ ...settings, enabled });
    }
  };

  const handleSetLeadTime = (minutes: number) => {
    onUpdateSettings({ ...settings, leadTimeMinutes: minutes });
  };

  const handleTestAlert = async () => {
    vibrateDevice([150, 100, 200]);
    playNotificationChime();
    setTestAlertStatus('Enviando alerta de prueba...');

    // Try native push notification
    dispatchNativeNotification('¡Prueba de Alerta UniGuajira!', {
      body: 'Recordatorio activo: Viernes 6:00 PM - Campus Uribia.',
      tag: 'test-alert'
    });

    // Also trigger in-app banner
    if (onInAppAlert) {
      onInAppAlert({
        id: `test-${Date.now()}`,
        title: 'Prueba de Alerta de Clase (Grupo C1)',
        message: 'El sistema de sonido, vibración y recordatorios está funcionando en tu celular.',
        courseId: courses[0]?.id || '1',
        type: 'start_soon',
        timestamp: Date.now()
      });
    }

    setTestAlertStatus('¡Alerta probada con éxito (sonido, vibración y aviso)!');
    setTimeout(() => setTestAlertStatus(null), 4000);
  };

  const handleExportBackup = async () => {
    vibrateDevice(50);
    try {
      await exportBackupFile(courses, tasks, settings);
      setBackupStatus('¡Copia de seguridad descargada exitosamente!');
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (e) {
      setBackupStatus('Error al exportar la copia de seguridad.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseBackupFile(text);
        if (onRestoreData) {
          onRestoreData(parsed.courses, parsed.tasks, parsed.settings);
          setBackupStatus(`¡Respaldo restaurado! (${parsed.courses.length} materias, ${parsed.tasks.length} tareas)`);
          setTimeout(() => setBackupStatus(null), 5000);
        }
      } catch (err: any) {
        alert(err.message || 'El archivo seleccionado no es un respaldo válido.');
      }
    };
    reader.readAsText(file);
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const handleResetSchedule = () => {
    if (window.confirm('¿Deseas restablecer el horario oficial de UniGuajira? Se restaurarán las 9 asignaturas originales.')) {
      if (onResetOfficialSchedule) {
        onResetOfficialSchedule();
        setBackupStatus('Horario oficial original restablecido.');
        setTimeout(() => setBackupStatus(null), 4000);
      }
    }
  };

  return (
    <div
      id="notification-settings-modal-backdrop"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center landscape:items-center justify-center p-0 sm:p-4 landscape:p-2 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="notification-settings-modal"
        className="bg-white w-full sm:max-w-md max-h-[92vh] landscape:max-h-[92dvh] rounded-t-3xl sm:rounded-3xl landscape:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#b7191f] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#9c151a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">
                Configuración de Avisos
              </h3>
              <p className="text-[11px] text-red-100">
                Recordatorios para jornadas presenciales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-4 space-y-3.5 overflow-y-auto flex-1 min-h-0 text-xs">
          {/* 1. Permisos del Dispositivo (Android / Sistema Operativo) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#b7191f]" />
                <span>Permisos del Dispositivo Móvil (Android)</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                Android / APK
              </span>
            </div>

            {/* Permiso de Notificaciones */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11.5px]">
                  <Bell className="w-3.5 h-3.5 text-[#b7191f]" />
                  <span>Permiso de Notificaciones</span>
                </div>
                {permission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Autorizado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Pendiente
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Permite al dispositivo Android enviar recordatorios y alertas antes de que inicien tus clases presenciales.
              </p>
              {permission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestNotificationPermission}
                  className="w-full py-1.5 bg-[#b7191f] hover:bg-[#9c151a] active:scale-98 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Solicitar Permiso de Notificaciones al Dispositivo</span>
                </button>
              )}
            </div>

            {/* Permiso de Almacenamiento */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11.5px]">
                  <HardDrive className="w-3.5 h-3.5 text-[#b7191f]" />
                  <span>Permiso de Almacenamiento y Archivos</span>
                </div>
                {storagePersisted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Persistente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Listo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Autoriza al dispositivo a guardar el Horario Oficial PDF en descargas, exportar el calendario (.ICS) y conservar tus tareas sin borrado automático de caché.
              </p>
              <button
                type="button"
                disabled={isRequestingStorage}
                onClick={handleRequestStoragePermission}
                className={`w-full py-1.5 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                  storagePersisted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-800 hover:bg-black text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>
                  {storagePersisted
                    ? '✓ Almacenamiento Autorizado en el Dispositivo'
                    : 'Solicitar Permiso de Almacenamiento al Dispositivo'}
                </span>
              </button>
              {storageMessage && (
                <div className="text-[10.5px] text-emerald-700 bg-emerald-50/80 p-1.5 rounded border border-emerald-200">
                  {storageMessage}
                </div>
              )}
            </div>
          </div>

          {/* 2. Master Toggle Switch */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Recordatorios de Clase
              </span>
              <p className="text-[11px] text-slate-500">
                Avisos automáticos los viernes y sábados programados
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={e => handleToggleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#b7191f]" />
            </label>
          </div>

          {/* 3. Advance Time Selector (Lead Time) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Anticipación del recordatorio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSetLeadTime(60)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  settings.leadTimeMinutes === 60
                    ? 'border-[#b7191f] bg-slate-50 text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">1 hora antes</span>
                  <span className="text-[10px] text-slate-500">Recomendado</span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5 font-normal">
                  Tiempo para traslado al campus.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSetLeadTime(30)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  settings.leadTimeMinutes === 30
                    ? 'border-[#b7191f] bg-slate-50 text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">30 min antes</span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5 font-normal">
                  Aviso previo a la jornada.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSetLeadTime(15)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  settings.leadTimeMinutes === 15
                    ? 'border-[#b7191f] bg-slate-50 text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">15 min antes</span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5 font-normal">
                  Alerta para ingreso al aula.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSetLeadTime(120)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  settings.leadTimeMinutes === 120
                    ? 'border-[#b7191f] bg-slate-50 text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">2 horas antes</span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-0.5 font-normal">
                  Para desplazamientos largos.
                </p>
              </button>
            </div>
          </div>

          {/* 4. Extra Alert Options */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="pr-2">
                <span className="text-xs font-medium text-slate-900 block">
                  Aviso la noche anterior (8:00 PM)
                </span>
                <span className="text-[10.5px] text-slate-500 block">
                  Recordatorio para preparar material y lecturas.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.nightBeforeAlert}
                onChange={e => onUpdateSettings({ ...settings, nightBeforeAlert: e.target.checked })}
                className="w-4 h-4 text-[#b7191f] rounded border-slate-300 focus:ring-[#b7191f] cursor-pointer"
              />
            </div>

            <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between">
              <div className="pr-2">
                <span className="text-xs font-medium text-slate-900 block">
                  Sonido y vibración
                </span>
                <span className="text-[10.5px] text-slate-500 block">
                  Emite tono al recibir la alerta.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e =>
                  onUpdateSettings({
                    ...settings,
                    soundEnabled: e.target.checked,
                    vibrationEnabled: e.target.checked
                  })
                }
                className="w-4 h-4 text-[#b7191f] rounded border-slate-300 focus:ring-[#b7191f] cursor-pointer"
              />
            </div>

            {/* Botón de prueba inmediata de sonido y vibración */}
            <div className="pt-2 border-t border-slate-200/80">
              <button
                type="button"
                id="btn-test-alert-now"
                onClick={handleTestAlert}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100/80 active:bg-red-200 text-[#b7191f] border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Probar Alerta en mi Celular Ahora (Sonido + Vibración)</span>
              </button>
              {testAlertStatus && (
                <div className="mt-2 p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[11px] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{testAlertStatus}</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Backup, Portability & Reset Section */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" /> Copia de Seguridad y Datos
              </span>
              <span className="text-[10px] text-slate-500">
                Respaldo local JSON
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Guarda un archivo con todas tus materias, tareas, notas y aulas para transferirlo a otro dispositivo o recuperarlo si borras caché.
            </p>

            {backupStatus && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{backupStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Hidden file input for restore */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".json,application/json"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar copia de seguridad en archivo .json"
              >
                <Download className="w-3.5 h-3.5 text-[#b7191f]" />
                <span>Exportar Respaldo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Restaurar copia de seguridad desde un archivo .json"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Importar Respaldo</span>
              </button>
            </div>

            {onResetOfficialSchedule && (
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  ¿Quieres volver al horario original?
                </span>
                <button
                  type="button"
                  onClick={handleResetSchedule}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer Horario</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end"
        >
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-1.5 bg-[#b7191f] hover:bg-[#9c151a] active:scale-95 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Guardar y Listo
          </button>
        </div>
      </div>
    </div>
  );
};
