import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Tag, AlertTriangle, CheckCircle2, Plus, Settings2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityCategory } from '../../types';
import { getTodayDateString } from '../../utils/mockData';

export const LogModal: React.FC = () => {
  const { 
    isLogModalOpen, 
    closeLogModal, 
    editingLog, 
    addTimeLog, 
    updateTimeLog, 
    selectedDate,
    categoryList,
    getCategory,
    openCategoryModal
  } = useApp();

  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('work');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [date, setDate] = useState<string>(selectedDate || getTodayDateString());
  const [startTimeOfDay, setStartTimeOfDay] = useState<string>('');
  const [endTimeOfDay, setEndTimeOfDay] = useState<string>('');
  const [notes, setNotes] = useState('');

  const durationPresets = [15, 25, 30, 45, 60, 90, 120];

  useEffect(() => {
    if (editingLog) {
      setTaskTitle(editingLog.taskTitle);
      setCategory(editingLog.category);
      const mins = editingLog.durationMinutes || 30;
      setDurationMinutes(mins);
      setIsCustomDuration(![15, 25, 30, 45, 60, 90, 120].includes(mins));
      setDate(editingLog.date);
      setNotes(editingLog.notes || '');
      if (editingLog.startTime) {
        try {
          const d = new Date(editingLog.startTime);
          setStartTimeOfDay(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
        } catch {
          setStartTimeOfDay('');
        }
      }
      if (editingLog.endTime) {
        try {
          const d = new Date(editingLog.endTime);
          setEndTimeOfDay(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
        } catch {
          setEndTimeOfDay('');
        }
      }
    } else {
      setTaskTitle('');
      setCategory('work');
      setDurationMinutes(30);
      setIsCustomDuration(false);
      setDate(selectedDate || getTodayDateString());
      setNotes('');
      // Set default start & end time based on current time
      const now = new Date();
      const endH = String(now.getHours()).padStart(2, '0');
      const endM = String(now.getMinutes()).padStart(2, '0');
      setEndTimeOfDay(`${endH}:${endM}`);
      const past = new Date(now.getTime() - 30 * 60000);
      const startH = String(past.getHours()).padStart(2, '0');
      const startM = String(past.getMinutes()).padStart(2, '0');
      setStartTimeOfDay(`${startH}:${startM}`);
    }
  }, [editingLog, isLogModalOpen, selectedDate]);

  // Handle time of day range change
  const handleStartTimeChange = (newStartTime: string) => {
    setStartTimeOfDay(newStartTime);
    if (newStartTime && endTimeOfDay) {
      const [sh, sm] = newStartTime.split(':').map(Number);
      const [eh, em] = endTimeOfDay.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0 && diff <= 1440) {
        setDurationMinutes(diff);
        setIsCustomDuration(true);
      }
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTimeOfDay(newEndTime);
    if (startTimeOfDay && newEndTime) {
      const [sh, sm] = startTimeOfDay.split(':').map(Number);
      const [eh, em] = newEndTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0 && diff <= 1440) {
        setDurationMinutes(diff);
        setIsCustomDuration(true);
      }
    }
  };

  if (!isLogModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || durationMinutes <= 0) return;

    const catDef = getCategory(category);
    const isProductive = catDef.isProductive;
    const now = new Date();
    const startTime = new Date(now.getTime() - durationMinutes * 60000).toISOString();
    const endTime = now.toISOString();

    if (editingLog && editingLog.id) {
      updateTimeLog(editingLog.id, {
        taskTitle: taskTitle.trim(),
        category,
        durationMinutes,
        date,
        notes: notes.trim() || undefined,
        isProductive
      });
    } else {
      addTimeLog({
        taskTitle: taskTitle.trim(),
        category,
        durationMinutes,
        date,
        startTime,
        endTime,
        notes: notes.trim() || undefined,
        isProductive
      });
    }

    closeLogModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close */}
        <button
          onClick={closeLogModal}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-display">
              {editingLog && editingLog.id ? 'Edit Activity Time Log' : 'Add Past Time Log'}
            </h2>
            <p className="text-xs text-zinc-400">
              Record completed offline tasks or unmonitored sessions
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="E.g., Client Architecture Sync, Feed Browsing, Workout..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category
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

          {/* Duration & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Duration (Minutes): <span className="font-mono text-blue-600">{durationMinutes}m ({Number((durationMinutes / 60).toFixed(1))}h)</span>
              </label>
              <div className="flex items-center gap-1 mb-2">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex-1 py-1 text-xs font-mono rounded-lg border transition-all ${
                      durationMinutes === mins
                        ? 'bg-blue-600 text-white font-bold border-blue-600'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="720"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Date of Activity
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Session Notes / Context (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What specifically was covered or what distraction occurred?"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeLogModal}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {editingLog && editingLog.id ? 'Save Log' : 'Register Time'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
