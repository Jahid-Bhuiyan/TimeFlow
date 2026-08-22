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
  createdAt: '2026-07-01T08:00:00.000Z'
};

export const generateInitialData = (userId: string = INITIAL_USER.id) => {
  const today = getTodayDateString();
  
  // Today's tasks
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
      createdAt: `${today}T09:00:00.000Z`,
      updatedAt: `${today}T09:00:00.000Z`
    },
    // Backlog / neglected high-priority tasks to demonstrate intelligent insights
    {
      id: 'task_neglected_1',
      userId,
      title: 'Tax Filing & Financial Quarter Audit',
      description: 'Assemble all invoices, receipts, and submit quarterly form',
      category: 'chores',
      priority: 'urgent',
      status: 'pending',
      date: getTodayDateString(-7),
      targetMinutes: 90,
      loggedMinutes: 0,
      isRecurringRoutine: false,
      createdAt: `${getTodayDateString(-7)}T10:00:00.000Z`,
      updatedAt: `${getTodayDateString(-7)}T10:00:00.000Z`
    },
    {
      id: 'task_neglected_2',
      userId,
      title: 'Portfolio Case Study Documentation',
      description: 'Write up technical architecture breakdown for client showcase',
      category: 'personal',
      priority: 'high',
      status: 'pending',
      date: getTodayDateString(-12),
      targetMinutes: 180,
      loggedMinutes: 20,
      isRecurringRoutine: false,
      createdAt: `${getTodayDateString(-12)}T11:00:00.000Z`,
      updatedAt: `${getTodayDateString(-12)}T11:00:00.000Z`
    },
    {
      id: 'task_neglected_3',
      userId,
      title: 'TypeScript Advanced Type Safety Course Review',
      description: 'Complete final exam and project assignment',
      category: 'study',
      priority: 'high',
      status: 'pending',
      date: getTodayDateString(-5),
      targetMinutes: 90,
      loggedMinutes: 0,
      isRecurringRoutine: false,
      createdAt: `${getTodayDateString(-5)}T09:00:00.000Z`,
      updatedAt: `${getTodayDateString(-5)}T09:00:00.000Z`
    }
  ];

  // Past 30 days of realistic time logs
  const timeLogs: TimeLog[] = [];
  
  // Today's logs
  timeLogs.push(
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
  );

  // Generate historical logs for past 29 days
  const productiveActivityPool = [
    { title: 'Fullstack Feature Development', category: 'work', baseMinutes: 120 },
    { title: 'Code Review & PR QA', category: 'work', baseMinutes: 60 },
    { title: 'Algorithms & LeetCode Practice', category: 'study', baseMinutes: 45 },
    { title: 'Read Technology Whitepaper', category: 'study', baseMinutes: 40 },
    { title: 'Strength Training & Cardio', category: 'fitness', baseMinutes: 50 },
    { title: 'Meal Prep & Kitchen Cleanup', category: 'chores', baseMinutes: 35 },
    { title: 'Open Source Contribution', category: 'personal', baseMinutes: 75 },
    { title: 'Language Learning (Spanish)', category: 'study', baseMinutes: 30 }
  ] as const;

  const timeWastePool = [
    { title: 'Social Media Feed Rabbit Hole', category: 'time_waste', baseMinutes: 45 },
    { title: 'Unplanned Video Binge Watching', category: 'time_waste', baseMinutes: 60 },
    { title: 'Procrastination & Tab Hopping', category: 'time_waste', baseMinutes: 30 },
    { title: 'Casual Mobile Gaming Session', category: 'time_waste', baseMinutes: 40 }
  ] as const;

  const leisurePool = [
    { title: 'Dinner with Friends & Family', category: 'entertainment', baseMinutes: 90 },
    { title: 'Documentary & Music Relaxation', category: 'entertainment', baseMinutes: 60 }
  ] as const;

  for (let i = 1; i <= 29; i++) {
    const dayStr = getTodayDateString(-i);
    const dayOfWeek = new Date(dayStr).getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Pick 2-4 productive activities
    const numProd = isWeekend ? 2 : Math.floor(Math.random() * 2) + 3;
    for (let p = 0; p < numProd; p++) {
      const act = productiveActivityPool[(i + p) % productiveActivityPool.length];
      const variance = Math.floor((Math.random() - 0.5) * 30);
      const duration = Math.max(25, act.baseMinutes + variance);
      
      timeLogs.push({
        id: `log_hist_p_${i}_${p}`,
        userId,
        taskTitle: act.title,
        category: act.category,
        startTime: `${dayStr}T09:${(p * 30).toString().padStart(2, '0')}:00.000Z`,
        endTime: `${dayStr}T10:${(p * 30 + duration % 60).toString().padStart(2, '0')}:00.000Z`,
        durationMinutes: duration,
        isProductive: true,
        date: dayStr
      });
    }

    // Pick 1 leisure item
    if (Math.random() > 0.3) {
      const leis = leisurePool[i % leisurePool.length];
      timeLogs.push({
        id: `log_hist_l_${i}`,
        userId,
        taskTitle: leis.title,
        category: leis.category,
        startTime: `${dayStr}T19:00:00.000Z`,
        endTime: `${dayStr}T20:00:00.000Z`,
        durationMinutes: leis.baseMinutes,
        isProductive: false,
        date: dayStr
      });
    }

    // Pick time waste items on certain days
    if (Math.random() > 0.35) {
      const waste = timeWastePool[i % timeWastePool.length];
      const duration = Math.floor(Math.random() * 40) + 25;
      timeLogs.push({
        id: `log_hist_w_${i}`,
        userId,
        taskTitle: waste.title,
        category: 'time_waste',
        startTime: `${dayStr}T14:30:00.000Z`,
        endTime: `${dayStr}T15:15:00.000Z`,
        durationMinutes: duration,
        notes: 'Identified as non-deliberate distraction',
        isProductive: false,
        date: dayStr
      });
    }
  }

  return { user: INITIAL_USER, tasks, timeLogs };
};
