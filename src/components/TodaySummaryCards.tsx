import React from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Zap,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMinutesDuration } from '../utils/mockData';

export const TodaySummaryCards: React.FC = () => {
  const { user, tasks, timeLogs, selectedDate } = useApp();

  const todayLogs = timeLogs.filter((l) => l.date === selectedDate);
  const todayTasks = tasks.filter((t) => t.date === selectedDate);

  let productiveMinutes = 0;
  let wasteMinutes = 0;
  let totalMinutes = 0;

  todayLogs.forEach((log) => {
    const m = log.durationMinutes || 0;
    totalMinutes += m;
    if (log.category === 'time_waste') {
      wasteMinutes += m;
    } else if (log.isProductive) {
      productiveMinutes += m;
    }
  });

  const productiveHours = Number((productiveMinutes / 60).toFixed(1));
  const wasteHours = Number((wasteMinutes / 60).toFixed(1));
  const goalHours = user?.dailyGoalHours || 6.0;
  const goalPercent = Math.min(100, Math.round((productiveHours / goalHours) * 100));

  const focusRatio = totalMinutes > 0 ? Math.round((productiveMinutes / totalMinutes) * 100) : 100;

  const completedTasks = todayTasks.filter((t) => t.status === 'completed').length;
  const totalTasks = todayTasks.length;
  const totalTaskMinutes = todayTasks.reduce((sum, t) => sum + (t.targetMinutes || 0), 0);
  const completedTaskMinutes = todayTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.targetMinutes || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      {/* 1. Productive Hours */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Productive Focus
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            {productiveHours}
            <span className="text-sm font-normal text-zinc-400 ml-1">hrs</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            <span>Goal: {goalHours}h</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{goalPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500" 
              style={{ width: `${goalPercent}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 2. Focus Ratio */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Focus Ratio
          </span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            focusRatio >= 80 
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              : focusRatio >= 60
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
          }`}>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            {focusRatio}
            <span className="text-sm font-normal text-zinc-400 ml-0.5">%</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {focusRatio >= 80 ? 'Elite deep work efficiency' : focusRatio >= 60 ? 'Healthy balance' : 'Distractions detected'}
          </p>
        </div>
      </div>

      {/* 3. Time Wasted / Distractions */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Time Distraction
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            {wasteMinutes > 60 ? `${wasteHours}h` : `${wasteMinutes}m`}
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 truncate font-medium">
            {wasteMinutes === 0 ? 'Zero waste logged today' : 'Identified non-deliberate'}
          </p>
        </div>
      </div>

      {/* 4. Tasks & Rituals Done */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Tasks & Routines
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            {completedTasks}
            <span className="text-sm font-normal text-zinc-400 ml-1">/ {totalTasks}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              Total: {formatMinutesDuration(totalTaskMinutes)}
            </span>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Flame className="w-3 h-3 fill-current" />
              <span>5d streak</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
