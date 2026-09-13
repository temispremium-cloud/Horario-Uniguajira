import React, { useEffect } from 'react';
import { InAppNotification } from '../types';
import { Bell, X, ChevronRight, Clock } from 'lucide-react';

interface InAppNotificationBannerProps {
  notification: InAppNotification | null;
  onClose: () => void;
  onClick?: (courseId?: string) => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  notification,
  onClose,
  onClick
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div
      id="in-app-notification-banner"
      style={{
        top: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        left: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        right: 'max(0.75rem, env(safe-area-inset-right, 0px))'
      }}
      className="fixed z-50 max-w-md md:max-w-lg mx-auto bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 animate-in slide-in-from-top duration-200 transition-all cursor-pointer"
      onClick={() => {
        if (onClick) onClick(notification.courseId);
        onClose();
      }}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#b7191f] flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase border border-slate-700">
              Aviso Académico
            </span>
            <span className="text-[10.5px] text-slate-400 font-normal flex items-center gap-1">
              <Clock className="w-3 h-3" /> Ahora
            </span>
          </div>

          <h4 className="font-semibold text-xs text-white leading-snug mt-1 truncate">
            {notification.title}
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-tight line-clamp-2">
            {notification.body}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 shrink-0 cursor-pointer transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
