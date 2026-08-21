import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Play, 
  Clock, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Sparkles, 
  Filter,
  CheckCircle,
  Circle,
  Calendar,
  AlertCircle,
  Repeat
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, Task, TaskPriority } from '../types';

export const TaskList: React.FC = () => {
  const { 
    tasks, 
    toggleTaskComplete, 
    deleteTask, 
    openTaskModal, 
    startTimer, 
    selectedDate,
    activeCategoryFilter,
    setActiveCategoryFilter,
    getCategory,
    categoryList,
    openCategoryModal
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayTasks = tasks.filter((t) => t.date === selectedDate);

  // Apply filters
  const filteredTasks = todayTasks.filter((task) => {
    if (activeCategoryFilter !== 'all' && task.category !== activeCategoryFilter) {
      return false;
    }
    if (filterTab === 'pending' && task.status === 'completed') return false;
    if (filterTab === 'completed' && task.status !== 'completed') return false;
    if (filterTab === 'urgent' && task.priority !== 'urgent' && task.priority !== 'high') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || (task.description && task.description.toLowerCase().includes(q));
    }
    return true;
  });

  // Separate recurring routine items from one-off tasks for cleaner presentation
  const routineTasks = filteredTasks.filter(t => t.isRecurringRoutine);
  const regularTasks = filteredTasks.filter(t => !t.isRecurringRoutine);

  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            URGENT
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            MED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            LOW
          </span>
        );
    }
  };

  const renderTaskItem = (task: Task) => {
    const categoryInfo = getCategory(task.category);
    const isDone = task.status === 'completed';

    return (
      <div
        key={task.id}
        className={`group relative flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
          isDone
            ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-75'
            : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs hover:shadow-xs'
        }`}
      >
        {/* Left Checkbox and Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          
          {/* Custom Animated Checkbox */}
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isDone
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border-2 border-zinc-300 dark:border-zinc-600 hover:border-blue-500 dark:hover:border-blue-400 text-transparent hover:text-blue-500'
            }`}
            title={isDone ? 'Mark as Incomplete' : 'Complete Task'}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Title, Details, Tags */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm font-semibold tracking-tight truncate ${
                isDone 
                  ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal' 
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}>
                {task.title}
              </h3>
              {renderPriorityBadge(task.priority)}
              {task.isRecurringRoutine && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-medium">
                  <Repeat className="w-2.5 h-2.5" />
                  Routine
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                {task.description}
              </p>
            )}

            {/* Bottom Meta Bar: Category badge, Target/Logged Time */}
            <div className="flex items-center gap-2.5 mt-2 text-[11px] flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${categoryInfo.bgLight} ${categoryInfo.textColor}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryInfo.color }} />
                {categoryInfo.name}
              </span>

              {/* Time logged pill */}
              <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>{task.loggedMinutes || 0}m</span>
                {task.targetMinutes && (
                  <span className="text-zinc-400">/ {task.targetMinutes} target</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Hover Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          
          {/* Start Timer on this Task */}
          {!isDone && (
            <button
              onClick={() => {
                startTimer({
                  taskId: task.id,
                  taskTitle: task.title,
                  category: task.category,
                  mode: 'pomodoro',
                  targetSeconds: (task.targetMinutes || 25) * 60
                });
              }}
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors"
              title="Launch Focus Timer on this task"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Edit Task */}
          <button
            onClick={() => openTaskModal(task)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Task */}
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Today&apos;s Focus & Tasks</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {todayTasks.length}
            </span>
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'all' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'pending' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'completed' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
              }`}
            >
              Done
            </button>
            <button
              onClick={() => setFilterTab('urgent')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'urgent' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
              }`}
            >
              Priority 🔥
            </button>
          </div>

          <button
            id="btn-add-task-inline"
            onClick={() => openTaskModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

      </div>

      {/* Task List Render */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {filterTab === 'completed' ? 'No completed tasks yet' : 'No tasks for this filter'}
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Add a clear high-value task or schedule routine rituals to build positive momentum today.
          </p>
          <button
            onClick={() => openTaskModal()}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Routine Section if available */}
          {routineTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <Repeat className="w-3 h-3 text-purple-500" />
                  Daily Routine Rituals ({routineTasks.filter(t => t.status === 'completed').length}/{routineTasks.length})
                </span>
              </div>
              <div className="space-y-2">
                {routineTasks.map(renderTaskItem)}
              </div>
            </div>
          )}

          {/* Regular Tasks */}
          {regularTasks.length > 0 && (
            <div className="space-y-2">
              {routineTasks.length > 0 && (
                <div className="flex items-center justify-between px-1 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Scheduled Focus Tasks ({regularTasks.filter(t => t.status === 'completed').length}/{regularTasks.length})
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {regularTasks.map(renderTaskItem)}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
