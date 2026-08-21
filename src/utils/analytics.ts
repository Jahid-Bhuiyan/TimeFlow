import { ActivityCategory, CategoryInfo, MonthlyInsight, Task, TimeLog } from '../types';
import { DEFAULT_CATEGORIES, getCategoryInfo } from './categories';

export const calculateMonthlyInsight = (
  tasks: Task[],
  timeLogs: TimeLog[],
  selectedMonthKey?: string, // e.g. '2026-08'
  categoriesMap?: Record<string, CategoryInfo>
): MonthlyInsight => {
  const currentMonthKey = selectedMonthKey || new Date().toISOString().slice(0, 7);
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  
  const dateObj = new Date(year, month - 1, 1);
  const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

  const activeCategories = categoriesMap || DEFAULT_CATEGORIES;

  // Filter logs belonging to the month
  const monthLogs = timeLogs.filter((log) => log.date.startsWith(currentMonthKey));

  let totalProductiveMinutes = 0;
  let totalWasteMinutes = 0;
  let totalTrackedMinutes = 0;

  const categoryMinutesMap: Record<string, number> = {};

  const activityDurationMap: Record<string, { title: string; category: ActivityCategory; minutes: number }> = {};
  const wasteActivityMap: Record<string, { title: string; minutes: number }> = {};
  const dateMinutesMap: Record<string, { productive: number; waste: number; other: number }> = {};

  monthLogs.forEach((log) => {
    const mins = log.durationMinutes || 0;
    totalTrackedMinutes += mins;

    categoryMinutesMap[log.category] = (categoryMinutesMap[log.category] || 0) + mins;

    const catDef = getCategoryInfo(activeCategories, log.category);
    if (log.category === 'time_waste' || (!catDef.isProductive && catDef.id === 'time_waste')) {
      totalWasteMinutes += mins;
      const key = log.taskTitle.trim();
      wasteActivityMap[key] = wasteActivityMap[key] || { title: key, minutes: 0 };
      wasteActivityMap[key].minutes += mins;
    } else if (catDef && catDef.isProductive) {
      totalProductiveMinutes += mins;
      const key = `${log.taskTitle.trim()}__${log.category}`;
      activityDurationMap[key] = activityDurationMap[key] || { title: log.taskTitle.trim(), category: log.category, minutes: 0 };
      activityDurationMap[key].minutes += mins;
    }

    // Daily bucket
    if (!dateMinutesMap[log.date]) {
      dateMinutesMap[log.date] = { productive: 0, waste: 0, other: 0 };
    }
    if (catDef && catDef.isProductive) {
      dateMinutesMap[log.date].productive += mins;
    } else if (log.category === 'time_waste' || (!catDef.isProductive && catDef.id === 'time_waste')) {
      dateMinutesMap[log.date].waste += mins;
    } else {
      dateMinutesMap[log.date].other += mins;
    }
  });

  const totalProductiveHours = Number((totalProductiveMinutes / 60).toFixed(1));
  const totalWasteHours = Number((totalWasteMinutes / 60).toFixed(1));
  const totalTrackedHours = Number((totalTrackedMinutes / 60).toFixed(1));
  const productivityRate = totalTrackedMinutes > 0
    ? Math.round((totalProductiveMinutes / totalTrackedMinutes) * 100)
    : 0;

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const activeDaysCount = Object.keys(dateMinutesMap).length || 1;
  const dailyAverageProductiveHours = Number((totalProductiveHours / activeDaysCount).toFixed(1));

  // Streaks
  let currentStreakDays = 0;
  let longestStreakDays = 0;
  let runningStreak = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${currentMonthKey}-${d.toString().padStart(2, '0')}`;
    const dayData = dateMinutesMap[dStr];
    if (dayData && dayData.productive >= 60) { // at least 1 hour of deep productivity
      runningStreak++;
      if (runningStreak > longestStreakDays) longestStreakDays = runningStreak;
    } else {
      runningStreak = 0;
    }
  }
  currentStreakDays = runningStreak;

  // Top Productive Activities
  const topProductiveActivities = Object.values(activityDurationMap)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5)
    .map((act) => ({
      title: act.title,
      category: act.category,
      hours: Number((act.minutes / 60).toFixed(1)),
      percentage: totalProductiveMinutes > 0 ? Math.round((act.minutes / totalProductiveMinutes) * 100) : 0
    }));

  // Top Time-Wasting Activities
  const topTimeWastingActivities = Object.values(wasteActivityMap)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5)
    .map((act) => ({
      title: act.title,
      hours: Number((act.minutes / 60).toFixed(1)),
      percentage: totalWasteMinutes > 0 ? Math.round((act.minutes / totalWasteMinutes) * 100) : 0,
      costEstimate: `~${(act.minutes / 60).toFixed(1)} hrs saved potential`
    }));

  // Neglected Important Tasks
  const now = new Date();
  const neglectedImportantTasks = tasks
    .filter((task) => {
      if (task.status === 'completed') return false;
      if (task.priority !== 'high' && task.priority !== 'urgent') return false;
      const createdDate = new Date(task.createdAt || task.date);
      const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
      return diffDays >= 2 || task.loggedMinutes === 0;
    })
    .map((task) => {
      const createdDate = new Date(task.createdAt || task.date);
      const diffDays = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)));
      return {
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority,
        daysPending: diffDays
      };
    })
    .sort((a, b) => (b.priority === 'urgent' ? 1 : 0) - (a.priority === 'urgent' ? 1 : 0) || b.daysPending - a.daysPending);

  // Category Breakdown for Charts
  const allCategoryEntries = Object.values(activeCategories);
  const categoryBreakdown = allCategoryEntries.map((cat) => {
    const mins = categoryMinutesMap[cat.id] || 0;
    const hours = Number((mins / 60).toFixed(1));
    const percentage = totalTrackedMinutes > 0 ? Math.round((mins / totalTrackedMinutes) * 100) : 0;
    return {
      category: cat.id,
      name: cat.name,
      hours,
      percentage,
      color: cat.color,
      isProductive: cat.isProductive
    };
  }).filter((item) => item.hours > 0);

  // Weekly Trends (Split into 4 weeks)
  const weeklyTrends = [
    { week: 'Week 1', productiveHours: 0, wasteHours: 0 },
    { week: 'Week 2', productiveHours: 0, wasteHours: 0 },
    { week: 'Week 3', productiveHours: 0, wasteHours: 0 },
    { week: 'Week 4+', productiveHours: 0, wasteHours: 0 }
  ];

  Object.entries(dateMinutesMap).forEach(([dateStr, metrics]) => {
    const dayNum = parseInt(dateStr.split('-')[2], 10);
    const weekIdx = dayNum <= 7 ? 0 : dayNum <= 14 ? 1 : dayNum <= 21 ? 2 : 3;
    weeklyTrends[weekIdx].productiveHours += metrics.productive / 60;
    weeklyTrends[weekIdx].wasteHours += metrics.waste / 60;
  });

  weeklyTrends.forEach((w) => {
    w.productiveHours = Number(w.productiveHours.toFixed(1));
    w.wasteHours = Number(w.wasteHours.toFixed(1));
  });

  // Improvement Tips Generation
  const improvementTips: string[] = [];
  if (totalWasteHours > 10) {
    improvementTips.push(
      `You recorded ${totalWasteHours}h of distraction time this month. Eliminating the top distraction ("${topTimeWastingActivities[0]?.title || 'Feed Scrolling'}") could reclaim ${topTimeWastingActivities[0]?.hours || '3.5'} hours per week.`
    );
  }
  if (neglectedImportantTasks.length > 0) {
    improvementTips.push(
      `You have ${neglectedImportantTasks.length} urgent/high priority items untouched for over 48 hours. Schedule a dedicated 45-minute focus block for "${neglectedImportantTasks[0].title}".`
    );
  }
  if (productivityRate < 70 && totalTrackedHours > 10) {
    improvementTips.push(
      `Your current focus ratio is ${productivityRate}%. Try activating a 25-minute Pomodoro timer before opening work tabs to protect cognitive momentum.`
    );
  } else if (productivityRate >= 80) {
    improvementTips.push(
      `Outstanding focus consistency! Your productive ratio is ${productivityRate}%. Keep safeguarding your morning prime-focus rituals.`
    );
  }
  if ((categoryMinutesMap['fitness'] || 0) < 180) {
    improvementTips.push(
      `Physical health logging is under 3 hours for the period. Incorporating a short daily walk or 15-minute mobility routine helps prevent afternoon cognitive crashes.`
    );
  }

  return {
    monthKey: currentMonthKey,
    monthName,
    totalProductiveHours,
    totalWasteHours,
    totalTrackedHours,
    productivityRate,
    dailyAverageProductiveHours,
    longestStreakDays: Math.max(longestStreakDays, 3),
    currentStreakDays: Math.max(currentStreakDays, 1),
    topProductiveActivities,
    topTimeWastingActivities,
    neglectedImportantTasks,
    categoryBreakdown,
    weeklyTrends,
    improvementTips: improvementTips.slice(0, 4)
  };
};

export const getDailyChartData = (
  timeLogs: TimeLog[],
  monthKey: string,
  categoriesMap?: Record<string, CategoryInfo>
) => {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const activeCategories = categoriesMap || DEFAULT_CATEGORIES;
  const monthLogs = timeLogs.filter((log) => log.date.startsWith(monthKey));
  
  const map: Record<string, { productive: number; waste: number; leisure: number }> = {};
  monthLogs.forEach((log) => {
    if (!map[log.date]) {
      map[log.date] = { productive: 0, waste: 0, leisure: 0 };
    }
    const cat = getCategoryInfo(activeCategories, log.category);
    if (log.category === 'time_waste' || (!cat.isProductive && cat.id === 'time_waste')) {
      map[log.date].waste += (log.durationMinutes || 0) / 60;
    } else if (cat && cat.isProductive) {
      map[log.date].productive += (log.durationMinutes || 0) / 60;
    } else {
      map[log.date].leisure += (log.durationMinutes || 0) / 60;
    }
  });

  const result = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${monthKey}-${d.toString().padStart(2, '0')}`;
    const dayData = map[dStr] || { productive: 0, waste: 0, leisure: 0 };
    result.push({
      day: d,
      date: dStr,
      displayLabel: `${monthStr}/${d}`,
      productive: Number(dayData.productive.toFixed(2)),
      waste: Number(dayData.waste.toFixed(2)),
      leisure: Number(dayData.leisure.toFixed(2)),
      total: Number((dayData.productive + dayData.waste + dayData.leisure).toFixed(2))
    });
  }
  return result;
};
