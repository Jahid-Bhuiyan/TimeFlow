import React, { useState } from 'react';
import { Plus, Zap, AlertTriangle, ChevronDown, Settings2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';

export const QuickLogBar: React.FC = () => {
  const { quickLogActivity, categoryList, openCategoryModal, getCategory } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('work');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [notes, setNotes] = useState('');

  const durationPresets = [15, 30, 45, 60, 90];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || durationMinutes <= 0) return;

    quickLogActivity({
      taskTitle: title.trim(),
      category,
      durationMinutes,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setNotes('');
  };

  const handleDropdownChange = (val: string) => {
    if (val === '__add_new__') {
      openCategoryModal();
    } else {
      setCategory(val);
    }
  };

  const selectedCategoryInfo = getCategory(category);

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Quick Activity Logger
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Distraction Shortcut Button */}
          <button
            type="button"
            onClick={() => {
              setTitle('Social Media / Feed Distraction');
              setCategory('time_waste');
              setDurationMinutes(20);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Log Distraction</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Main Input Row */}
        <div className="flex flex-col lg:flex-row gap-2">
          <input
            type="text"
            id="quick-log-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What activity did you just finish?"
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-0"
          />

          {/* Quick Duration Buttons & Custom Input */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {durationPresets.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  setDurationMinutes(mins);
                  setIsCustomDuration(false);
                }}
                className={`flex-1 sm:flex-initial px-2 sm:px-2.5 py-2 rounded-lg text-xs font-mono font-medium transition-all shrink-0 text-center cursor-pointer ${
                  durationMinutes === mins && !isCustomDuration
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {mins}m
              </button>
            ))}

            {/* Manual Exact Duration Input Box */}
            <div className="relative flex items-center shrink-0">
              <input
                type="number"
                min="1"
                max="720"
                placeholder="Exact"
                value={isCustomDuration ? durationMinutes : ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setIsCustomDuration(true);
                  if (!isNaN(val)) {
                    setDurationMinutes(Math.max(1, Math.min(720, val)));
                  }
                }}
                onFocus={() => setIsCustomDuration(true)}
                className={`w-14 sm:w-16 px-1.5 sm:px-2 py-2 text-center text-xs font-mono rounded-lg border transition-all ${
                  isCustomDuration
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                title="Input exact minutes manually"
              />
              <span className="text-[10px] text-zinc-400 ml-1 font-mono">m</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>

        {/* Category Selector: Dropdown for Mobile / Compact screens + Chips for Desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          {/* Mobile Category Dropdown Selector */}
          <div className="sm:hidden w-full">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-zinc-400 font-medium">
                Category:
              </label>
              <button
                type="button"
                onClick={() => openCategoryModal()}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>
            
            <div className="relative">
              <select
                value={category}
                onChange={(e) => handleDropdownChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <optgroup label="Available Categories">
                  {categoryList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.isProductive ? 'Productive' : 'Distraction/Break'})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Category Actions">
                  <option value="__add_new__">+ Add / Edit Categories...</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Desktop Category Chips & Manage Button */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">Category:</span>
            {categoryList.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-1 ring-offset-0 font-bold scale-102'
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
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: cat.color }} 
                  />
                  <span>{cat.name}</span>
                </button>
              );
            })}

            {/* Desktop Add/Manage Category Pill */}
            <button
              type="button"
              onClick={() => openCategoryModal()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 transition-colors cursor-pointer ml-1"
              title="Add or edit categories"
            >
              <Plus className="w-3 h-3" />
              <span>Category</span>
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
