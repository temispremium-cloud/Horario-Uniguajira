import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ModularCourse, TaskItem, MobileTab, NotificationSettings, InAppNotification } from './types';
import { INITIAL_MODULAR_COURSES } from './data/modularSchedule';
import { MobileTopHeader } from './components/MobileTopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileTodayView } from './components/MobileTodayView';
import { MobileCoursesView } from './components/MobileCoursesView';
import { MobileTasksView } from './components/MobileTasksView';
import { ModularCalendarView } from './components/ModularCalendarView';
import { ModularOfficialSheetView } from './components/ModularOfficialSheetView';
import { ModularCourseDetailModal } from './components/ModularCourseDetailModal';
import { TaskModal } from './components/TaskModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { InAppNotificationBanner } from './components/InAppNotificationBanner';
import { OfflineAndInstallBanner } from './components/OfflineAndInstallBanner';
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt';
import { HamburgerMenuDrawer } from './components/HamburgerMenuDrawer';
import { InstallAppModal } from './components/InstallAppModal';
import { generateModularICS, downloadModularICSFile } from './utils/modularIcsExporter';
import { exportElementToPDF } from './utils/pdfExporter';
import { requestDeviceStoragePermission } from './utils/androidBridge';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_STORAGE_KEY,
  evaluateUpcomingClasses,
  evaluateUpcomingTasks
} from './utils/notificationService';

const STORAGE_KEY_MODULAR_COURSES = 'uniguajira_modular_courses_c1_v1';
const STORAGE_KEY_MODULAR_TASKS = 'uniguajira_modular_tasks_c1_v1';
const STORAGE_KEY_CUSTOM_APP_ICON = 'uniguajira_custom_app_icon_c1';

