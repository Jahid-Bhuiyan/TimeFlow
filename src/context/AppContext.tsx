import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ActiveTimer, ActivityCategory, CategoryInfo, Task, TaskStatus, TimeLog, User } from '../types';
import { generateInitialData, getTodayDateString, INITIAL_USER } from '../utils/mockData';
import { sounds } from '../utils/audio';
import { triggerGoalReachedConfetti, triggerTaskConfetti } from '../utils/confetti';
import { DEFAULT_CATEGORIES, getCategoryInfo, getAutoCategoryColor } from '../utils/categories';

interface AppContextType {
  user: User | null;
  tasks: Task[];
  timeLogs: TimeLog[];
  activeTimer: ActiveTimer;
  selectedDate: string;
  activeNavTab: 'today' | 'analytics' | 'history' | 'routines' | 'profile';
  theme: 'light' | 'dark';
  soundEnabled: boolean;

  // Real-time clock & user date info
  realTime: Date;
  currentDateString: string;
  currentTimeString: string;
  formattedRealTime: string;
  formattedRealDate: string;
  userTimeZone: string;
  userTimeZoneOffset: string;
  
  // Categories State
  categories: Record<string, CategoryInfo>;
  categoryList: CategoryInfo[];
  isCategoryModalOpen: boolean;
  editingCategory: CategoryInfo | null;
  openCategoryModal: (category?: CategoryInfo | null) => void;
  closeCategoryModal: () => void;
  addCategory: (category: { name: string; isProductive: boolean; color?: string; description?: string }) => CategoryInfo;
  updateCategory: (id: string, updates: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;
  resetCategoriesToDefault: () => void;
  getCategory: (id: string) => CategoryInfo;
  
  // Modals & UI state
  isAuthModalOpen: boolean;
  isTaskModalOpen: boolean;
  isLogModalOpen: boolean;
  editingTask: Task | null;
  editingLog: TimeLog | null;
  activeCategoryFilter: ActivityCategory | 'all';
  
  // Actions
  setSelectedDate: (date: string) => void;
  setActiveNavTab: (tab: 'today' | 'analytics' | 'history' | 'routines' | 'profile') => void;
  setActiveCategoryFilter: (filter: ActivityCategory | 'all') => void;
  setIsAuthModalOpen: (open: boolean) => void;
  openTaskModal: (task?: Task | null) => void;
  closeTaskModal: () => void;
  openLogModal: (log?: TimeLog | null) => void;
  closeLogModal: () => void;
  
  // Timer Actions
  startTimer: (params?: { taskId?: string; taskTitle?: string; category?: ActivityCategory; mode?: 'stopwatch' | 'pomodoro' | 'countdown'; targetSeconds?: number }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (save?: boolean, notes?: string) => void;
  resetTimer: () => void;
  setTimerTargetMinutes: (minutes: number) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'loggedMinutes'> & { loggedMinutes?: number }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  toggleTaskComplete: (taskId: string) => void;
  toggleTaskMissed: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  moveTaskOrder: (taskId: string, direction: 'up' | 'down') => void;
  syncRoutinesForDate: (targetDate: string) => void;
  
  // Log Actions
  addTimeLog: (log: Omit<TimeLog, 'id' | 'userId'>) => TimeLog;
  updateTimeLog: (logId: string, updates: Partial<TimeLog>) => void;
  deleteTimeLog: (logId: string) => void;
  clearAllTimeLogs: () => void;
  quickLogActivity: (params: { taskTitle: string; category: ActivityCategory; durationMinutes: number; notes?: string; taskId?: string }) => void;
  
  // Auth & Settings
  login: (email: string, pass: string) => boolean;
  signup: (username: string, email: string, pass: string) => boolean;
  logout: () => void;
  continueAsGuest: () => void;
  updateProfile: (updates: Partial<User>) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  exportData: (format: 'json' | 'csv') => void;
  importData: (jsonString: string) => boolean;
  resetToDemoData: () => void;
}

const STORAGE_KEYS = {
  USER: 'timeflow_user_v1',
  TASKS: 'timeflow_tasks_v1',
  LOGS: 'timeflow_logs_v1',
  TIMER: 'timeflow_timer_v1',
  THEME: 'timeflow_theme_v1',
  SOUND: 'timeflow_sound_v1',
  CATEGORIES: 'timeflow_categories_v1',
  TERMINATED_ROUTINES: 'timeflow_terminated_routines_v1'
};

const defaultTimerState: ActiveTimer = {
  isRunning: false,
  isPaused: false,
  mode: 'stopwatch',
  taskTitle: 'Deep Focus Session',
  category: 'work',
  startTimestamp: 0,
  elapsedSeconds: 0,
  targetSeconds: 25 * 60
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Categories State
  const [categories, setCategories] = useState<Record<string, CategoryInfo>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  const categoryList = useMemo(() => Object.values(categories), [categories]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);

  // Initialize state from LocalStorage or seed data
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const seed = generateInitialData();
    return seed.tasks;
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const seed = generateInitialData();
    return seed.timeLogs;
  });

