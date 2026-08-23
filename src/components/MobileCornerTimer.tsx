import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Check, 
  X, 
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileCornerTimer: React.FC = () => {
  const { 
    activeTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    getCategory, 
    tasks, 
    toggleTaskComplete 
  } = useApp();

  const [isDismissed, setIsDismissed] = useState(false);

  // When a user starts or switches to a task, reset the dismissal so the popup opens
  useEffect(() => {
    if (activeTimer.isRunning && (activeTimer.taskId || activeTimer.taskTitle)) {
      setIsDismissed(false);
    }
  }, [activeTimer.taskId, activeTimer.taskTitle, activeTimer.isRunning]);

  // Strict Condition: Only show when a task has actually been started & is actively running
  const isTaskRunning = activeTimer.isRunning && !!(activeTimer.taskId || activeTimer.taskTitle);

  if (!isTaskRunning || isDismissed) {
    return null;
  }

  const currentCategory = getCategory(activeTimer.category);

  // Compute countdown or elapsed seconds
  const targetSecs = activeTimer.targetSeconds || (25 * 60);
  const isCountdownMode = activeTimer.mode === 'countdown' || activeTimer.mode === 'pomodoro' || !!activeTimer.targetSeconds;
  
  const displaySeconds = isCountdownMode
    ? Math.max(0, targetSecs - activeTimer.elapsedSeconds)
    : activeTimer.elapsedSeconds;

  const mins = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progressPercent = targetSecs > 0 
    ? Math.min(100, Math.round((activeTimer.elapsedSeconds / targetSecs) * 100)) 
    : 0;

  const currentTask = activeTimer.taskId ? tasks.find(t => t.id === activeTimer.taskId) : null;
  const title = activeTimer.taskTitle || currentTask?.title || 'Focus Task';

  const handleFinishAndComplete = () => {
    if (activeTimer.taskId) {
      toggleTaskComplete(activeTimer.taskId);
    }
    stopTimer(true);
    setIsDismissed(true);
  };

  const handleClose = () => {
    setIsDismissed(true);
    stopTimer(false);
  };

  return (
    <div 
      className="sm:hidden fixed bottom-20 right-3.5 z-40 animate-in slide-in-from-bottom-3 fade-in duration-200"
      role="region"
      aria-label="Mobile Active Task Countdown"
    >
      <div className="w-[260px] bg-zinc-900/95 dark:bg-zinc-900/95 text-white p-3 rounded-2xl shadow-xl shadow-black/30 border border-zinc-700/80 backdrop-blur-md">
        
        {/* Top Header Row: Task Title & Category & Close Button */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span 
              className="w-2 h-2 rounded-full shrink-0 animate-pulse" 
              style={{ backgroundColor: currentCategory.color }} 
            />
            <span className="text-xs font-semibold text-zinc-100 truncate">
              {title}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 -mr-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close timer popup"
            aria-label="Close timer popup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Middle Row: Countdown Display & Quick Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-mono text-lg font-bold tracking-tight text-white tabular-nums">
              {timeFormatted}
            </span>
            <span className="text-[10px] text-zinc-400 font-sans">
              {isCountdownMode ? 'left' : 'elapsed'}
            </span>
          </div>

          {/* Action Buttons: Pause/Play, Complete Check */}
          <div className="flex items-center gap-1.5">
            
            {/* Play/Pause */}
            <button
              type="button"
              onClick={() => {
                if (activeTimer.isRunning) {
                  pauseTimer();
                } else {
                  resumeTimer();
                }
              }}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTimer.isRunning 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
              }`}
              title={activeTimer.isRunning ? 'Pause' : 'Resume'}
              aria-label={activeTimer.isRunning ? 'Pause Timer' : 'Resume Timer'}
            >
              {activeTimer.isRunning ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </button>

            {/* Finish & Mark Done */}
            <button
              type="button"
              onClick={handleFinishAndComplete}
              className="w-7 h-7 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
              title="Finish & Mark Task Done"
              aria-label="Finish and Mark Task Done"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

        </div>

        {/* Bottom Mini Progress Line */}
        {targetSecs > 0 && (
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

      </div>
    </div>
  );
};