export default function App() {
  // Mobile Tab navigation ('today' | 'courses' | 'calendar' | 'tasks' | 'official-sheet')
  const [activeTab, setActiveTab] = useState<MobileTab>('today');

  // App Icon state (defaults to official UniGuajira Wayuu seal icon)
  const [appIcon] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CUSTOM_APP_ICON) || '/icon-192.svg';
    } catch {
      return '/icon-192.svg';
    }
  });

  // Dynamically update link tags for favicon and apple-touch-icon
  useEffect(() => {
    try {
      const iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (iconLink) iconLink.href = appIcon;
      const appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (appleLink) appleLink.href = appIcon;
    } catch (e) {
      console.error(e);
    }
  }, [appIcon]);

  // Modular courses state - ensures C1 is loaded cleanly
  const [courses, setCourses] = useState<ModularCourse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODULAR_COURSES);
      if (saved) {
        const parsed: ModularCourse[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].group === 'C1') {
          return parsed;
        }
      }
      return INITIAL_MODULAR_COURSES;
    } catch {
      return INITIAL_MODULAR_COURSES;
    }
  });

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODULAR_TASKS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'mod-tsk-1',
          courseId: 'mod-1',
          title: 'Taller de Modelos Pedagógicos Contemporáneos',
          dueDate: '2026-09-18',
          completed: true,
          type: 'Tarea',
          notes: 'Elaborar cuadro comparativo entre constructivismo y enfoque socio-cultural. Grupos de 2 en PDF.',
          grade: 4.6,
          percentage: 20,
          reminderEnabled: true
        },
        {
          id: 'mod-tsk-2',
          courseId: 'mod-2',
          title: 'Taller Práctico de Resolución Matemática',
          dueDate: '2026-09-26',
          completed: false,
          type: 'Taller',
          notes: 'Resolver ejercicios de fracciones y proporcionalidad directa de la guía del docente.',
          percentage: 25,
          reminderEnabled: true
        },
        {
          id: 'mod-tsk-3',
          courseId: 'mod-3',
          title: 'Primer Parcial: Planteamiento de Investigación',
          dueDate: '2026-10-03',
          completed: false,
          type: 'Parcial',
          notes: 'Presentación individual de la pregunta de investigación en el contexto educativo de La Guajira.',
          percentage: 30,
          reminderEnabled: true
        },
        {
          id: 'mod-tsk-4',
          courseId: 'mod-4',
          title: 'Ensayo Crítico sobre Enfoques Bilingües',
          dueDate: '2026-09-26',
          completed: false,
          type: 'Otro',
          customType: 'Ensayo Crítico',
          notes: 'Máximo 3 páginas con normas APA sobre la enseñanza de segunda lengua en comunidades rurales.',
          percentage: 25,
          reminderEnabled: true
        }
      ];
    } catch {
      return [];
    }
  });

  // Mobile Push Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_SETTINGS;
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  });

  // In-app active notification banner
  const [activeNotification, setActiveNotification] = useState<InAppNotification | null>(null);

  // Filter for official sheet
  const [selectedModule, setSelectedModule] = useState<'all' | 'Septiembre - Octubre' | 'Octubre' | 'Noviembre'>('all');

  // Modals state
  const [selectedCourse, setSelectedCourse] = useState<ModularCourse | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskCourseId, setTaskCourseId] = useState<string | undefined>(undefined);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Sync state to refs for event listeners (avoids stale closures)
  const selectedCourseRef = useRef(selectedCourse);
  selectedCourseRef.current = selectedCourse;

  const isTaskModalOpenRef = useRef(isTaskModalOpen);
  isTaskModalOpenRef.current = isTaskModalOpen;

  const isNotificationModalOpenRef = useRef(isNotificationModalOpen);
  isNotificationModalOpenRef.current = isNotificationModalOpen;

  const isInstallModalOpenRef = useRef(isInstallModalOpen);
  isInstallModalOpenRef.current = isInstallModalOpen;

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // History stack for tab navigation
  const tabHistoryRef = useRef<MobileTab[]>(['today']);

  // Tab change handler with history stack tracking
  const handleTabChange = useCallback((newTab: MobileTab) => {
    if (newTab === activeTabRef.current) return;
    tabHistoryRef.current.push(newTab);
    try {
      window.history.pushState({ type: 'tab', tab: newTab }, '');
    } catch (e) {
      // Ignore pushState errors in sandboxed frames
    }
    setActiveTab(newTab);
  }, []);

  // Modal handlers
  const handleOpenCourse = useCallback((course: ModularCourse) => {
    setSelectedCourse(course);
  }, []);

  const handleCloseCourse = useCallback(() => {
    setSelectedCourse(null);
  }, []);

  const handleOpenTaskModal = useCallback((courseId?: string, task?: TaskItem) => {
    setTaskCourseId(courseId || task?.courseId);
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  }, []);

  const handleOpenNotificationModal = useCallback(() => {
    setIsNotificationModalOpen(true);
  }, []);

  const handleCloseNotificationModal = useCallback(() => {
    setIsNotificationModalOpen(false);
  }, []);

  // System Back handler: Android physical back button, edge gesture & popstate
  const handleSystemBack = useCallback(() => {
    // 1. If Course Detail Modal is open, close it
    if (selectedCourseRef.current) {
      setSelectedCourse(null);
      return true;
    }

    // 2. If Task Modal is open, close it
    if (isTaskModalOpenRef.current) {
      setIsTaskModalOpen(false);
      return true;
    }

    // 3. If Notification Settings Modal is open, close it
    if (isNotificationModalOpenRef.current) {
      setIsNotificationModalOpen(false);
      return true;
    }

    // 4. If Install Modal is open, close it
    if (isInstallModalOpenRef.current) {
      setIsInstallModalOpen(false);
      return true;
    }

    // 5. If on a secondary tab, return to previous tab or 'today'
    if (activeTabRef.current !== 'today') {
      const stack = tabHistoryRef.current;
      if (stack.length > 1) {
        stack.pop(); // remove current tab
        const prevTab = stack[stack.length - 1] || 'today';
        setActiveTab(prevTab);
      } else {
        setActiveTab('today');
        tabHistoryRef.current = ['today'];
      }
      return true;
    }

    // 5. On root screen ('today') with no modals open:
    // Do NOT show any confirmation popup. If running inside a native mobile wrapper, let it exit cleanly.
    try {
      if ((navigator as any).app && typeof (navigator as any).app.exitApp === 'function') {
        (navigator as any).app.exitApp();
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  }, []);

  // Listen for Android Back navigation: popstate, Cordova/Capacitor backbutton, and native onBackPressed
  useEffect(() => {
    const onPopState = () => {
      handleSystemBack();
    };

    const onBackButton = (e: Event) => {
      const handled = handleSystemBack();
      if (handled) {
        e.preventDefault();
      }
    };

    window.addEventListener('popstate', onPopState);
    document.addEventListener('backbutton', onBackButton);
    (window as any).onBackPressed = () => {
      return handleSystemBack();
    };

    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('backbutton', onBackButton);
      delete (window as any).onBackPressed;
    };
  }, [handleSystemBack]);

  // Auto-request Android persistent storage and file permission on app launch
  useEffect(() => {
    requestDeviceStoragePermission().catch(err => {
      console.warn('Storage permission check on launch:', err);
    });

    // Check URL params for direct PWA shortcut navigation (e.g. ?tab=tasks)
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as MobileTab;
      if (tabParam && ['today', 'courses', 'calendar', 'tasks', 'official-sheet'].includes(tabParam)) {
        setActiveTab(tabParam);
        tabHistoryRef.current = ['today', tabParam];
      }
    } catch {
      // Ignore
    }

    // Orientation change listener to ensure smooth layout reflow without visual freezes
    const handleOrientationOrResize = () => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('scroll'));
      });
    };

    window.addEventListener('orientationchange', handleOrientationOrResize);
    window.addEventListener('resize', handleOrientationOrResize);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationOrResize);
      window.removeEventListener('resize', handleOrientationOrResize);
    };
  }, []);

  // Restore data from backup JSON file
  const handleRestoreData = useCallback((restoredCourses: ModularCourse[], restoredTasks: TaskItem[], restoredSettings?: NotificationSettings) => {
    setCourses(restoredCourses);
    setTasks(restoredTasks);
    if (restoredSettings) {
      setNotificationSettings(restoredSettings);
    }
  }, []);

  // Reset schedule to official UniGuajira initial dataset
  const handleResetOfficialSchedule = useCallback(() => {
    setCourses(INITIAL_MODULAR_COURSES);
    try {
      localStorage.removeItem(STORAGE_KEY_MODULAR_COURSES);
    } catch {}
  }, []);

  // Sync courses to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODULAR_COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error(e);
    }
  }, [courses]);

  // Sync tasks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODULAR_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  // Sync notification settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notificationSettings));
    } catch (e) {
      console.error(e);
    }
  }, [notificationSettings]);

  // Background monitor for upcoming classes and tasks (every 60 seconds)
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    // Check immediately on load/update
    evaluateUpcomingClasses(courses, notificationSettings, setActiveNotification);
    evaluateUpcomingTasks(tasks, courses, notificationSettings, setActiveNotification);

    // Schedule regular checks
    const interval = setInterval(() => {
      evaluateUpcomingClasses(courses, notificationSettings, setActiveNotification);
      evaluateUpcomingTasks(tasks, courses, notificationSettings, setActiveNotification);
    }, 60000);

    return () => clearInterval(interval);
  }, [courses, tasks, notificationSettings]);

  // Course update handler (e.g. classroom, notes)
  const handleUpdateCourse = (updatedCourse: ModularCourse) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    if (selectedCourse?.id === updatedCourse.id) {
      setSelectedCourse(updatedCourse);
    }
  };

  // Task handlers (create or update)
  const handleSaveTask = (taskData: Omit<TaskItem, 'id'>, existingId?: string) => {
    if (existingId) {
      setTasks(prev => prev.map(t => t.id === existingId ? { ...taskData, id: existingId } : t));
    } else {
      const newTask: TaskItem = {
        ...taskData,
        id: `mod-tsk-${Date.now()}`
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Handle click on in-app banner
  const handleNotificationBannerClick = (courseId?: string) => {
    if (courseId) {
      const target = courses.find(c => c.id === courseId);
      if (target) {
        setSelectedCourse(target);
      }
    }
  };

  // Export .ICS calendar for phone with native alarms
  const handleExportICS = () => {
    const icsContent = generateModularICS(courses);
    downloadModularICSFile(icsContent, 'Horario_UniGuajira_Licenciatura_C1.ics');
  };

  // Direct One-Click PDF Download handler (No modals, instant download for APK)
  const handleDirectDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      if (activeTab !== 'official-sheet') {
        setActiveTab('official-sheet');
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      const sheetElement = document.getElementById('modular-official-sheet');
      if (sheetElement) {
        await exportElementToPDF(sheetElement, {
          filename: 'Horario_Oficial_UniGuajira_Licenciatura_C1.pdf',
          landscape: false
        });
      }
    } catch (err) {
      console.error('Error direct downloading PDF:', err);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Count pending tasks for notification badge on bottom bar
  const pendingTasksCount = useMemo(() => {
    return tasks.filter(t => !t.completed).length;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased selection:bg-[#b7191f] selection:text-white relative">
      {/* In-App Floating Notification Banner */}
      <InAppNotificationBanner
        notification={activeNotification}
        onClose={() => setActiveNotification(null)}
        onClick={handleNotificationBannerClick}
      />

      {/* Sticky Top Header with Hamburger & Notifications */}
      <MobileTopHeader
        onDownloadPDF={handleDirectDownloadPDF}
        isDownloadingPDF={isDownloadingPDF}
        onExportICS={handleExportICS}
        onOpenNotificationModal={handleOpenNotificationModal}
        notificationsEnabled={notificationSettings.enabled}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        appIcon={appIcon}
        onGoHome={() => handleTabChange('today')}
        canGoBack={activeTab !== 'today'}
        onBack={() => handleSystemBack()}
        onOpenHamburgerMenu={() => setIsHamburgerOpen(true)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Content Area - Fully responsive: compact mobile + spacious desktop grid */}
      <main
        id="main-app-viewport"
        style={{
          paddingBottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))',
          paddingLeft: activeTab === 'today' ? 0 : 'max(0.75rem, env(safe-area-inset-left, 0px))',
          paddingRight: activeTab === 'today' ? 0 : 'max(0.75rem, env(safe-area-inset-right, 0px))'
        }}
        className={`flex-1 w-full mx-auto transition-[max-width] duration-150 md:!pb-8 ${
          activeTab === 'today'
            ? 'p-0 max-w-full'
            : 'max-w-md landscape:max-w-4xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl py-2.5 sm:py-4 px-2.5 sm:px-4 md:px-6'
        }`}
      >
        {/* Proactive Notification Permission Prompt for Android / Mobile */}
        <NotificationPermissionPrompt
          onPermissionGranted={() => {
            setNotificationSettings(prev => ({ ...prev, enabled: true }));
          }}
        />

        {/* PWA Install Banner & Offline Status */}
        <OfflineAndInstallBanner onOpenInstallModal={() => setIsInstallModalOpen(true)} />

        {activeTab === 'today' && (
          <MobileTodayView
            courses={courses}
            tasks={tasks}
            onSelectCourse={handleOpenCourse}
            onGoToOfficialSheet={() => handleTabChange('official-sheet')}
            onGoToCalendar={() => handleTabChange('calendar')}
            onGoToTasks={() => handleTabChange('tasks')}
            onOpenNotificationSettings={handleOpenNotificationModal}
            notificationsEnabled={notificationSettings.enabled}
            notificationLeadMinutes={notificationSettings.leadTimeMinutes}
          />
        )}

        {activeTab === 'courses' && (
          <MobileCoursesView
            courses={courses}
            tasks={tasks}
            onSelectCourse={handleOpenCourse}
            onOpenTaskModal={courseId => {
              handleOpenTaskModal(courseId);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ModularCalendarView
              courses={courses}
              onSelectCourse={handleOpenCourse}
              onExportICS={handleExportICS}
            />
          </div>
        )}

        {activeTab === 'tasks' && (
          <MobileTasksView
            courses={courses}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onOpenAddTaskModal={courseId => handleOpenTaskModal(courseId)}
            onEditTask={task => handleOpenTaskModal(task.courseId, task)}
          />
        )}

        {activeTab === 'official-sheet' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Render Official Sheet with Vertical / Horizontal toggle and 1-click direct download */}
            <ModularOfficialSheetView
              courses={courses}
              onSelectCourse={handleOpenCourse}
              selectedModule={selectedModule}
              onSelectModule={setSelectedModule}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Course Detail Modal (Bottom Sheet / Modal) */}
      <ModularCourseDetailModal
        course={selectedCourse}
        isOpen={Boolean(selectedCourse)}
        onClose={handleCloseCourse}
        onSaveCourse={handleUpdateCourse}
        onOpenTaskModal={courseId => {
          handleOpenTaskModal(courseId);
        }}
      />

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        courses={courses}
        initialCourseId={taskCourseId}
        taskToEdit={taskToEdit}
        onClose={handleCloseTaskModal}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Push Notification & Class Reminders Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseNotificationModal}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
        courses={courses}
        tasks={tasks}
        onInAppAlert={setActiveNotification}
        onRestoreData={handleRestoreData}
        onResetOfficialSchedule={handleResetOfficialSchedule}
      />

      {/* Hamburger Menu Drawer */}
      <HamburgerMenuDrawer
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenNotificationModal={handleOpenNotificationModal}
        notificationsEnabled={notificationSettings.enabled}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onDownloadPDF={handleDirectDownloadPDF}
        isDownloadingPDF={isDownloadingPDF}
        onExportICS={handleExportICS}
        pendingTasksCount={pendingTasksCount}
      />

      {/* PWA Install Modal Guide & Prompt (PC & Mobile) */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
