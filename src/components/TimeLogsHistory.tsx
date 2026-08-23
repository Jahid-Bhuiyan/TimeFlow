import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, TimeLog } from '../types';

export const TimeLogsHistory: React.FC = () => {
  const { 
    timeLogs, 
    deleteTimeLog, 
    clearAllTimeLogs,
    openLogModal, 
    exportData,
    categoryList,
    getCategory
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<ActivityCategory | 'all'>('all');
  const [filterProductive, setFilterProductive] = useState<'all' | 'productive' | 'waste'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredLogs = timeLogs.filter((log) => {
    if (selectedCat !== 'all' && log.category !== selectedCat) return false;
    if (filterProductive === 'productive' && !log.isProductive) return false;
    if (filterProductive === 'waste' && log.category !== 'time_waste') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.taskTitle.toLowerCase().includes(q) ||
        (log.notes && log.notes.toLowerCase().includes(q)) ||
        log.date.includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    const timeA = new Date(a.startTime || a.date).getTime();
    const timeB = new Date(b.startTime || b.date).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const totalMinutes = filteredLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  const totalHours = Number((totalMinutes / 60).toFixed(1));

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-display">
              Activity History & Time Logs
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Complete chronological record of all focus blocks and recorded activities ({filteredLogs.length} logs, {totalHours} total hrs)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {timeLogs.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
              title="Clear all recorded logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Logs</span>
            </button>
          )}

          <button
            onClick={() => exportData('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
            title="Export as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openLogModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manual Log</span>
          </button>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowClearConfirm(false)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Clear All Activity Logs?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              This will permanently delete all {timeLogs.length} activity time records and reset today&apos;s logged hours. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllTimeLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Yes, Clear All Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by activity name, notes, or date..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category dropdown filter */}
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value as any)}
          aria-label="Filter by activity category"
          className="text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categoryList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Productive vs Waste Filter */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilterProductive('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterProductive === 'all' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterProductive('productive')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterProductive === 'productive' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
            }`}
          >
            Productive
          </button>
          <button
            onClick={() => setFilterProductive('waste')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filterProductive === 'waste' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
            }`}
          >
            Distraction
          </button>
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
          title={`Sort: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

      </div>

      {/* Logs Table / List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
          <Clock className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No time logs matched your filters</h4>
          <p className="text-xs text-zinc-400 mt-1">Start a live focus session or click &quot;Add Manual Log&quot; to register completed time.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-2xs">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredLogs.map((log) => {
              const catDef = getCategory(log.category);
              const isWaste = !catDef.isProductive || log.category === 'time_waste';

              return (
                <div
                  key={log.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${
                      isWaste
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : log.isProductive
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        : 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400'
                    }`}>
                      {isWaste ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {log.taskTitle}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${catDef.bgLight} ${catDef.textColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catDef.color }} />
                          {catDef.name}
                        </span>
                      </div>

                      {log.notes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 italic">
                          &ldquo;{log.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {log.date}
                        </span>
                        {log.startTime && (
                          <span>
                            {new Date(log.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right duration & actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-left sm:text-right">
                      <div className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {log.durationMinutes >= 60 ? `${(log.durationMinutes / 60).toFixed(1)}h` : `${log.durationMinutes}m`}
                      </div>
                      <span className={`text-[10px] font-medium ${
                        isWaste ? 'text-rose-500' : log.isProductive ? 'text-emerald-500' : 'text-zinc-400'
                      }`}>
                        {isWaste ? 'Distraction' : log.isProductive ? 'Productive' : 'Neutral'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openLogModal(log)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Log"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTimeLog(log.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
