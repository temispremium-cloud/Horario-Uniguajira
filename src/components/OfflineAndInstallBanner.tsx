import React, { useState, useEffect } from 'react';
import { WifiOff, Download, X, MonitorSmartphone, CheckCircle } from 'lucide-react';
import { isAppInstalled } from '../utils/pwaInstall';

interface OfflineAndInstallBannerProps {
  onInstallSuccess?: () => void;
  onOpenInstallModal?: () => void;
}

export const OfflineAndInstallBanner: React.FC<OfflineAndInstallBannerProps> = ({
  onInstallSuccess,
  onOpenInstallModal
}) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(() => {
    try {
      return localStorage.getItem('uniguajira_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    if (isAppInstalled()) {
      setShowInstallBanner(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__pwaInstallPrompt = e;
      if (!dismissedInstall) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      if (onInstallSuccess) onInstallSuccess();
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissedInstall, onInstallSuccess]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (onOpenInstallModal) {
        onOpenInstallModal();
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
        setInstalledSuccess(true);
        if (onInstallSuccess) onInstallSuccess();
      }
      setDeferredPrompt(null);
    } catch (e) {
      console.warn('Error displaying install prompt:', e);
      if (onOpenInstallModal) onOpenInstallModal();
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDismissedInstall(true);
    try {
      localStorage.setItem('uniguajira_pwa_banner_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  const hasContent = isOffline || installedSuccess || (showInstallBanner && !isOffline);
  if (!hasContent) {
    return null;
  }

  return (
    <aside aria-label="Avisos del sistema" className="no-print space-y-2 mb-2.5 px-3 sm:px-4 max-w-4xl mx-auto pt-2">
      {/* Offline Status Alert Pill */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="bg-amber-800 text-amber-50 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2.5 border border-amber-700 shadow-sm animate-in fade-in slide-in-from-top duration-200"
        >
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="font-medium text-[11.5px] leading-tight">
              Modo sin conexión • Tu horario y notas están disponibles 100% offline
            </span>
          </div>
          <span className="text-[10px] bg-amber-900/80 px-2 py-0.5 rounded font-mono uppercase tracking-wider shrink-0">
            Offline
          </span>
        </div>
      )}

      {/* Installed Successfully Toast */}
      {installedSuccess && (
        <div
          role="status"
          className="bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-emerald-600 shadow-sm animate-in fade-in"
        >
          <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
          <span className="font-medium text-[11.5px]">
            ¡Aplicación instalada con éxito en tu dispositivo!
          </span>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && !isOffline && (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-md flex items-center justify-between gap-2.5 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#b7191f] flex items-center justify-center text-white shrink-0">
              <MonitorSmartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Instalar App en PC o Celular
              </p>
              <p className="text-[10.5px] text-slate-300 truncate">
                Accede a tu horario sin internet desde tu pantalla de inicio o escritorio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 bg-[#b7191f] hover:bg-[#9c151a] active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Ocultar aviso"
              aria-label="Cerrar aviso de instalación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
