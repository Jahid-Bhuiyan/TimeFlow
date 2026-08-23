import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Play, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle,
  Repeat,
  X,
  Tag,
  AlertCircle,
  Calendar,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority } from '../types';

export const TaskList: React.FC = () => {
  const { 
    tasks, 
    toggleTaskComplete, 
    toggleTaskMissed,
    deleteTask, 
    moveTaskOrder,
    openTaskModal, 
    startTimer, 
    selectedDate,
    activeCategoryFilter,
    getCategory,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  // Status sort weight: active (0) -> completed (1) -> missed (2)
  const getStatusWeight = (st: Task['status']) => {
    if (st === 'pending' || st === 'in_progress') return 0;
    if (st === 'completed') return 1;
    if (st === 'missed') return 2;
    return 0;
  };

  const todayTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => {
      const weightDiff = getStatusWeight(a.status) - getStatusWeight(b.status);
      if (weightDiff !== 0) return weightDiff;
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return 0;
    });

  // Apply category and search filters
  const filteredTasks = todayTasks.filter((task) => {
    if (activeCategoryFilter !== 'all' && task.category !== activeCategoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || (task.description && task.description.toLowerCase().includes(q));
    }
    return true;
  });

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

  const renderTaskItem = (task: Task, index: number, list: Task[]) => {
    const categoryInfo = getCategory(task.category);
    const isDone = task.status === 'completed';
    const isMissed = task.status === 'missed';
    const isFirst = index === 0;
    const isLast = index === list.length - 1;

    return (
      <div
        key={task.id}
        onClick={() => setSelectedTaskDetail(task)}
        className={`group relative flex items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          isMissed
            ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/50 opacity-70'
            : isDone
            ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-75'
            : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-800 shadow-2xs hover:shadow-xs'
        }`}
      >
        {/* Left Section: Reorder Arrows, Complete / Missed Buttons & Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          
          {/* Up & Down Position Priority Arrows & Serial Index */}
          <div 
            className="flex items-center gap-1 shrink-0 -my-1" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => moveTaskOrder(task.id, 'up')}
                className="p-0.5 rounded text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors cursor-pointer"
                title="Move up in priority"
                aria-label="Move task up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => moveTaskOrder(task.id, 'down')}
                className="p-0.5 rounded text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors cursor-pointer"
                title="Move down in priority"
                aria-label="Move task down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 w-4 text-center select-none" title={`Serial position #${index + 1}`}>
              {index + 1}
            </span>
          </div>

          {/* Quick Status Buttons: Check (Done) & Cross (Missed) */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Custom Checkbox (Done) */}
            <button
              type="button"
              onClick={() => toggleTaskComplete(task.id)}
              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isDone
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border-2 border-zinc-300 dark:border-zinc-600 hover:border-emerald-500 dark:hover:border-emerald-400 text-transparent hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
              }`}
              title={isDone ? 'Mark as Incomplete (Restores plan time)' : 'Mark as Done (Deducts plan time)'}
              aria-label="Mark task as done"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Cross Button (Missed / Skipped) */}
            <button
              type="button"
              onClick={() => toggleTaskMissed(task.id)}
              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isMissed
                  ? 'bg-rose-600 text-white shadow-xs border border-rose-600'
                  : 'border-2 border-zinc-300 dark:border-zinc-600 hover:border-rose-500 dark:hover:border-rose-400 text-transparent hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
              }`}
              title={isMissed ? 'Restore Missed Task (Restores plan time)' : 'Mark as Missed (Deducts plan time & moves to bottom)'}
              aria-label="Mark task as missed"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Title and Tags */}
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-semibold tracking-tight truncate ${
              isMissed
                ? 'line-through text-rose-500/80 dark:text-rose-400/80 font-normal'
                : isDone 
                ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal' 
                : 'text-zinc-900 dark:text-zinc-100'
            }`}>
              {task.title}
            </h3>

            {isMissed ? (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                MISSED
              </span>
            ) : isDone ? (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                DONE
              </span>
            ) : (
              renderPriorityBadge(task.priority)
            )}

            {task.isRecurringRoutine && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-medium">
                <Repeat className="w-2.5 h-2.5" />
                Routine
              </span>
            )}
          </div>

          {/* Category badge & Target Time */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${categoryInfo.bgLight} ${categoryInfo.textColor}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryInfo.color }} />
              {categoryInfo.name}
            </span>

            <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-mono">
              <Clock className="w-3 h-3" />
              <span>{task.loggedMinutes || 0}m</span>
              {task.targetMinutes && (
                <span className="text-zinc-400">/ {task.targetMinutes}m</span>
              )}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-1.5 sm:ml-2" onClick={(e) => e.stopPropagation()}>
          
          {/* Start Timer on this Task */}
          {!isDone && !isMissed && (
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
              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
              title="Launch Focus Timer on this task"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Edit Task */}
          <button
            onClick={() => openTaskModal(task)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Task */}
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
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
      
      {/* Header & Satisfying Add Task Button */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <CheckCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Today&apos;s Tasks &amp; Routines
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {todayTasks.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {todayTasks.filter(t => t.status === 'completed').length} of {todayTasks.length} completed
            </p>
          </div>
        </div>

        {/* Satisfying Add Task Button */}
        <button
          id="btn-add-task-inline"
          type="button"
          onClick={() => openTaskModal()}
          className="group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
          <span>Add Task</span>
        </button>

      </div>

      {/* Task List Render */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No tasks scheduled for today
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Add a clear focus task or daily routine to build positive momentum today.
          </p>
          <button
            type="button"
            onClick={() => openTaskModal()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create First Task
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((t, idx) => renderTaskItem(t, idx, filteredTasks))}
        </div>
      )}

      {/* Detailed Card Modal when user clicks on any list item */}
      {selectedTaskDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedTaskDetail(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedTaskDetail(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badges / Header */}
            <div className="flex items-center gap-2 flex-wrap mb-3.5 pr-8">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                getCategory(selectedTaskDetail.category).bgLight
              } ${getCategory(selectedTaskDetail.category).textColor}`}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategory(selectedTaskDetail.category).color }} />
                {getCategory(selectedTaskDetail.category).name}
              </span>

              {renderPriorityBadge(selectedTaskDetail.priority)}

              {selectedTaskDetail.isRecurringRoutine && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold">
                  <Repeat className="w-3 h-3" />
                  {selectedTaskDetail.routineTimeSlot ? `${selectedTaskDetail.routineTimeSlot} Routine` : 'Routine'}
                </span>
              )}

              <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium ${
                selectedTaskDetail.status === 'missed'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : selectedTaskDetail.status === 'completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}>
                {selectedTaskDetail.status === 'missed' ? 'Missed / Skipped' : selectedTaskDetail.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
            </div>

            {/* Title */}
            <h3 className={`text-lg sm:text-xl font-bold tracking-tight mb-3 break-words ${
              selectedTaskDetail.status === 'missed'
                ? 'line-through text-rose-500/80 dark:text-rose-400/80'
                : selectedTaskDetail.status === 'completed' 
                ? 'line-through text-zinc-400 dark:text-zinc-500' 
                : 'text-zinc-900 dark:text-zinc-50 font-display'
            }`}>
              {selectedTaskDetail.title}
            </h3>

            {/* Full Detailed Description */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Description & Notes
              </label>
              {selectedTaskDetail.description ? (
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 leading-relaxed whitespace-pre-wrap break-words">
                  {selectedTaskDetail.description}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-xl sm:rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  No extra description or notes added for this task.
                </p>
              )}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-medium block">Target Time</span>
                <span className="text-xs font-semibold font-mono text-zinc-800 dark:text-zinc-200">
                  {selectedTaskDetail.targetMinutes || 25} min
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-[10px] text-zinc-400 font-medium block">Logged Time</span>
                <span className="text-xs font-semibold font-mono text-blue-600 dark:text-blue-400">
                  {selectedTaskDetail.loggedMinutes || 0} min
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-400 font-medium block">Scheduled Date</span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 mt-0.5 truncate">
                  <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate">{selectedTaskDetail.date}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons - Responsive Grid & Flex Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800">
              
              {/* Secondary Actions (Edit & Delete) */}
              <div className="flex items-center gap-2 order-2 sm:order-1">
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTaskDetail;
                    setSelectedTaskDetail(null);
                    openTaskModal(t);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTask(selectedTaskDetail.id);
                    setSelectedTaskDetail(null);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 bg-rose-50/60 dark:bg-rose-950/20 sm:bg-transparent transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Primary Actions (Start Timer, Mark Missed & Complete Status) */}
              <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 flex-wrap sm:flex-nowrap">
                {selectedTaskDetail.status !== 'completed' && selectedTaskDetail.status !== 'missed' && (
                  <button
                    type="button"
                    onClick={() => {
                      startTimer({
                        taskId: selectedTaskDetail.id,
                        taskTitle: selectedTaskDetail.title,
                        category: selectedTaskDetail.category,
                        mode: 'pomodoro',
                        targetSeconds: (selectedTaskDetail.targetMinutes || 25) * 60
                      });
                      setSelectedTaskDetail(null);
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Timer</span>
                  </button>
                )}

                {/* Mark as Missed Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    toggleTaskMissed(selectedTaskDetail.id);
                    setSelectedTaskDetail({
                      ...selectedTaskDetail,
                      status: selectedTaskDetail.status === 'missed' ? 'pending' : 'missed'
                    });
                  }}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedTaskDetail.status === 'missed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800'
                  }`}
                  title={selectedTaskDetail.status === 'missed' ? 'Restore task to active' : 'Mark task as missed and push to bottom'}
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{selectedTaskDetail.status === 'missed' ? 'Restore' : 'Missed'}</span>
                </button>

                {/* Complete Button */}
                <button
                  type="button"
                  onClick={() => {
                    toggleTaskComplete(selectedTaskDetail.id);
                    setSelectedTaskDetail({
                      ...selectedTaskDetail,
                      status: selectedTaskDetail.status === 'completed' ? 'pending' : 'completed'
                    });
                  }}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedTaskDetail.status === 'completed'
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{selectedTaskDetail.status === 'completed' ? 'Mark Pending' : 'Done'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
