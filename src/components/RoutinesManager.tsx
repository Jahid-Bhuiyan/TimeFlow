import React, { useState } from 'react';
import { 
  Repeat, 
  Sun, 
  Sunset, 
  Moon, 
  Plus, 
  Play, 
  Check, 
  Sparkles, 
  Clock, 
  Flame, 
  Award,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/categories';
import { ActivityCategory, RoutineSlot } from '../types';

export const RoutinesManager: React.FC = () => {
  const { tasks, addTask, startTimer, openTaskModal, selectedDate } = useApp();

  const [routineTitle, setRoutineTitle] = useState('');
  const [slot, setSlot] = useState<RoutineSlot>('morning');
  const [category, setCategory] = useState<ActivityCategory>('fitness');
  const [duration, setDuration] = useState<number>(15);

  const routineSlots = [
    { id: 'morning', label: 'Morning Kickoff', icon: Sun, color: 'text-amber-500', desc: 'Build initial momentum' },
    { id: 'afternoon', label: 'Afternoon Flow', icon: Sunset, color: 'text-orange-500', desc: 'Peak cognitive stamina' },
    { id: 'evening', label: 'Evening Shutdown', icon: Moon, color: 'text-indigo-500', desc: 'Reflect and disconnect' }
  ] as const;

  const currentRoutineTasks = tasks.filter(t => t.isRecurringRoutine);

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTitle.trim()) return;

    addTask({
      title: routineTitle.trim(),
      category,
      priority: 'medium',
      status: 'pending',
      date: selectedDate,
      targetMinutes: duration,
      isRecurringRoutine: true,
      routineTimeSlot: slot
    });

    setRoutineTitle('');
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Repeat className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-display">
            Daily Routine Rituals & Habit Stacking
          </h1>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Lock in morning prime-time habits, mid-day recovery, and evening reviews to safeguard willpower and prevent burnout.
        </p>
      </div>

      {/* Routine Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routineSlots.map((rSlot) => {
          const Icon = rSlot.icon;
          const slotTasks = currentRoutineTasks.filter(t => t.routineTimeSlot === rSlot.id || (!t.routineTimeSlot && rSlot.id === 'morning'));
          const completedCount = slotTasks.filter(t => t.status === 'completed').length;

          return (
            <div key={rSlot.id} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${rSlot.color}`} />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{rSlot.label}</h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {completedCount}/{slotTasks.length}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 mb-3">{rSlot.desc}</p>

                {/* Items in Slot */}
                <div className="space-y-2">
                  {slotTasks.length === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-400">
                      No routine items in this block
                    </div>
                  ) : (
                    slotTasks.map((t) => {
                      const cat = CATEGORIES[t.category] || CATEGORIES.work;
                      const isDone = t.status === 'completed';
                      return (
                        <div
                          key={t.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                            isDone 
                              ? 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200/40 text-zinc-400' 
                              : 'bg-zinc-50/50 dark:bg-zinc-800/60 border-zinc-200/70 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className={`truncate font-medium ${isDone ? 'line-through' : ''}`}>
                              {t.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-zinc-400">{t.targetMinutes || 15}m</span>
                            {!isDone && (
                              <button
                                onClick={() => startTimer({
                                  taskId: t.id,
                                  taskTitle: t.title,
                                  category: t.category,
                                  mode: 'pomodoro',
                                  targetSeconds: (t.targetMinutes || 15) * 60
                                })}
                                className="p-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                                title="Start Routine Timer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Button inside Card */}
              <button
                onClick={() => {
                  setSlot(rSlot.id);
                  openTaskModal({
                    id: '',
                    userId: '',
                    title: '',
                    category: rSlot.id === 'morning' ? 'fitness' : rSlot.id === 'afternoon' ? 'work' : 'personal',
                    priority: 'medium',
                    status: 'pending',
                    date: selectedDate,
                    targetMinutes: 15,
                    loggedMinutes: 0,
                    isRecurringRoutine: true,
                    routineTimeSlot: rSlot.id,
                    createdAt: '',
                    updatedAt: ''
                  });
                }}
                className="mt-3 w-full py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add to {rSlot.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Routine Quick Creator */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Quick Add Recurring Habit
        </h3>

        <form onSubmit={handleAddRoutine} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={routineTitle}
            onChange={(e) => setRoutineTitle(e.target.value)}
            placeholder="E.g., 10 min Box Breathing & Sunlight, Inbox Triaging, Daily Reading..."
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />

          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value as RoutineSlot)}
            aria-label="Select routine slot"
            className="text-xs px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            <option value="morning">Morning Kickoff</option>
            <option value="afternoon">Afternoon Flow</option>
            <option value="evening">Evening Shutdown</option>
          </select>

          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            aria-label="Select routine target duration"
            className="text-xs px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>

          <button
            type="submit"
            disabled={!routineTitle.trim()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Ritual</span>
          </button>
        </form>
      </div>

    </div>
  );
};
