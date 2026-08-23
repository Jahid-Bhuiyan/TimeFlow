import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Plus,
  Clock,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTimerWidget } from './ActiveTimerWidget';
import { TaskList } from './TaskList';
import { getTodayDateString, formatMinutesDuration } from '../utils/mockData';

export const TodayView: React.FC = () => {
  const { 
    tasks,
    selectedDate, 
    setSelectedDate, 
    openTaskModal, 
    currentTimeString, 
    formattedRealDate,
    userTimeZone,
    currentDateString 
  } = useApp();
  
  const todayStr = currentDateString || getTodayDateString();
  const isToday = selectedDate === todayStr;

  const todayTasks = tasks.filter((t) => t.date === selectedDate);
  // Active/pending tasks that are still in the active plan (excludes completed and missed/crossed items)
  const activeTasks = todayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');

  const totalAllMinutes = activeTasks.reduce((sum, t) => sum + (t.targetMinutes || 0), 0);
  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const missedCount = todayTasks.filter((t) => t.status === 'missed').length;

  // Helpers to shift selected date
  const handleShiftDate = (days: number) => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const formattedDateHeader = (() => {
    try {
      const parts = selectedDate.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('default', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  })();

  const isFuture = selectedDate > todayStr;
  const isPast = selectedDate < todayStr;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Clean Date Header Ribbon with Automatic Total Time Counts & Live Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-display">
              {formattedDateHeader}
            </h1>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                TODAY
              </span>
            )}
            {isFuture && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                UPCOMING
              </span>
            )}
            {isPast && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                ARCHIVE
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            {/* Automatic Total Time for all active listed tasks */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
              <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Total Plan: {formatMinutesDuration(totalAllMinutes)}</span>
              {totalAllMinutes > 0 ? (
                <span className="text-blue-500/80 dark:text-blue-400/80 font-normal">
                  ({activeTasks.length} {activeTasks.length === 1 ? 'task' : 'tasks'} remaining)
                </span>
              ) : todayTasks.length > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-normal">
                  (All tasks completed & handled)
                </span>
              ) : null}
            </div>

            {/* Real-time badge */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{currentTimeString}</span>
              <span className="text-[10px] text-zinc-400 font-sans">({userTimeZone})</span>
            </div>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              Today
            </button>
          )}

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Select date"
              className="px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Focus Stopwatch/Timer (Desktop & Tablet only, hidden on mobile) */}
      <div className="hidden sm:block">
        <ActiveTimerWidget />
      </div>

      {/* Unified Today's Tasks Checklist */}
      <TaskList />

    </div>
  );
};
