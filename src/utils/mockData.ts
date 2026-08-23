import { Task, TimeLog, User } from '../types';

export const getLocalDateString = (d: Date = new Date(), offsetDays = 0): string => {
  const target = new Date(d.getTime());
  if (offsetDays !== 0) {
    target.setDate(target.getDate() + offsetDays);
  }
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = (offsetDays = 0): string => {
  return getLocalDateString(new Date(), offsetDays);
};

export const formatMinutesDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (hrs > 0) {
    return `${hrs}h`;
  }
  return `${mins}m`;
};

export const INITIAL_USER: User = {
  id: 'user_alex',
  username: 'Alex Vance',
  email: 'alex.vance@example.com',
  avatarSeed: 'alex',
  dailyGoalHours: 6.0,
  themePreference: 'light',
  soundEnabled: true,
  createdAt: new Date().toISOString()
};

export const generateInitialData = (userId: string = INITIAL_USER.id) => {
  const today = getTodayDateString();
  
  // Today's initial tasks (all started today)
  const tasks: Task[] = [
    {
      id: 'task_1',
      userId,
      title: 'Morning Mindfulness & Hydration',
      description: '10 min box breathing & 500ml water to kickstart focus',
      category: 'fitness',
      priority: 'medium',
      status: 'completed',
      date: today,
      targetMinutes: 15,
      loggedMinutes: 15,
      completedAt: `${today}T07:30:00.000Z`,
      isRecurringRoutine: true,
      routineTimeSlot: 'morning',
      routineTemplateId: 'routine_morning_mindfulness',
      routineStartDate: today,
      createdAt: `${today}T07:00:00.000Z`,
      updatedAt: `${today}T07:30:00.000Z`
    },
    {
      id: 'task_2',
      userId,
      title: 'Core Engine Refactoring & API Pipeline',
      description: 'Optimize async task dispatch and clean up unused module hooks',
      category: 'work',
      priority: 'urgent',
      status: 'in_progress',
      date: today,
      targetMinutes: 120,
      loggedMinutes: 75,
      isRecurringRoutine: false,
      createdAt: `${today}T08:00:00.000Z`,
      updatedAt: `${today}T10:15:00.000Z`
    },
    {
      id: 'task_3',
      userId,
      title: 'System Design: Distributed Cache & Latency',
      description: 'Study Chapter 4 & 5 of Designing Data-Intensive Applications',
      category: 'study',
      priority: 'high',
      status: 'pending',
      date: today,
      targetMinutes: 60,
      loggedMinutes: 0,
      isRecurringRoutine: false,
      createdAt: `${today}T08:30:00.000Z`,
      updatedAt: `${today}T08:30:00.000Z`
    },
    {
      id: 'task_4',
      userId,
      title: 'HIIT Workout & 5km Run',
      description: 'Zone 2 cardio and bodyweight mobility',
      category: 'fitness',
      priority: 'high',
      status: 'pending',
      date: today,
      targetMinutes: 45,
      loggedMinutes: 0,
      isRecurringRoutine: true,
      routineTimeSlot: 'afternoon',
      routineTemplateId: 'routine_hiit_workout',
      routineStartDate: today,
      createdAt: `${today}T08:30:00.000Z`,
      updatedAt: `${today}T08:30:00.000Z`
    },
    {
      id: 'task_5',
      userId,
      title: 'Clean Workspace & Inbox Zero',
      description: 'Triage pending messages, organize desk',
      category: 'chores',
      priority: 'low',
      status: 'pending',
      date: today,
      targetMinutes: 30,
      loggedMinutes: 0,
      isRecurringRoutine: true,
      routineTimeSlot: 'evening',
      routineTemplateId: 'routine_clean_workspace',
      routineStartDate: today,
      createdAt: `${today}T09:00:00.000Z`,
      updatedAt: `${today}T09:00:00.000Z`
    }
  ];

  // Today's time logs only - no fake historical records before user started
  const timeLogs: TimeLog[] = [
    {
      id: 'log_today_1',
      userId,
      taskId: 'task_1',
      taskTitle: 'Morning Mindfulness & Hydration',
      category: 'fitness',
      startTime: `${today}T07:15:00.000Z`,
      endTime: `${today}T07:30:00.000Z`,
      durationMinutes: 15,
      notes: 'Clean morning start',
      isProductive: true,
      date: today
    },
    {
      id: 'log_today_2',
      userId,
      taskId: 'task_2',
      taskTitle: 'Core Engine Refactoring & API Pipeline',
      category: 'work',
      startTime: `${today}T08:30:00.000Z`,
      endTime: `${today}T09:45:00.000Z`,
      durationMinutes: 75,
      notes: 'Extracted modules and fixed async deadlock',
      isProductive: true,
      date: today
    },
    {
      id: 'log_today_3',
      userId,
      taskTitle: 'Short-Form Reels & Infinite Feed Scrolling',
      category: 'time_waste',
      startTime: `${today}T10:00:00.000Z`,
      endTime: `${today}T10:35:00.000Z`,
      durationMinutes: 35,
      notes: 'Fell into recommendation rabbit hole during coffee break',
      isProductive: false,
      date: today
    }
  ];

  return { user: INITIAL_USER, tasks, timeLogs };
};
