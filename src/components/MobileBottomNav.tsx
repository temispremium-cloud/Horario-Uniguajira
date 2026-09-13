import React from 'react';
import { MobileTab } from '../types';
import {
  CalendarClock,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FileText
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  pendingTasksCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount
}) => {
  const navItems: { id: MobileTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Hoy / Clase', icon: CalendarClock },
    { id: 'courses', label: 'Materias', icon: BookOpen },
    { id: 'calendar', label: 'Fechas', icon: CalendarDays },
    { id: 'tasks', label: 'Tareas', icon: CheckSquare },
    { id: 'official-sheet', label: 'Hoja PDF', icon: FileText }
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navegación principal"
      style={{
        paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
      className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-xs select-none md:hidden"
    >
      <div className="max-w-md landscape:max-w-2xl md:max-w-xl mx-auto px-2 pt-1 landscape:pt-0.5 pb-0.5 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 min-h-[48px] landscape:min-h-[38px] flex flex-col items-center justify-center py-1 landscape:py-0.5 px-0.5 rounded-lg transition-colors cursor-pointer relative ${
                isActive
                  ? 'text-[#b7191f] font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-normal'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 landscape:w-4 landscape:h-4 ${isActive ? 'stroke-[2.2px]' : 'stroke-[1.8px]'}`} />
                {item.id === 'tasks' && pendingTasksCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#b7191f] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {pendingTasksCount}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] landscape:text-[9.5px] mt-1 landscape:mt-0.5 whitespace-nowrap leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
