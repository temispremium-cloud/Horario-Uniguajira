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
      className="bg-white text-slate-800 p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200/90 animate-fadeIn mb-3 relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 mt-0.5">
            <BellRing className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug">
              ¿Activar recordatorios de clase?
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
              Recibe avisos antes de iniciar cada clase de los viernes y sábados, y alertas para parciales del Grupo C1.
            </p>

            {isSuccess ? (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recordatorios activados en este dispositivo</span>
              </div>
            ) : (
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <button
                  id="btn-activate-notifications-prompt"
                  onClick={handleActivate}
                  disabled={isActivating}
                  className="min-h-[34px] px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <BellRing className="w-3 h-3" />
                  <span>{isActivating ? 'Activando...' : 'Permitir alertas'}</span>
                </button>
                <button
                  id="btn-dismiss-notifications-prompt"
                  onClick={handleDismiss}
                  className="min-h-[34px] px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Ahora no
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer shrink-0 transition-colors"
          aria-label="Cerrar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isAndroidDevice() && !isSuccess && (
        <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
          En Android se te solicitará confirmar el permiso del sistema al presionar &quot;Permitir alertas&quot;.
        </p>
      )}
    </div>
  );
};
