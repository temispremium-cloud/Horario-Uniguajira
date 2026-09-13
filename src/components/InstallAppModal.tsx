import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  WifiOff,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  isAppInstalled,
  isRunningInIframe,
  getDevicePlatform,
  triggerPWAInstall,
  subscribeToInstallPrompt,
  BeforeInstallPromptEvent
} from '../utils/pwaInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onInstalled
}) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [hasPrompt, setHasPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isDesktop: true,
    isWindows: false,
    isMac: false,
    browserName: 'Chrome' as 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Other'
  });

  useEffect(() => {
    if (!isOpen) return;

    const platform = getDevicePlatform();
    setDeviceInfo(platform);
    setInstalled(isAppInstalled());
    setIsIframe(isRunningInIframe());

    // Auto-select tab according to current detected device
    if (platform.isIOS) {
      setActiveTab('ios');
    } else if (platform.isAndroid) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    const unsubscribe = subscribeToInstallPrompt((prompt: BeforeInstallPromptEvent | null) => {
      setHasPrompt(Boolean(prompt));
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await triggerPWAInstall();
    if (res.success) {
      setInstallSuccess(true);
      setInstalled(true);
      if (onInstalled) onInstalled();
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  const handleOpenInNewTab = () => {
    try {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    } catch {
      // Fallback
    }
  };

  return (
    <div
      id="modal-instalar-app"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header Institucional */}
        <div className="bg-[#b7191f] text-white p-4 sm:p-5 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="/icon-192.svg"
                alt="Logo UniGuajira"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="install-modal-title" className="text-base font-bold tracking-tight text-white">
                  Instalar Aplicación
                </h2>
                <span className="text-[10.5px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  PWA
                </span>
              </div>
              <p className="text-xs text-white/90 leading-tight mt-0.5">
                Disponible para Computador (PC / Laptop) y Celular
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana de instalación"
            className="p-1.5 rounded-lg hover:bg-white/15 active:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-800">
          
          {/* Status Banners */}
          {installed ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">¡Aplicación instalada en este dispositivo!</p>
                <p className="text-[11px] text-emerald-700 leading-snug mt-0.5">
                  Esta aplicación ya se encuentra instalada en tu sistema y puede iniciarse directamente desde tu Escritorio o pantalla de inicio en modo independiente.
                </p>
              </div>
            </div>
          ) : installSuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start gap-2.5 text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">¡Instalación completada con éxito!</p>
                <p className="text-[11px] text-emerald-700 leading-snug mt-0.5">
                  Se ha añadido el acceso directo a tu equipo. Ahora puedes usarla sin conexión.
                </p>
              </div>
            </div>
          ) : hasPrompt ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#b7191f] text-white flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Instalación rápida disponible</p>
                  <p className="text-[11px] text-slate-600">Instala con 1 solo clic en tu navegador actual.</p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 bg-[#b7191f] hover:bg-[#9c151a] active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar Ahora</span>
              </button>
            </div>
          ) : isIframe ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-3 text-amber-900">
              <div className="text-xs space-y-1">
                <p className="font-bold">¿Navegas en vista previa o ventana integrada?</p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Los navegadores (Chrome / Edge) habilitan el botón de instalación al abrir la aplicación en su propia pestaña completa.
                </p>
              </div>
              <button
                onClick={handleOpenInNewTab}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Pestaña</span>
              </button>
            </div>
          ) : null}

          {/* Platform Switcher Tabs */}
          <div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white text-[#b7191f] shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Computador / PC</span>
                {deviceInfo.isDesktop && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7191f]" title="Tu dispositivo actual" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-[#b7191f] shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
                {deviceInfo.isAndroid && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7191f]" title="Tu dispositivo actual" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white text-[#b7191f] shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
                {deviceInfo.isIOS && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b7191f]" title="Tu dispositivo actual" />
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: COMPUTADOR / PC (WINDOWS, MAC, LINUX) */}
          {activeTab === 'desktop' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#b7191f]" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Instalación en PC / Laptop (Google Chrome, Microsoft Edge, Brave)
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">Busca el ícono de instalación en la barra superior</p>
                      <p className="text-[11px] text-slate-600">
                        En la barra de direcciones de tu navegador (a la derecha, junto a la estrella de favoritos), verás un ícono con forma de <strong>computador con flecha</strong> o un símbolo <strong>(+)</strong> que dice <em>"Instalar Horario UniGuajira"</em>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">O desde el menú principal del navegador</p>
                      <p className="text-[11px] text-slate-600">
                        Haz clic en los <strong>tres puntos (⋮)</strong> en Chrome o <strong>(...)</strong> en Edge y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Aplicaciones &gt; Instalar este sitio como aplicación"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">Confirmar Instalación</p>
                      <p className="text-[11px] text-slate-600">
                        Haz clic en <strong>"Instalar"</strong>. Se creará un acceso directo en tu Escritorio y Menú Inicio de Windows/Mac. Se ejecutará en su propia ventana sin barras ni pestañas.
                      </p>
                    </div>
                  </div>
                </div>

                {hasPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-3 bg-[#b7191f] hover:bg-[#9c151a] active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Lanzar Diálogo de Instalación en este PC</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CELULAR ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#b7191f]" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Instalación en Celular Android (Chrome, Samsung Internet, Edge)
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">Toca el botón o abre el menú</p>
                      <p className="text-[11px] text-slate-600">
                        Toca el botón "Instalar Ahora" abajo o toca los <strong>tres puntos verticales (⋮)</strong> en la esquina superior derecha de tu navegador Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">Selecciona "Instalar aplicación"</p>
                      <p className="text-[11px] text-slate-600">
                        Elige <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla principal"</strong> en la lista de opciones.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">Listo en tu pantalla de inicio</p>
                      <p className="text-[11px] text-slate-600">
                        El icono de UniGuajira aparecerá junto a tus demás aplicaciones de Android, abriéndose en pantalla completa como una app nativa.
                      </p>
                    </div>
                  </div>
                </div>

                {hasPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-3 bg-[#b7191f] hover:bg-[#9c151a] active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar en este Celular</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE / IPAD (IOS) */}
          {activeTab === 'ios' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-[#b7191f]" />
                  <h3 className="text-xs font-bold text-slate-900">
                    Instalación en iPhone / iPad (Navegador Safari)
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">Abre la app en Safari</p>
                      <p className="text-[11px] text-slate-600">
                        Apple requiere usar el navegador <strong>Safari</strong> para instalar aplicaciones en la pantalla de inicio.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">Toca el botón Compartir</p>
                      <p className="text-[11px] text-slate-600">
                        En la barra de herramientas inferior de Safari, toca el ícono de <strong>Compartir</strong> (un cuadrado con una flecha apuntando hacia arriba 📤).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-[#b7191f] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900">"Añadir a pantalla de inicio"</p>
                      <p className="text-[11px] text-slate-600">
                        Desplázate hacia abajo en la lista y toca <strong>"Añadir a pantalla de inicio"</strong>. Luego pulsa <strong>"Añadir"</strong> en la esquina superior derecha.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ventajas Institucionales */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Ventajas de instalar la aplicación
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 text-[11.5px]">100% Offline</p>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    Consulta horarios, salones y notas sin conexión a internet.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2">
                <Layers className="w-4 h-4 text-[#b7191f] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 text-[11.5px]">Ventana Independiente</p>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    En PC y móvil funciona sin barras de navegador ni pestañas.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PWA Oficial UniGuajira • Gratuita y Segura</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
