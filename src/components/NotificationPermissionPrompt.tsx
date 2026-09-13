import React, { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, X } from 'lucide-react';
import {
  requestDeviceNotificationPermission,
  vibrateDevice,
  isAndroidDevice
} from '../utils/androidBridge';
import {
  requestNotificationPermission,
  playNotificationChime,
  hasPermissionBeenAsked,
  markPermissionAsked,
  dispatchNativeNotification
} from '../utils/notificationService';

interface NotificationPermissionPromptProps {
  onPermissionGranted: () => void;
  onDismiss?: () => void;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  onPermissionGranted,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Only prompt if Notification is supported and permission is not yet 'granted'
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setIsVisible(false);
        return;
      }
    }

    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem('uniguajira_notif_prompt_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
      return;
    }

    // Show after 1.5 seconds so app renders smoothly first
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handleActivate = async () => {
    setIsActivating(true);
    vibrateDevice(50);
    playNotificationChime();

    try {
      // 1. Invoke Android bridge if present
      await requestDeviceNotificationPermission();

      // 2. Request browser / WebView notification permission
      const perm = await requestNotificationPermission(true);
      markPermissionAsked();

      setIsSuccess(true);
      onPermissionGranted();

      // Test a welcome notification immediately
      dispatchNativeNotification('¡Recordatorios UniGuajira Activos!', {
        body: 'Te avisaremos antes de cada clase los viernes y sábados.',
        tag: 'uniguajira-welcome'
      });

      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } catch (err) {
      console.warn('Error activating notifications:', err);
      setIsVisible(false);
    } finally {
      setIsActivating(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('uniguajira_notif_prompt_dismissed', 'true');
    markPermissionAsked();
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      id="notification-permission-banner"
      className="bg-linear-to-r from-red-600 via-[#b7191f] to-rose-700 text-white p-3.5 sm:p-4 rounded-2xl shadow-lg border border-red-500/40 animate-fadeIn mb-4 relative overflow-hidden"
    >
      {/* Background soft glow */}
      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <BellRing className="w-5 h-5 text-amber-300 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-sm sm:text-base leading-tight">
              ¿Activar Recordatorios de Clase?
            </h4>
            <p className="text-xs text-red-100 mt-1 leading-relaxed">
              Recibe avisos en tu celular antes de iniciar cada clase los viernes y sábados, y alertas de tareas o parciales del Grupo C1.
            </p>

            {isSuccess ? (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-lg w-fit">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Recordatorios activados en este dispositivo!</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button
                  id="btn-activate-notifications-prompt"
                  onClick={handleActivate}
                  disabled={isActivating}
                  className="min-h-[40px] px-4 py-2 bg-white hover:bg-slate-100 text-[#b7191f] font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{isActivating ? 'Activando...' : 'Permitir y Activar Alertas'}</span>
                </button>
                <button
                  id="btn-dismiss-notifications-prompt"
                  onClick={handleDismiss}
                  className="min-h-[40px] px-3 py-2 text-white/80 hover:text-white text-xs font-medium rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  Ahora no
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer shrink-0"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isAndroidDevice() && !isSuccess && (
        <p className="text-[10px] text-red-200/80 mt-2 pt-2 border-t border-white/15">
          * En celulares Android se te solicitará confirmar el permiso del sistema al presionar &quot;Permitir&quot;.
        </p>
      )}
    </div>
  );
};
