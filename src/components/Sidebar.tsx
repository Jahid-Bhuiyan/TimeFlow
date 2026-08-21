import React from 'react';
import { 
  CheckSquare, 
  BarChart3, 
  History, 
  Repeat, 
  User, 
  Flame, 
  Target,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { 
    activeNavTab, 
    setActiveNavTab, 
    user, 
    tasks, 
    timeLogs,
    selectedDate 
  } = useApp();

  const navItems = [
    { id: 'today', label: 'Today & Routines', icon: CheckSquare, desc: 'Focus timer & daily tasks' },
    { id: 'analytics', label: 'Monthly Analytics', icon: BarChart3, desc: 'Productivity vs. waste' },
    { id: 'history', label: 'Activity Logs', icon: History, desc: 'Chronological timeline' },
    { id: 'routines', label: 'Routine Rituals', icon: Repeat, desc: 'Morning & evening habits' },
    { id: 'profile', label: 'Account & Settings', icon: User, desc: 'Preferences & backup' }
  ] as const;

  // Calculate today's logged minutes
  const todayLogs = timeLogs.filter(l => l.date === selectedDate);
  const todayProdMins = todayLogs.filter(l => l.isProductive).reduce((acc, l) => acc + l.durationMinutes, 0);
  const todayProdHours = Number((todayProdMins / 60).toFixed(1));
  const goalHours = user?.dailyGoalHours || 6;
  const goalProgress = Math.min(100, Math.round((todayProdHours / goalHours) * 100));

  const completedTasksCount = tasks.filter(t => t.date === selectedDate && t.status === 'completed').length;
  const totalTasksCount = tasks.filter(t => t.date === selectedDate).length;

  return (
    <aside aria-label="Main Sidebar Navigation" className="hidden sm:flex flex-col w-64 lg:w-72 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 shrink-0 transition-colors">
      
      {/* Navigation List */}
      <nav aria-label="Desktop Primary Navigation" className="space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-desktop-${item.id}`}
              onClick={() => setActiveNavTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
              <div className="flex flex-col">
                <span className="text-sm leading-tight font-medium">
                  {item.label}
                </span>
                <span className={`text-[11px] leading-tight ${isActive ? 'text-blue-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                  {item.desc}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Daily Progress Widget in Sidebar */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        
        {/* Goal Card */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              Daily Focus Target
            </span>
            <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">
              {todayProdHours} / {goalHours}h
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
            <span>{goalProgress}% of goal</span>
            <span>{completedTasksCount}/{totalTasksCount} tasks</span>
          </div>
        </div>

        {/* Motivation Streak */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current animate-bounce" />
            <span className="text-xs font-semibold">5-Day Focus Streak</span>
          </div>
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
            Active
          </span>
        </div>

      </div>
    </aside>
  );
};