  const [terminatedRoutines, setTerminatedRoutines] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TERMINATED_ROUTINES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  const [activeTimer, setActiveTimer] = useState<ActiveTimer>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was running, calculate offline elapsed seconds
        if (parsed.isRunning && !parsed.isPaused && parsed.startTimestamp) {
          const delta = Math.floor((Date.now() - parsed.startTimestamp) / 1000);
          parsed.elapsedSeconds += delta;
          parsed.startTimestamp = Date.now();
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return defaultTimerState;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (saved !== null) return saved === 'true';
    } catch {
      // fallback
    }
    return true;
  });

  // Real-time Live Clock & Date State
  const [realTime, setRealTime] = useState<Date>(() => new Date());
  const currentDateString = useMemo(() => getTodayDateString(), [realTime]);

  const currentTimeString = useMemo(() => {
    return realTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  }, [realTime]);

  const formattedRealTime = useMemo(() => {
    return realTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }, [realTime]);

  const formattedRealDate = useMemo(() => {
    return realTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }, [realTime]);

  const userTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      return 'Local';
    }
  }, []);

  const userTimeZoneOffset = useMemo(() => {
    try {
      const parts = new Date().toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ');
      return parts[parts.length - 1] || '';
    } catch {
      return '';
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeNavTab, setActiveNavTab] = useState<'today' | 'analytics' | 'history' | 'routines' | 'profile'>('today');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ActivityCategory | 'all'>('all');
  
  // UI Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);

  // Live real-time ticker & auto midnight rollover
  const prevDateRef = useRef<string>(getTodayDateString());
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setRealTime(now);

      const newDateStr = getTodayDateString();
      if (newDateStr !== prevDateRef.current) {
        // Midnight crossed in user's real local time!
        const oldDate = prevDateRef.current;
        prevDateRef.current = newDateStr;
        
        // Auto-switch selectedDate to the new real date if user was viewing previous day's live dashboard
        setSelectedDate((cur) => (cur === oldDate ? newDateStr : cur));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Persist storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(timeLogs));
  }, [timeLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(activeTimer));
  }, [activeTimer]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TERMINATED_ROUTINES, JSON.stringify(terminatedRoutines));
  }, [terminatedRoutines]);

  // Category Actions
  const openCategoryModal = (category: CategoryInfo | null = null) => {
    sounds.playClick(soundEnabled);
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
  };

  const addCategory = useCallback((newCat: { name: string; isProductive: boolean; color?: string; description?: string }) => {
    sounds.playClick(soundEnabled);
    const id = newCat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_') || `cat_${Date.now()}`;
    const cleanId = categories[id] ? `${id}_${Date.now().toString().slice(-4)}` : id;
    const autoColor = newCat.color || getAutoCategoryColor(newCat.name, newCat.isProductive);
    
    const categoryInfo: CategoryInfo = {
      id: cleanId,
      name: newCat.name.trim(),
      isProductive: newCat.isProductive,
      color: autoColor,
      textColor: 'text-zinc-900 dark:text-zinc-100',
      bgLight: 'bg-zinc-50 dark:bg-zinc-800/60',
      borderColor: 'border-zinc-200 dark:border-zinc-700',
      description: newCat.description || '',
      isCustom: true
    };

    setCategories((prev) => ({
      ...prev,
      [cleanId]: categoryInfo
    }));

    return categoryInfo;
  }, [categories, soundEnabled]);

  const updateCategory = useCallback((id: string, updates: Partial<CategoryInfo>) => {
    sounds.playClick(soundEnabled);
    setCategories((prev) => {
      if (!prev[id]) return prev;
      const current = prev[id];
      const nextName = updates.name !== undefined ? updates.name : current.name;
      const nextIsProductive = updates.isProductive !== undefined ? updates.isProductive : current.isProductive;
      const autoColor = updates.color || current.color || getAutoCategoryColor(nextName, nextIsProductive);

      return {
        ...prev,
        [id]: {
          ...current,
          ...updates,
          color: autoColor
        }
      };
    });
  }, [soundEnabled]);

  const deleteCategory = useCallback((id: string) => {
    sounds.playClick(soundEnabled);
    setCategories((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, [soundEnabled]);

  const resetCategoriesToDefault = useCallback(() => {
    sounds.playTaskComplete(soundEnabled);
    setCategories(DEFAULT_CATEGORIES);
  }, [soundEnabled]);

  const getCategory = useCallback((id: string): CategoryInfo => {
    return getCategoryInfo(categories, id);
  }, [categories]);

  // Timer Tick Hook
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeTimer.isRunning && !activeTimer.isPaused) {
      timerRef.current = setInterval(() => {
        setActiveTimer((prev) => {
          if (!prev.isRunning || prev.isPaused) return prev;
          
          const newElapsed = prev.elapsedSeconds + 1;
          
          // Pomodoro / Countdown finished condition
          if (prev.mode !== 'stopwatch' && prev.targetSeconds && newElapsed >= prev.targetSeconds) {
            sounds.playTimerFinish(soundEnabled);
            triggerGoalReachedConfetti();
            return {
              ...prev,
              elapsedSeconds: prev.targetSeconds,
              isRunning: false,
              isPaused: false
            };
          }
          return {
            ...prev,
            elapsedSeconds: newElapsed
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeTimer.isRunning, activeTimer.isPaused, soundEnabled]);

  // Modal open helpers
  const openTaskModal = (task: Task | null = null) => {
    sounds.playClick(soundEnabled);
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(false);
  };

  const openLogModal = (log: TimeLog | null = null) => {
    sounds.playClick(soundEnabled);
    setEditingLog(log);
    setIsLogModalOpen(true);
  };

  const closeLogModal = () => {
    setEditingLog(null);
    setIsLogModalOpen(false);
  };

  // Timer Actions
  const startTimer = useCallback((params?: {
    taskId?: string;
    taskTitle?: string;
    category?: ActivityCategory;
    mode?: 'stopwatch' | 'pomodoro' | 'countdown';
    targetSeconds?: number;
  }) => {
    sounds.playTimerStart(soundEnabled);
    setActiveTimer((prev) => {
      const mode = params?.mode || prev.mode || 'stopwatch';
      const targetSec = params?.targetSeconds || (mode === 'pomodoro' ? 25 * 60 : prev.targetSeconds || 25 * 60);
      
      return {
        isRunning: true,
        isPaused: false,
        mode,
        taskId: params?.taskId !== undefined ? params.taskId : prev.taskId,
        taskTitle: params?.taskTitle || prev.taskTitle || 'Focus Session',
        category: params?.category || prev.category || 'work',
        startTimestamp: Date.now(),
        elapsedSeconds: 0,
        targetSeconds: targetSec
      };
    });
  }, [soundEnabled]);

  const pauseTimer = useCallback(() => {
    sounds.playTimerPause(soundEnabled);
    setActiveTimer((prev) => ({
      ...prev,
      isPaused: true
    }));
  }, [soundEnabled]);

  const resumeTimer = useCallback(() => {
    sounds.playTimerStart(soundEnabled);
    setActiveTimer((prev) => ({
      ...prev,
      isPaused: false,
      startTimestamp: Date.now()
    }));
  }, [soundEnabled]);

  const resetTimer = useCallback(() => {
    sounds.playClick(soundEnabled);
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0
    }));
  }, [soundEnabled]);

  const setTimerTargetMinutes = useCallback((minutes: number) => {
    sounds.playClick(soundEnabled);
    setActiveTimer((prev) => ({
      ...prev,
      targetSeconds: minutes * 60,
      elapsedSeconds: 0
    }));
  }, [soundEnabled]);

  const stopTimer = useCallback((save = true, notes?: string) => {
    sounds.playClick(soundEnabled);
    setActiveTimer((prev) => {
      const durationMins = Math.max(1, Math.round(prev.elapsedSeconds / 60));
      
      if (save && durationMins > 0) {
        const catInfo = getCategoryInfo(categories, prev.category);
        const isProd = catInfo.isProductive;
        const now = new Date();
        const startTime = new Date(now.getTime() - prev.elapsedSeconds * 1000).toISOString();
        const endTime = now.toISOString();
        const todayStr = getTodayDateString();

        const newLog: TimeLog = {
          id: `log_${Date.now()}`,
          userId: user?.id || 'guest',
          taskId: prev.taskId,
          taskTitle: prev.taskTitle,
          category: prev.category,
          startTime,
          endTime,
          durationMinutes: durationMins,
          notes: notes || `${prev.mode.toUpperCase()} session`,
          isProductive: isProd,
          date: todayStr
        };

        setTimeLogs((logs) => [newLog, ...logs]);

        // If connected to a task, update logged minutes
        if (prev.taskId) {
          setTasks((allTasks) =>
            allTasks.map((t) =>
              t.id === prev.taskId
                ? { ...t, loggedMinutes: (t.loggedMinutes || 0) + durationMins, updatedAt: new Date().toISOString() }
                : t
            )
          );
        }
      }

      return {
        ...prev,
        isRunning: false,
        isPaused: false,
        elapsedSeconds: 0
      };
    });
  }, [categories, soundEnabled, user?.id]);

  // Task Actions
  const syncRoutinesForDate = useCallback((targetDate: string) => {
    if (!targetDate) return;
    const todayStr = getTodayDateString();
    const tomorrowStr = getTodayDateString(1);

    // RULE 1: Never auto-create daily routine lists for previous days (< today).
    // Keep only the days when the user actually started from / recorded tasks.
    if (targetDate < todayStr) {
      return;
    }

    // RULE 2: Never auto-create daily routine lists for far future days (> tomorrow).
    // Only auto-prepare routine schedule for today and the next day (tomorrow) only.
    if (targetDate > tomorrowStr) {
      return;
    }

    setTasks((prevTasks) => {
      // Gather all distinct recurring routine templates
      const routineTemplates = new Map<string, Task>();

      prevTasks.forEach((t) => {
        if (t.isRecurringRoutine) {
          const key = t.routineTemplateId || `${t.title.toLowerCase().trim()}__${t.routineTimeSlot || 'morning'}`;
          if (!routineTemplates.has(key) || (t.updatedAt && routineTemplates.get(key)!.updatedAt < t.updatedAt)) {
            routineTemplates.set(key, t);
          }
        }
      });

      if (routineTemplates.size === 0) return prevTasks;

      // Check tasks already present on targetDate
      const targetDateTasks = prevTasks.filter((t) => t.date === targetDate);
      const existingKeys = new Set<string>();
      targetDateTasks.forEach((t) => {
        if (t.isRecurringRoutine) {
          const key = t.routineTemplateId || `${t.title.toLowerCase().trim()}__${t.routineTimeSlot || 'morning'}`;
          existingKeys.add(key);
          if (t.routineTemplateId) existingKeys.add(t.routineTemplateId);
        }
      });

      const newTasksToAdd: Task[] = [];
      let maxOrder = targetDateTasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);

      routineTemplates.forEach((tmpl, key) => {
        const templateId = tmpl.routineTemplateId;
        const altKey = `${tmpl.title.toLowerCase().trim()}__${tmpl.routineTimeSlot || 'morning'}`;
        const matchesExisting = existingKeys.has(key) || existingKeys.has(altKey) || (templateId ? existingKeys.has(templateId) : false);
        if (matchesExisting) return;

        // 1. RULE: Do NOT add a daily routine in previous days before it was added/started
        const routineStartDate = tmpl.routineStartDate || tmpl.date || (tmpl.createdAt ? tmpl.createdAt.slice(0, 10) : getTodayDateString());
        if (targetDate < routineStartDate) {
          return;
        }

        // 2. RULE: Do NOT add a daily routine on or after the date it was deleted
        const terminatedDate = terminatedRoutines[key] || terminatedRoutines[altKey] || (templateId ? terminatedRoutines[templateId] : undefined);
        if (terminatedDate && targetDate >= terminatedDate) {
          return;
        }

        maxOrder++;
        newTasksToAdd.push({
          id: `task_routine_${targetDate}_${Math.random().toString(36).substring(2, 9)}`,
          userId: user?.id || 'guest',
          title: tmpl.title,
          description: tmpl.description || '',
          category: tmpl.category,
          priority: tmpl.priority || 'medium',
          status: 'pending', // Starts fresh for the target date
          date: targetDate,
          targetMinutes: tmpl.targetMinutes || 15,
          loggedMinutes: 0,
          isRecurringRoutine: true,
          routineTimeSlot: tmpl.routineTimeSlot || 'morning',
          routineTemplateId: tmpl.routineTemplateId || key,
          routineStartDate,
          order: tmpl.order !== undefined ? tmpl.order : maxOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      if (newTasksToAdd.length === 0) return prevTasks;
      return [...prevTasks, ...newTasksToAdd];
    });
  }, [terminatedRoutines, user?.id]);

  // Automatically keep daily recurring routines for today and the next day (tomorrow) only
  useEffect(() => {
    const todayStr = getTodayDateString();
    const tomorrowStr = getTodayDateString(1);
    syncRoutinesForDate(todayStr);
    syncRoutinesForDate(tomorrowStr);
  }, [syncRoutinesForDate]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'loggedMinutes'> & { loggedMinutes?: number }): Task => {
    sounds.playClick(soundEnabled);
    const nowIso = new Date().toISOString();
    const isRoutine = !!taskData.isRecurringRoutine;
    const taskDate = taskData.date || selectedDate || getTodayDateString();
    const routineTemplateId = isRoutine 
      ? (taskData.routineTemplateId || `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
      : undefined;
    const routineKey = isRoutine
      ? (routineTemplateId || `${taskData.title.toLowerCase().trim()}__${taskData.routineTimeSlot || 'morning'}`)
      : undefined;

    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.id || 'guest',
      date: taskDate,
      loggedMinutes: taskData.loggedMinutes || 0,
      isRecurringRoutine: isRoutine,
      routineTemplateId,
      routineStartDate: isRoutine ? taskDate : undefined,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // If re-adding or creating a routine, clear any previous termination record so it syncs from this taskDate forward
    if (isRoutine && routineKey) {
      setTerminatedRoutines((prev) => {
        const next = { ...prev };
        delete next[routineKey];
        if (routineTemplateId) delete next[routineTemplateId];
        const altKey = `${taskData.title.toLowerCase().trim()}__${taskData.routineTimeSlot || 'morning'}`;
        delete next[altKey];
        return next;
      });
    }

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, [selectedDate, soundEnabled, user?.id]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    sounds.playClick(soundEnabled);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isRoutine = updates.isRecurringRoutine !== undefined ? updates.isRecurringRoutine : t.isRecurringRoutine;
          const routineTemplateId = isRoutine ? (t.routineTemplateId || `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`) : undefined;
          const routineStartDate = isRoutine ? (t.routineStartDate || t.date || updates.date || getTodayDateString()) : undefined;
          return { 
            ...t, 
            ...updates, 
            isRecurringRoutine: isRoutine, 
            routineTemplateId, 
            routineStartDate, 
            updatedAt: new Date().toISOString() 
          };
        }
        return t;
      })
    );
  }, [soundEnabled]);

  const toggleTaskComplete = useCallback((taskId: string) => {
    setTasks((prev) => {
      let isNowCompleted = false;
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          if (nextStatus === 'completed') {
            isNowCompleted = true;
          }
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });

      if (isNowCompleted) {
        sounds.playTaskComplete(soundEnabled);
        triggerTaskConfetti();
      } else {
        sounds.playClick(soundEnabled);
      }

      return updated;
    });
  }, [soundEnabled]);

  // Toggle task as missed/crossed out - auto-deducts from plan time & pushes to bottom of list
  const toggleTaskMissed = useCallback((taskId: string) => {
    sounds.playClick(soundEnabled);
    setTasks((prevTasks) => {
      const targetTask = prevTasks.find((t) => t.id === taskId);
      if (!targetTask) return prevTasks;

      const isCurrentlyMissed = targetTask.status === 'missed';
      const nextStatus: TaskStatus = isCurrentlyMissed ? 'pending' : 'missed';

      if (nextStatus === 'missed') {
        // Find max order for this date's tasks to push this missed task to the very bottom
        const dateTasks = prevTasks.filter((t) => t.date === targetTask.date);
        const maxOrder = dateTasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0);

        return prevTasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'missed',
              order: maxOrder + 1,
              completedAt: undefined,
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        });
      } else {
        return prevTasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'pending',
              completedAt: undefined,
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        });
      }
    });
  }, [soundEnabled]);

  const deleteTask = useCallback((taskId: string) => {
    sounds.playClick(soundEnabled);
    setTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      if (!targetTask) return prev.filter((t) => t.id !== taskId);

      // If it is a recurring daily routine: delete on current date AND all next/future days
      if (targetTask.isRecurringRoutine) {
        const templateId = targetTask.routineTemplateId;
        const fallbackKey = `${targetTask.title.toLowerCase().trim()}__${targetTask.routineTimeSlot || 'morning'}`;
        const deleteDate = targetTask.date;

        // Register routine termination from deleteDate onwards
        setTerminatedRoutines((prevTerminated) => ({
          ...prevTerminated,
          [fallbackKey]: deleteDate,
          ...(templateId ? { [templateId]: deleteDate } : {})
        }));

        // Remove current task instance AND any future/next days instances of this routine
        return prev.filter((t) => {
          if (t.id === taskId) return false;

          const isMatchingRoutine = t.isRecurringRoutine && (
            (templateId && t.routineTemplateId === templateId) ||
            (t.title.toLowerCase().trim() === targetTask.title.toLowerCase().trim() && (t.routineTimeSlot || 'morning') === (targetTask.routineTimeSlot || 'morning'))
          );

          if (isMatchingRoutine) {
            // Delete if the matching routine is on or after the deletion date
            if (t.date >= deleteDate) {
              return false;
            }
          }

          return true;
        });
      }

      // Non-recurring task: delete single task
      return prev.filter((t) => t.id !== taskId);
    });
  }, [soundEnabled]);

  // Reorder task priority and position within the list using Up/Down arrows
  const moveTaskOrder = useCallback((taskId: string, direction: 'up' | 'down') => {
    sounds.playClick(soundEnabled);
    setTasks((prevTasks) => {
      const targetTask = prevTasks.find((t) => t.id === taskId);
      if (!targetTask) return prevTasks;

      // Get all tasks for that date
      const dateTasks = prevTasks.filter((t) => t.date === targetTask.date);
      if (dateTasks.length <= 1) return prevTasks;

      // Sort by existing order if present, or by their natural index
      const sortedDateTasks = [...dateTasks].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });

      const currentIndex = sortedDateTasks.findIndex((t) => t.id === taskId);
      if (currentIndex === -1) return prevTasks;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sortedDateTasks.length) return prevTasks;

      // Swap the two items
      const temp = sortedDateTasks[currentIndex];
      sortedDateTasks[currentIndex] = sortedDateTasks[targetIndex];
      sortedDateTasks[targetIndex] = temp;

      // Reassign clean continuous order values
      const orderMap = new Map<string, number>();
      sortedDateTasks.forEach((t, idx) => {
        orderMap.set(t.id, idx);
      });

      return prevTasks.map((t) => {
        if (orderMap.has(t.id)) {
          return {
            ...t,
            order: orderMap.get(t.id)!,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });
    });
  }, [soundEnabled]);

  // Time Log Actions
  const addTimeLog = useCallback((logData: Omit<TimeLog, 'id' | 'userId'>): TimeLog => {
    sounds.playClick(soundEnabled);
    const newLog: TimeLog = {
      ...logData,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.id || 'guest'
    };

    setTimeLogs((prev) => [newLog, ...prev]);

    // If attached to a task, update logged minutes on the task
    if (newLog.taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === newLog.taskId
            ? { ...t, loggedMinutes: (t.loggedMinutes || 0) + newLog.durationMinutes, updatedAt: new Date().toISOString() }
            : t
        )
      );
    }

    return newLog;
  }, [soundEnabled, user?.id]);

  const updateTimeLog = useCallback((logId: string, updates: Partial<TimeLog>) => {
    sounds.playClick(soundEnabled);
    setTimeLogs((prev) =>
      prev.map((log) => (log.id === logId ? { ...log, ...updates } : log))
    );
  }, [soundEnabled]);

  const deleteTimeLog = useCallback((logId: string) => {
    sounds.playClick(soundEnabled);
    setTimeLogs((prev) => prev.filter((l) => l.id !== logId));
  }, [soundEnabled]);

  const clearAllTimeLogs = useCallback(() => {
    sounds.playClick(soundEnabled);
    setTimeLogs([]);
  }, [soundEnabled]);

  const quickLogActivity = useCallback((params: {
    taskTitle: string;
    category: ActivityCategory;
    durationMinutes: number;
    notes?: string;
    taskId?: string;
  }) => {
    sounds.playClick(soundEnabled);
    const catInfo = getCategoryInfo(categories, params.category);
    const isProd = catInfo.isProductive;
    const now = new Date();
    const start = new Date(now.getTime() - params.durationMinutes * 60000);
    const todayStr = getTodayDateString();

    const newLog: TimeLog = {
      id: `log_${Date.now()}`,
      userId: user?.id || 'guest',
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      category: params.category,
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      durationMinutes: params.durationMinutes,
      notes: params.notes || 'Quick Log entry',
      isProductive: isProd,
      date: todayStr
    };

    setTimeLogs((prev) => [newLog, ...prev]);

    if (params.taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === params.taskId
            ? { ...t, loggedMinutes: (t.loggedMinutes || 0) + params.durationMinutes, updatedAt: new Date().toISOString() }
            : t
        )
      );
    }
  }, [categories, soundEnabled, user?.id]);

  // Auth Functions
  const login = (email: string, _pass: string): boolean => {
    sounds.playClick(soundEnabled);
    const foundUser: User = {
      id: `user_${Date.now()}`,
      username: email.split('@')[0] || 'Member',
      email: email,
      avatarSeed: email,
      dailyGoalHours: 6.0,
      themePreference: theme,
      soundEnabled,
      createdAt: new Date().toISOString()
    };
    setUser(foundUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const signup = (username: string, email: string, _pass: string): boolean => {
    sounds.playTaskComplete(soundEnabled);
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: username.trim() || 'Productivity Pioneer',
      email: email.trim(),
      avatarSeed: username,
      dailyGoalHours: 6.0,
      themePreference: theme,
      soundEnabled,
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    sounds.playClick(soundEnabled);
    setUser(null);
  };

  const continueAsGuest = () => {
    sounds.playClick(soundEnabled);
    const guestUser: User = {
      id: 'guest_user',
      username: 'Guest Explorer',
      email: 'guest@timeflow.local',
      avatarSeed: 'guest',
      dailyGoalHours: 6.0,
      themePreference: theme,
      soundEnabled,
      createdAt: new Date().toISOString()
    };
    setUser(guestUser);
    setIsAuthModalOpen(false);
  };

  const updateProfile = (updates: Partial<User>) => {
    sounds.playClick(soundEnabled);
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const toggleTheme = () => {
    sounds.playClick(soundEnabled);
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sounds.playClick(next);
      return next;
    });
  };

  // Data Export & Import
  const exportData = (format: 'json' | 'csv') => {
    sounds.playClick(soundEnabled);
    const dateStr = getTodayDateString();

    if (format === 'json') {
      const exportObject = {
        app: 'TimeFlow',
        version: '1.0',
        exportDate: new Date().toISOString(),
        user,
        tasks,
        timeLogs,
        categories
      };
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeflow_export_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV format for logs
      const headers = ['Date', 'Task / Activity', 'Category', 'Duration (Mins)', 'Productive', 'Start Time', 'End Time', 'Notes'];
      const rows = timeLogs.map((log) => [
        `"${log.date}"`,
        `"${(log.taskTitle || '').replace(/"/g, '""')}"`,
        `"${log.category}"`,
        log.durationMinutes,
        log.isProductive ? 'Yes' : 'No',
        `"${log.startTime}"`,
        `"${log.endTime}"`,
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeflow_activity_logs_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        setTasks(parsed.tasks);
      }
      if (parsed.timeLogs && Array.isArray(parsed.timeLogs)) {
        setTimeLogs(parsed.timeLogs);
      }
      if (parsed.categories && typeof parsed.categories === 'object') {
        setCategories(parsed.categories);
      }
      if (parsed.user) {
        setUser(parsed.user);
      }
      sounds.playTaskComplete(soundEnabled);
      return true;
    } catch {
      return false;
    }
  };

  const resetToDemoData = () => {
    sounds.playTaskComplete(soundEnabled);
    const data = generateInitialData();
    setUser(data.user);
    setTasks(data.tasks);
    setTimeLogs(data.timeLogs);
    setTerminatedRoutines({});
    setCategories(DEFAULT_CATEGORIES);
    setActiveTimer(defaultTimerState);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        tasks,
        timeLogs,
        activeTimer,
        selectedDate,
        activeNavTab,
        theme,
        soundEnabled,
        realTime,
        currentDateString,
        currentTimeString,
        formattedRealTime,
        formattedRealDate,
        userTimeZone,
        userTimeZoneOffset,
        categories,
        categoryList,
        isCategoryModalOpen,
        editingCategory,
        openCategoryModal,
        closeCategoryModal,
        addCategory,
        updateCategory,
        deleteCategory,
        resetCategoriesToDefault,
        getCategory,
        isAuthModalOpen,
        isTaskModalOpen,
        isLogModalOpen,
        editingTask,
        editingLog,
        activeCategoryFilter,
        setSelectedDate,
        setActiveNavTab,
        setActiveCategoryFilter,
        setIsAuthModalOpen,
        openTaskModal,
        closeTaskModal,
        openLogModal,
        closeLogModal,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        setTimerTargetMinutes,
        addTask,
        updateTask,
        toggleTaskComplete,
        toggleTaskMissed,
        deleteTask,
        moveTaskOrder,
        syncRoutinesForDate,
        addTimeLog,
        updateTimeLog,
        deleteTimeLog,
        clearAllTimeLogs,
        quickLogActivity,
        login,
        signup,
        logout,
        continueAsGuest,
        updateProfile,
        toggleTheme,
        toggleSound,
        exportData,
        importData,
        resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
