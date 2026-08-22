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
  Zap,
  X,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, RoutineSlot, Task } from '../types';
import { formatMinutesDuration } from '../utils/mockData';

export const RoutinesManager: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    startTimer, 
    openTaskModal, 
    selectedDate, 
    toggleTaskComplete, 
    toggleTaskMissed,
    deleteTask,
    moveTaskOrder,
    getCategory,
    categoryList
  } = useApp();

  const [routineTitle, setRoutineTitle] = useState('');
  const [slot, setSlot] = useState<RoutineSlot>('morning');
  const [category, setCategory] = useState<ActivityCategory>('fitness');
  const [duration, setDuration] = useState<number>(15);
  const [selectedRoutine, setSelectedRoutine] = useState<Task | null>(null);

  const routineSlots = [
    { id: 'morning', label: 'Morning Kickoff', icon: Sun, color: 'text-amber-500' },
    { id: 'afternoon', label: 'Afternoon Flow', icon: Sunset, color: 'text-orange-500' },
    { id: 'evening', label: 'Evening Shutdown', icon: Moon, color: 'text-indigo-500' }
  ] as const;

  const currentRoutineTasks = tasks.filter(t => t.isRecurringRoutine && t.date === selectedDate);
  const activeRoutineTasks = currentRoutineTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');

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

  // Active / remaining routine planned time (deducts done and missed)
  const remainingRoutineMinutes = activeRoutineTasks.reduce((sum, t) => sum + (t.targetMinutes || 0), 0);

  const getStatusWeight = (st: Task['status']) => {
    if (st === 'pending' || st === 'in_progress') return 0;
    if (st === 'completed') return 1;
    if (st === 'missed') return 2;
    return 0;
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-display">
              Daily Routine Rituals & Habit Stacking
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Recurring daily habits that automatically refresh every day
            </p>
          </div>
        </div>

        {/* Total Time Count Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-semibold text-xs self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>Active Routine Plan: {formatMinutesDuration(remainingRoutineMinutes)} remaining</span>
        </div>
      </div>

      {/* Routine Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routineSlots.map((rSlot) => {
          const Icon = rSlot.icon;
          const slotTasks = currentRoutineTasks
            .filter(t => t.routineTimeSlot === rSlot.id || (!t.routineTimeSlot && rSlot.id === 'morning'))
            .sort((a, b) => {
              const weightDiff = getStatusWeight(a.status) - getStatusWeight(b.status);
              if (weightDiff !== 0) return weightDiff;
              if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
              }
              return 0;
            });
          const completedCount = slotTasks.filter(t => t.status === 'completed').length;
          const activeSlotTasks = slotTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
          const slotRemainingMinutes = activeSlotTasks.reduce((sum, t) => sum + (t.targetMinutes || 0), 0);

          return (
            <div key={rSlot.id} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${rSlot.color}`} />
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{rSlot.label}</h3>
                      <span className="text-[10px] text-zinc-400 font-medium">{formatMinutesDuration(slotRemainingMinutes)} active plan</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {completedCount}/{slotTasks.length}
                  </span>
                </div>

                {/* Items in Slot */}
                <div className="space-y-2">
                  {slotTasks.length === 0 ? (
                    <div className="py-4 text-center text-xs text-zinc-400">
                      No routine items in this block
                    </div>
                  ) : (
                    slotTasks.map((t, idx) => {
                      const cat = getCategory(t.category);
                      const isDone = t.status === 'completed';
                      const isMissed = t.status === 'missed';
                      const isFirst = idx === 0;
                      const isLast = idx === slotTasks.length - 1;

                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedRoutine(t)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all cursor-pointer hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-xs ${
                            isMissed
                              ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/60 text-rose-600/80 opacity-70'
                              : isDone 
                              ? 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200/40 text-zinc-400 opacity-75' 
                              : 'bg-zinc-50/50 dark:bg-zinc-800/60 border-zinc-200/70 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* Reorder Arrows */}
                            <div 
                              className="flex flex-col items-center justify-center shrink-0 -my-1" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => moveTaskOrder(t.id, 'up')}
                                className="p-0.5 rounded text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                title="Move up in routine slot"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => moveTaskOrder(t.id, 'down')}
                                className="p-0.5 rounded text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                title="Move down in routine slot"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Done & Missed Quick Buttons */}
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleTaskComplete(t.id)}
                                className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border border-zinc-300 dark:border-zinc-600 text-transparent hover:text-emerald-500 hover:border-emerald-500'
                                }`}
                                title={isDone ? 'Mark Incomplete' : 'Mark Done (Deducts plan time)'}
                              >
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTaskMissed(t.id)}
                                className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                  isMissed
                                    ? 'bg-rose-600 text-white border border-rose-600 shadow-xs'
                                    : 'border border-zinc-300 dark:border-zinc-600 text-transparent hover:text-rose-500 hover:border-rose-500'
                                }`}
                                title={isMissed ? 'Restore Missed Routine' : 'Mark Missed (Deducts plan time & moves to bottom)'}
                              >
                                <X className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>

                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className={`truncate font-medium ${isMissed ? 'line-through text-rose-500/80' : isDone ? 'line-through text-zinc-400' : ''}`}>
                              {t.title}
                            </span>
                            {isMissed && (
                              <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                MISSED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-mono text-zinc-400">{t.loggedMinutes || 0}m / {t.targetMinutes || 15}m</span>
                            {!isDone && !isMissed && (
                              <button
                                onClick={() => startTimer({
                                  taskId: t.id,
                                  taskTitle: t.title,
                                  category: t.category,
                                  mode: 'pomodoro',
                                  targetSeconds: (t.targetMinutes || 15) * 60
                                })}
                                className="p-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 cursor-pointer"
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
                className="mt-3 w-full py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
            aria-label="Select routine category"
            className="text-xs px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            {categoryList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

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

      {/* Routine Detail Card Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedRoutine(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                {selectedRoutine.routineTimeSlot ? `${selectedRoutine.routineTimeSlot} Routine` : 'Daily Ritual'}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                selectedRoutine.status === 'completed' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
              }`}>
                {selectedRoutine.status === 'completed' ? 'Completed Today' : 'Pending'}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {selectedRoutine.title}
            </h3>

            {/* Description if any */}
            {selectedRoutine.description ? (
              <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4 leading-relaxed">
                {selectedRoutine.description}
              </p>
            ) : (
              <p className="text-xs text-zinc-400 italic mb-4">
                No extra notes provided for this routine habit.
              </p>
            )}

            {/* Info Badges */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-medium block">Category</span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                  {getCategory(selectedRoutine.category).name}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-medium block">Target Time</span>
                <span className="text-xs font-semibold font-mono text-zinc-800 dark:text-zinc-200">
                  {selectedRoutine.loggedMinutes || 0}m / {selectedRoutine.targetMinutes || 15} target
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const r = selectedRoutine;
                    setSelectedRoutine(null);
                    openTaskModal(r);
                  }}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Edit Ritual"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    deleteTask(selectedRoutine.id);
                    setSelectedRoutine(null);
                  }}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete Ritual"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Missed / Cross Button */}
                <button
                  onClick={() => {
                    toggleTaskMissed(selectedRoutine.id);
                    setSelectedRoutine({
                      ...selectedRoutine,
                      status: selectedRoutine.status === 'missed' ? 'pending' : 'missed'
                    });
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    selectedRoutine.status === 'missed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800'
                  }`}
                  title={selectedRoutine.status === 'missed' ? 'Restore routine' : 'Mark missed (deducts time & pushes to bottom)'}
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{selectedRoutine.status === 'missed' ? 'Restore' : 'Missed'}</span>
                </button>

                <button
                  onClick={() => {
                    toggleTaskComplete(selectedRoutine.id);
                    setSelectedRoutine({
                      ...selectedRoutine,
                      status: selectedRoutine.status === 'completed' ? 'pending' : 'completed'
                    });
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    selectedRoutine.status === 'completed'
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedRoutine.status === 'completed' ? 'Mark Incomplete' : 'Complete'}</span>
                </button>

                {selectedRoutine.status !== 'completed' && selectedRoutine.status !== 'missed' && (
                  <button
                    onClick={() => {
                      const r = selectedRoutine;
                      setSelectedRoutine(null);
                      startTimer({
                        taskId: r.id,
                        taskTitle: r.title,
                        category: r.category,
                        mode: 'pomodoro',
                        targetSeconds: (r.targetMinutes || 15) * 60
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Focus Now</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
