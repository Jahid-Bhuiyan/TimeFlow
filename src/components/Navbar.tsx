import React from 'react';
import { 
  Clock, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Plus, 
  Play, 
  Pause, 
  Square,
  Sparkles,
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/categories';

export const Navbar: React.FC = () => {
  const { 
    user, 
    activeTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    theme, 
    toggleTheme, 
    soundEnabled, 
    toggleSound, 
    openTaskModal,
    openLogModal,
    setIsAuthModalOpen,
    tasks,
    timeLogs
  } = useApp();

  // Format seconds into MM:SS or HH:MM:SS
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerCategory = CATEGORIES[activeTimer.category] || CATEGORIES.work;

  // Calculate today's streak and completed
  const completedToday = tasks.filter(t => t.status === 'completed').length;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 font-display">
              TimeFlow
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                Focus
              </span>
            </span>
            <span className="hidden sm:block text-[11px] text-zinc-600 dark:text-zinc-300 -mt-1 font-medium">
              Eliminate distractions & master routine
            </span>
          </div>
        </div>

        {/* Center: Live Running Mini-Timer Bar (Visible when timer is active) */}
        {activeTimer.isRunning && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner animate-in fade-in zoom-in-95 duration-200">
            <div 
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: timerCategory.color }} 
            />
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 max-w-[110px] sm:max-w-[180px] truncate">
                {activeTimer.taskTitle}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatTimer(activeTimer.elapsedSeconds)}
              </span>
            </div>
            
            <div className="flex items-center gap-1 ml-1">
              {activeTimer.isPaused ? (
                <button
                  id="btn-resume-mini-timer"
                  onClick={resumeTimer}
                  className="p-1 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  title="Resume Timer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  id="btn-pause-mini-timer"
                  onClick={pauseTimer}
                  className="p-1 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  title="Pause Timer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
              <button
                id="btn-stop-mini-timer"
                onClick={() => stopTimer(true)}
                className="p-1 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                title="Finish & Save Session"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Quick Add Buttons */}
          <button
            id="btn-quick-task"
            onClick={() => openTaskModal()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:shadow active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          <button
            id="btn-quick-log"
            onClick={() => openLogModal()}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all active:scale-95 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Activity</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={toggleSound}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={soundEnabled ? 'Mute Satisfying Audio' : 'Unmute Audio Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* User Profile Pill or Auth */}
          {user ? (
            <div 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:block text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
                {user.username}
              </span>
            </div>
          ) : (
            <button
              id="btn-login-header"
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
