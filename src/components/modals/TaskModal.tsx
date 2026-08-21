import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Clock, Tag, Flag, Repeat, Sparkles, Plus, Settings2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityCategory, RoutineSlot, TaskPriority } from '../../types';

export const TaskModal: React.FC = () => {
  const { 
    isTaskModalOpen, 
    closeTaskModal, 
    editingTask, 
    addTask, 
    updateTask, 
    selectedDate,
    categoryList,
    openCategoryModal
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [targetMinutes, setTargetMinutes] = useState<number>(30);
  const [isRecurring, setIsRecurring] = useState(false);
  const [routineSlot, setRoutineSlot] = useState<RoutineSlot>('morning');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setTargetMinutes(editingTask.targetMinutes || 30);
      setIsRecurring(editingTask.isRecurringRoutine || false);
      setRoutineSlot(editingTask.routineTimeSlot || 'morning');
    } else {
      setTitle('');
      setDescription('');
      setCategory('work');
      setPriority('medium');
      setTargetMinutes(30);
      setIsRecurring(false);
      setRoutineSlot('morning');
    }
  }, [editingTask, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask && editingTask.id) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        targetMinutes,
        isRecurringRoutine: isRecurring,
        routineTimeSlot: isRecurring ? routineSlot : undefined
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status: 'pending',
        date: selectedDate,
        targetMinutes,
        isRecurringRoutine: isRecurring,
        routineTimeSlot: isRecurring ? routineSlot : undefined
      });
    }

    closeTaskModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close */}
        <button
          onClick={closeTaskModal}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-display">
              {editingTask && editingTask.id ? 'Edit Focus Task' : 'Create New Focus Task'}
            </h2>
            <p className="text-xs text-zinc-400">
              Define target duration and category for accurate productivity analytics
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Complete API endpoint caching, Finish LeetCode daily..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes or Sub-steps (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key milestones, links, or criteria for completion..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Activity Category
              </label>
              <button
                type="button"
                onClick={() => openCategoryModal()}
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add / Manage Categories</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {categoryList.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-1 ring-offset-0 font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${cat.color}15`,
                            borderColor: `${cat.color}60`,
                            color: cat.color
                          }
                        : undefined
                    }
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Target Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-semibold uppercase rounded-lg border text-center transition-all ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : p === 'high'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : p === 'medium'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-zinc-700 text-white border-zinc-700 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Duration */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Target Minutes: <span className="font-mono text-blue-600">{targetMinutes}m</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetMinutes(mins)}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                      targetMinutes === mins
                        ? 'bg-blue-600 text-white font-bold border-blue-600'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Routine Toggle */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-500" />
              <div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Daily Recurring Routine</span>
                <p className="text-[10px] text-zinc-400">Keep in daily ritual checklist</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isRecurring && (
                <select
                  value={routineSlot}
                  onChange={(e) => setRoutineSlot(e.target.value as RoutineSlot)}
                  aria-label="Routine time slot"
                  className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {editingTask && editingTask.id ? 'Save Changes' : 'Add to Today'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
