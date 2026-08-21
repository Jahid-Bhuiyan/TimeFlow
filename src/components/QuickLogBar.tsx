import React, { useState } from 'react';
import { Plus, Zap, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';
import { CATEGORY_LIST } from '../utils/categories';

export const QuickLogBar: React.FC = () => {
  const { quickLogActivity, soundEnabled } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('work');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const durationPresets = [15, 30, 45, 60, 90];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    quickLogActivity({
      taskTitle: title.trim(),
      category,
      durationMinutes,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setNotes('');
    setShowAdvanced(false);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Quick Activity Logger
          </h2>
          <span className="text-[11px] text-zinc-400">
            Log past routine or distraction in 3 seconds
          </span>
        </div>

        {/* Distraction Shortcut Button */}
        <button
          type="button"
          onClick={() => {
            setTitle('Social Media / Feed Distraction');
            setCategory('time_waste');
            setDurationMinutes(20);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100 transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Log Distraction</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Main Input Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            id="quick-log-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What activity did you just finish? (e.g., Code review, LeetCode, Feed scroll)"
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />

          {/* Quick Duration Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {durationPresets.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`px-2.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                  durationMinutes === mins
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>

        {/* Category Selector Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-zinc-400 font-medium mr-1">Category:</span>
          {CATEGORY_LIST.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? `${cat.bgLight} ${cat.borderColor} ${cat.textColor} ring-1 ring-offset-0 ring-current font-bold scale-102`
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: cat.color }} 
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

      </form>
    </div>
  );
};
