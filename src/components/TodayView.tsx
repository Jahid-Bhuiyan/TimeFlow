import React from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TodaySummaryCards } from './TodaySummaryCards';
import { ActiveTimerWidget } from './ActiveTimerWidget';
import { QuickLogBar } from './QuickLogBar';
import { TaskList } from './TaskList';
import { getTodayDateString } from '../utils/mockData';

export const TodayView: React.FC = () => {
  const { selectedDate, setSelectedDate, openTaskModal } = useApp();
  const todayStr = getTodayDateString();

  const isToday = selectedDate === todayStr;

  // Helpers to shift selected date
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formattedDateHeader = new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Date Header Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-display">
              {isToday ? "Today's Focus & Flow" : formattedDateHeader}
            </h1>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isToday 
              ? `${formattedDateHeader} — Track live sessions and log daily routines` 
              : 'Viewing historical task archive'}
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-blue-800 transition-colors"
            >
              Back to Today
            </button>
          )}

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Select date"
              className="px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>

          <button
            onClick={() => handleShiftDate(1)}
            disabled={selectedDate >= todayStr}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-30 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Scorecards */}
      <TodaySummaryCards />

      {/* Hero Timer & Quick Logger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Live Focus Timer (7 cols on desktop) */}
        <div className="lg:col-span-7">
          <ActiveTimerWidget />
        </div>

        {/* Quick Log Activity & Shortcuts (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <QuickLogBar />
        </div>

      </div>

      {/* Today's Tasks & Routine Rituals Checklist */}
      <TaskList />

    </div>
  );
};
