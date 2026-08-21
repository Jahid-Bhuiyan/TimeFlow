import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Lightbulb, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calculateMonthlyInsight, getDailyChartData } from '../utils/analytics';
import { ActivityCategory } from '../types';

export const MonthlyAnalytics: React.FC = () => {
  const { tasks, timeLogs, openTaskModal, categories, getCategory } = useApp();

  // Current selected month (YYYY-MM)
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [chartViewMode, setChartViewMode] = useState<'area' | 'bar'>('area');

  // Compute insights for selected month
  const insight = useMemo(() => {
    return calculateMonthlyInsight(tasks, timeLogs, selectedMonth, categories);
  }, [tasks, timeLogs, selectedMonth, categories]);

  // Compute daily series for Recharts
  const dailyChartData = useMemo(() => {
    return getDailyChartData(timeLogs, selectedMonth, categories);
  }, [timeLogs, selectedMonth, categories]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonth(prevDate.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonth(nextDate.toISOString().slice(0, 7));
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
          <p className="font-bold text-zinc-900 dark:text-zinc-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold">{entry.value} hrs</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-display">
              Monthly Performance & Habit Analytics
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track productive momentum, discover where hours slip away, and eliminate time-wasting loops.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-semibold px-2 min-w-[110px] text-center text-zinc-900 dark:text-zinc-100 font-mono">
            {insight.monthName}
          </span>

          <button
            onClick={handleNextMonth}
            disabled={selectedMonth >= currentMonthKey}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 disabled:opacity-30 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Core Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Productive Hours */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Productive Hours
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {insight.totalProductiveHours}
              <span className="text-sm font-normal text-zinc-400 ml-1">hrs</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Avg {insight.dailyAverageProductiveHours}h / active day</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Time Wasted */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Time Wasted / Distraction
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {insight.totalWasteHours}
              <span className="text-sm font-normal text-zinc-400 ml-1">hrs</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{Math.round((insight.totalWasteHours / Math.max(1, insight.totalTrackedHours)) * 100)}% of total logged time</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Focus Efficiency Rate */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Focus Efficiency Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {insight.productivityRate}
              <span className="text-sm font-normal text-zinc-400 ml-0.5">%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-indigo-600 rounded-full" 
                style={{ width: `${insight.productivityRate}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Longest Focus Streak */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Focus Streak
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {insight.longestStreakDays}
              <span className="text-sm font-normal text-zinc-400 ml-1">days</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
              Current: {insight.currentStreakDays} days consecutive
            </p>
          </div>
        </div>

      </div>

      {/* Main Charts Row: Daily Timeline Trend + Category Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Progress Trend Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Daily Focus vs. Distraction Timeline
              </h3>
              <p className="text-xs text-zinc-400">
                Day-by-day comparison of productive flow hours (blue) and wasted time (rose)
              </p>
            </div>

            {/* Toggle chart style */}
            <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
              <button
                onClick={() => setChartViewMode('area')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartViewMode === 'area' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartViewMode('bar')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartViewMode === 'bar' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs font-bold' : 'text-zinc-500'
                }`}
              >
                Stacked Bar
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'area' ? (
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
                  <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} unit="h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="productive"
                    name="Productive"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProd)"
                  />
                  <Area
                    type="monotone"
                    dataKey="waste"
                    name="Time Waste"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWaste)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
                  <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} unit="h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="productive" name="Productive" fill="#3B82F6" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="waste" name="Time Waste" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Activity Category Distribution
            </h3>
            <p className="text-xs text-zinc-400">
              Time proportion across all logged activities
            </p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insight.categoryBreakdown}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {insight.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} hrs`, name]}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Chips Breakdown */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {insight.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                  {cat.hours}h ({cat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Deep Dive Row: Time Waste Hunter & Top Productive Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Time Waste Hunter (Top Distractions & Cost) */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-950/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Time-Waste Elimination Radar
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
              {insight.totalWasteHours}h Lost This Month
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Unplanned activities that drain mental energy and stall high-priority goals:
          </p>

          {insight.topTimeWastingActivities.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400">
              No time-waste activities logged for this period!
            </div>
          ) : (
            <div className="space-y-2.5">
              {insight.topTimeWastingActivities.map((waste, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {waste.title}
                    </p>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      {waste.costEstimate}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {waste.hours}h
                    </span>
                    <p className="text-[10px] text-zinc-400">{waste.percentage}% of waste</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Top Productive Activities */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Top Productive Workflows
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
              {insight.totalProductiveHours}h High Impact
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Activities that contributed the highest cognitive output and routine completion:
          </p>

          <div className="space-y-2.5">
            {insight.topProductiveActivities.map((act, idx) => {
              const catDef = getCategory(act.category);
              return (
                <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {act.title}
                    </p>
                    <span className={`text-[10px] font-medium ${catDef.textColor}`}>
                      {catDef.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {act.hours}h
                    </span>
                    <p className="text-[10px] text-zinc-400">{act.percentage}% of output</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row: Important Tasks Neglected & Smart Improvement Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Important Tasks Neglected */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-amber-950/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Important Tasks Neglected
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
              {insight.neglectedImportantTasks.length} Pending High-Priority
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Tasks marked High/Urgent priority that have remained untouched or pending:
          </p>

          {insight.neglectedImportantTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              No high-priority tasks are currently neglected!
            </div>
          ) : (
            <div className="space-y-2.5">
              {insight.neglectedImportantTasks.slice(0, 4).map((neg) => (
                <div key={neg.id} className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {neg.title}
                    </p>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                      Pending for {neg.daysPending} days
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const task = tasks.find(t => t.id === neg.id);
                      if (task) openTaskModal(task);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-medium hover:opacity-90 shrink-0"
                  >
                    Schedule Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Areas Needing Improvement / Smart Action Plan */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Actionable Optimization Tips
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Calculated recommendations to boost next month&apos;s focus consistency:
            </p>

            <div className="space-y-2.5">
              {insight.improvementTips.map((tip, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Calculated from {timeLogs.length} tracked activity logs</span>
            <span className="font-semibold text-blue-500">Continuous Optimization</span>
          </div>
        </div>

      </div>

    </div>
  );
};
