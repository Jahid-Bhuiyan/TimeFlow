export type ActivityCategory = 
  | 'work' 
  | 'study' 
  | 'fitness' 
  | 'personal' 
  | 'chores' 
  | 'entertainment' 
  | 'time_waste';

export interface CategoryInfo {
  id: ActivityCategory;
  name: string;
  isProductive: boolean;
  color: string;
  textColor: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  icon: string;
  description: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type RoutineSlot = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  priority: TaskPriority;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  targetMinutes?: number;
  loggedMinutes: number;
  completedAt?: string;
  isRecurringRoutine?: boolean;
  routineTimeSlot?: RoutineSlot;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle: string;
  category: ActivityCategory;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  durationMinutes: number;
  notes?: string;
  isProductive: boolean;
  date: string; // YYYY-MM-DD
}

export interface ActiveTimer {
  isRunning: boolean;
  isPaused: boolean;
  mode: 'stopwatch' | 'pomodoro' | 'countdown';
  taskId?: string;
  taskTitle: string;
  category: ActivityCategory;
  startTimestamp: number;
  elapsedSeconds: number;
  targetSeconds: number; // For pomodoro / countdown (default 25*60 = 1500)
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarSeed?: string;
  dailyGoalHours: number; // e.g. 6.5 hours
  themePreference: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalProductiveMinutes: number;
  totalWasteMinutes: number;
  totalNeutralMinutes: number;
  totalMinutes: number;
  productivityScore: number; // 0 - 100
  tasksCompleted: number;
  tasksTotal: number;
}

export interface MonthlyInsight {
  monthKey: string; // YYYY-MM
  monthName: string;
  totalProductiveHours: number;
  totalWasteHours: number;
  totalTrackedHours: number;
  productivityRate: number; // percentage
  dailyAverageProductiveHours: number;
  longestStreakDays: number;
  currentStreakDays: number;
  topProductiveActivities: { title: string; category: ActivityCategory; hours: number; percentage: number }[];
  topTimeWastingActivities: { title: string; hours: number; percentage: number; costEstimate?: string }[];
  neglectedImportantTasks: { id: string; title: string; category: ActivityCategory; priority: TaskPriority; daysPending: number }[];
  categoryBreakdown: { category: ActivityCategory; name: string; hours: number; percentage: number; color: string; isProductive: boolean }[];
  weeklyTrends: { week: string; productiveHours: number; wasteHours: number }[];
  improvementTips: string[];
}
