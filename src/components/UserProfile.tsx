import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Target, 
  Clock, 
  LogOut, 
  FileJson, 
  FileSpreadsheet, 
  Sparkles,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UserProfile: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    logout, 
    setIsAuthModalOpen, 
    theme, 
    toggleTheme, 
    soundEnabled, 
    toggleSound, 
    exportData, 
    importData, 
    resetToDemoData,
    tasks,
    timeLogs,
    openCategoryModal
  } = useApp();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dailyGoalHours, setDailyGoalHours] = useState(user?.dailyGoalHours || 6.0);
  const [isSaved, setIsSaved] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      username: username.trim() || 'Productivity User',
      email: email.trim(),
      dailyGoalHours: Number(dailyGoalHours)
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (!success) {
        setImportError('Invalid JSON backup file structure.');
      } else {
        setImportError(null);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-display">
                {user?.username || 'Guest Member'}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {user?.email || 'guest@timeflow.local'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Preferences Form */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Account Preferences & Target Goals
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Username / Display Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Daily Goal Target Slider */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-500" />
                Daily Productive Focus Goal:
              </span>
              <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                {dailyGoalHours} Hours / Day
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(parseFloat(e.target.value))}
              aria-label="Daily Productive Focus Goal in Hours"
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>2.0 hrs (Light focus)</span>
              <span>6.0 hrs (Recommended standard)</span>
              <span>12.0 hrs (Extreme sprint)</span>
            </div>
          </div>

          {/* Theme & Sound Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Color Appearance</div>
                  <div className="text-[11px] text-zinc-400">{theme === 'dark' ? 'Minimalist Dark Canvas' : 'Clean Soft Light Canvas'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 font-medium"
              >
                Toggle Mode
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
                <div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Audio Haptic Chimes</div>
                  <div className="text-[11px] text-zinc-400">{soundEnabled ? 'Timer & completion feedback ON' : 'Muted'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 font-medium"
              >
                {soundEnabled ? 'Mute' : 'Enable'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Activity Categories</div>
                  <div className="text-[11px] text-zinc-400">Add custom categories, change colors or productivity types</div>
                </div>
              </div>
              <button
                type="button"
                onClick={openCategoryModal}
                className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-semibold hover:bg-purple-100 transition-colors"
              >
                Manage Categories
              </button>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            {isSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Settings saved!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>

      {/* Backup, Export & Restore Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Data Ownership & Export Options
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Your data is 100% yours. Export full backups as JSON, generate CSV activity logs for spreadsheets, or load demo data anytime.
        </p>

        {importError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900">
            {importError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Export JSON */}
          <button
            onClick={() => exportData('json')}
            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex flex-col items-center text-center gap-2 cursor-pointer"
          >
            <FileJson className="w-6 h-6 text-blue-500" />
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Full Backup (JSON)</div>
              <div className="text-[10px] text-zinc-400">All tasks, routines & logs</div>
            </div>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportData('csv')}
            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex flex-col items-center text-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Spreadsheet (CSV)</div>
              <div className="text-[10px] text-zinc-400">Activity timestamps & durations</div>
            </div>
          </button>

          {/* Import JSON Backup */}
          <label className="p-3.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex flex-col items-center text-center gap-2 cursor-pointer">
            <Upload className="w-6 h-6 text-purple-500" />
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Restore Backup</div>
              <div className="text-[10px] text-zinc-400">Upload .json file</div>
            </div>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

        </div>

        {/* Reset to Demo Data button */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Currently storing {tasks.length} tasks and {timeLogs.length} tracked activity logs.
          </div>
          <button
            onClick={resetToDemoData}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Initial Demo Dataset</span>
          </button>
        </div>

      </div>

    </div>
  );
};
