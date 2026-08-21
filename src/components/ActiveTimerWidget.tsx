import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Check, 
  Tag, 
  ChevronDown,
  Sparkles,
  Flame,
  AlertTriangle,
  Zap,
  Coffee,
  Brain
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categories';
import { ActivityCategory, Task } from '../types';

export const ActiveTimerWidget: React.FC = () => {
  const { 
    activeTimer, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    resetTimer, 
    setTimerTargetMinutes,
    tasks, 
    selectedDate 
  } = useApp();

  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const taskDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        categoryDropdownRef.current && 
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        taskDropdownRef.current && 
        !taskDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTaskDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const currentCategory = CATEGORIES[activeTimer.category] || CATEGORIES.work;
  const todayTasks = tasks.filter(t => t.date === selectedDate && t.status !== 'completed');

  // Format seconds into display strings
  const formatTimeParts = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs > 0 ? hrs.toString().padStart(2, '0') : null,
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  // Determine progress percentage
  let progressPercent = 0;
  if (activeTimer.mode === 'stopwatch') {
    // For stopwatch, loop visual pulse every 60 mins
    progressPercent = ((activeTimer.elapsedSeconds % 3600) / 3600) * 100;
  } else if (activeTimer.targetSeconds && activeTimer.targetSeconds > 0) {
    progressPercent = Math.min(100, (activeTimer.elapsedSeconds / activeTimer.targetSeconds) * 100);
  }

  // Display time depending on mode
  const displaySeconds = activeTimer.mode === 'countdown' || activeTimer.mode === 'pomodoro'
    ? Math.max(0, (activeTimer.targetSeconds || 1500) - activeTimer.elapsedSeconds)
    : activeTimer.elapsedSeconds;

  const timeDisplay = formatTimeParts(displaySeconds);

  // SVG Circle calculation
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = activeTimer.mode === 'stopwatch'
    ? circumference - (progressPercent / 100) * circumference
    : (progressPercent / 100) * circumference;

  const handleSelectTask = (task: Task) => {
    startTimer({
      taskId: task.id,
      taskTitle: task.title,
      category: task.category,
      mode: activeTimer.mode,
      targetSeconds: (task.targetMinutes || 25) * 60
    });
    setIsTaskDropdownOpen(false);
  };

  const handleSelectCategory = (category: ActivityCategory) => {
    startTimer({
      taskId: undefined,
      taskTitle: activeTimer.taskTitle,
      category,
      mode: activeTimer.mode,
      targetSeconds: activeTimer.targetSeconds
    });
    setIsCategoryDropdownOpen(false);
  };

  const handleFinishSession = () => {
    stopTimer(true, customNotes.trim() || undefined);
    setCustomNotes('');
    setIsNotesOpen(false);
  };

  return (
    <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-7 shadow-xs transition-all">
      
      {/* Decorative subtle ambient glow inside clipped sub-container */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-15 transition-all duration-700"
          style={{ backgroundColor: currentCategory.color }}
        />
      </div>

      {/* Top Header: Timer Mode Switcher & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        
        {/* Mode Pills */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            id="mode-stopwatch"
            onClick={() => {
              if (!activeTimer.isRunning) {
                startTimer({ mode: 'stopwatch' });
                resetTimer();
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTimer.mode === 'stopwatch'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Stopwatch
          </button>
          
          <button
            id="mode-pomodoro"
            onClick={() => {
              if (!activeTimer.isRunning) {
                setTimerTargetMinutes(25);
                startTimer({ mode: 'pomodoro', targetSeconds: 25 * 60 });
                resetTimer();
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTimer.mode === 'pomodoro'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Pomodoro (25m)
          </button>

          <button
            id="mode-deepwork"
            onClick={() => {
              if (!activeTimer.isRunning) {
                setTimerTargetMinutes(50);
                startTimer({ mode: 'countdown', targetSeconds: 50 * 60 });
                resetTimer();
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTimer.mode === 'countdown'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Deep Flow (50m)
          </button>
        </div>

        {/* Category Pill with dropdown */}
        <div className="relative self-start sm:self-auto" ref={categoryDropdownRef}>
          <button
            id="btn-category-select"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${currentCategory.bgLight} ${currentCategory.borderColor} ${currentCategory.textColor}`}
          >
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: currentCategory.color }} 
            />
            <span>{currentCategory.name}</span>
            <ChevronDown className={`w-3 h-3 opacity-70 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCategoryDropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-56 max-w-[calc(100vw-3rem)] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Activity Category
              </div>
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span>{cat.name}</span>
                  </span>
                  {activeTimer.category === cat.id && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Main Focus Center: Radial Gauge and Big Numbers */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        
        {/* Circular SVG Gauge */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-zinc-100 dark:text-zinc-800"
            />
            {/* Animated Dynamic Arc */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              stroke={currentCategory.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Centered Numbers and Title inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4" ref={taskDropdownRef}>
            
            {/* Active Status Badge */}
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {activeTimer.isRunning && !activeTimer.isPaused ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  FOCUSING ACTIVE
                </span>
              ) : activeTimer.isPaused ? (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  PAUSED
                </span>
              ) : (
                <span className="text-zinc-400">READY TO FOCUS</span>
              )}
            </div>

            {/* Huge Monospace Timer Digits */}
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
              {timeDisplay.hours ? `${timeDisplay.hours}:` : ''}
              {timeDisplay.minutes}
              <span className="text-zinc-400 dark:text-zinc-600">:</span>
              {timeDisplay.seconds}
            </div>

            {/* Task Name or Prompt */}
            <button
              onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
              className="mt-2 text-xs text-zinc-600 dark:text-zinc-300 font-medium max-w-[190px] truncate hover:text-blue-500 flex items-center justify-center gap-1 group"
              title="Click to link with a specific task"
            >
              <span>{activeTimer.taskTitle || 'Untitled Focus Block'}</span>
              <ChevronDown className={`w-3 h-3 opacity-50 group-hover:opacity-100 transition-transform duration-200 ${isTaskDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Task Link Dropdown */}
            {isTaskDropdownOpen && (
              <div className="absolute top-36 left-1/2 -translate-x-1/2 w-64 max-w-[calc(100vw-3.5rem)] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 py-1.5 z-50 text-left max-h-56 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Link to Today&apos;s Task
                </div>
                {todayTasks.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-zinc-400">No active tasks today</div>
                ) : (
                  todayTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTask(t)}
                      className="w-full px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-1">{t.targetMinutes || 25}m</span>
                    </button>
                  ))
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-center gap-3 mt-4">
        
        {/* Reset Button */}
        {activeTimer.elapsedSeconds > 0 && (
          <button
            id="btn-reset-timer"
            onClick={resetTimer}
            className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all active:scale-90"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Primary Play / Pause Button */}
        {!activeTimer.isRunning || activeTimer.isPaused ? (
          <button
            id="btn-start-resume-timer"
            onClick={() => {
              if (activeTimer.isPaused) {
                resumeTimer();
              } else {
                startTimer({
                  mode: activeTimer.mode,
                  targetSeconds: activeTimer.targetSeconds,
                  category: activeTimer.category,
                  taskTitle: activeTimer.taskTitle
                });
              }
            }}
            className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{activeTimer.elapsedSeconds > 0 ? 'Resume Focus' : 'Start Timer'}</span>
          </button>
        ) : (
          <button
            id="btn-pause-timer"
            onClick={pauseTimer}
            className="px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause Timer</span>
          </button>
        )}

        {/* Stop & Save Button */}
        {activeTimer.elapsedSeconds > 0 && (
          <button
            id="btn-finish-timer"
            onClick={handleFinishSession}
            className="px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Complete & Log this session"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Save Session</span>
          </button>
        )}

      </div>

      {/* Optional Session Notes drawer */}
      {activeTimer.elapsedSeconds > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center">
          {!isNotesOpen ? (
            <button
              onClick={() => setIsNotesOpen(true)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              + Add quick reflection notes to this session
            </button>
          ) : (
            <div className="w-full max-w-md flex items-center gap-2 animate-in fade-in">
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="What did you achieve or notice during this session?"
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => setIsNotesOpen(false)}
                className="text-xs px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
