import { CategoryInfo } from '../types';

export const DEFAULT_CATEGORIES: Record<string, CategoryInfo> = {
  work: {
    id: 'work',
    name: 'Deep Work',
    isProductive: true,
    color: '#3B82F6', // Vibrant modern blue
    textColor: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    bgDark: 'bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
    icon: 'Briefcase',
    description: 'High cognitive load tasks, coding, client projects, writing'
  },
  study: {
    id: 'study',
    name: 'Study & Learning',
    isProductive: true,
    color: '#8B5CF6', // Calming purple
    textColor: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    bgDark: 'bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800/50',
    icon: 'BookOpen',
    description: 'Courses, reading, skill development, research'
  },
  fitness: {
    id: 'fitness',
    name: 'Health & Fitness',
    isProductive: true,
    color: '#10B981', // Clean emerald green
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    bgDark: 'bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/50',
    icon: 'Activity',
    description: 'Workouts, running, meditation, healthy meals, recovery'
  },
  personal: {
    id: 'personal',
    name: 'Personal & Projects',
    isProductive: true,
    color: '#06B6D4', // Crisp cyan
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40',
    bgDark: 'bg-cyan-900/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800/50',
    icon: 'User',
    description: 'Side projects, journaling, family, life planning'
  },
  chores: {
    id: 'chores',
    name: 'Chores & Admin',
    isProductive: true,
    color: '#F59E0B', // Warm amber
    textColor: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    bgDark: 'bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    icon: 'Home',
    description: 'Cleaning, cooking, groceries, email admin, organization'
  },
  entertainment: {
    id: 'entertainment',
    name: 'Rest & Leisure',
    isProductive: false,
    color: '#EC4899', // Rose/pink
    textColor: 'text-pink-600 dark:text-pink-400',
    bgLight: 'bg-pink-50 dark:bg-pink-950/40',
    bgDark: 'bg-pink-900/30',
    borderColor: 'border-pink-200 dark:border-pink-800/50',
    icon: 'Tv',
    description: 'Intentional movies, music, social outings, gaming with friends'
  },
  time_waste: {
    id: 'time_waste',
    name: 'Time Waste / Distraction',
    isProductive: false,
    color: '#EF4444', // Warning crimson
    textColor: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    bgDark: 'bg-rose-900/30',
    borderColor: 'border-rose-200 dark:border-rose-800/50',
    icon: 'AlertTriangle',
    description: 'Doomscrolling, endless feeds, procrastination, rabbit holes'
  }
};

export const CATEGORIES = DEFAULT_CATEGORIES;
export const CATEGORY_LIST = Object.values(DEFAULT_CATEGORIES);

export const AUTOMATIC_CATEGORY_PALETTE = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
  '#A855F7', // Violet
  '#0EA5E9', // Sky
  '#059669', // Mint
  '#D97706', // Warm Bronze
  '#7C3AED'  // Deep Violet
];

export const DISTRACTION_PALETTE = [
  '#EF4444', // Crimson
  '#F43F5E', // Rose
  '#EC4899', // Pink
  '#FB7185', // Coral
  '#E11D48', // Ruby
  '#EA580C'  // Bright Rust
];

export function getAutoCategoryColor(
  name: string,
  isProductive: boolean = true
): string {
  const activePalette = isProductive ? AUTOMATIC_CATEGORY_PALETTE : DISTRACTION_PALETTE;

  if (!name || !name.trim()) {
    return activePalette[0];
  }

  // Deterministic positive hash based on category name
  let hash = 0;
  const str = name.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % activePalette.length;
  return activePalette[index];
}

export const PRESET_CATEGORY_COLORS = AUTOMATIC_CATEGORY_PALETTE.map((hex) => ({ hex, label: hex }));

export function getCategoryInfo(
  categoriesMap: Record<string, CategoryInfo> | undefined,
  categoryId: string
): CategoryInfo {
  if (categoriesMap && categoriesMap[categoryId]) {
    return categoriesMap[categoryId];
  }
  if (DEFAULT_CATEGORIES[categoryId]) {
    return DEFAULT_CATEGORIES[categoryId];
  }
  // Dynamic fallback for custom or unmapped category ID
  const cleanName = categoryId
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const autoColor = getAutoCategoryColor(cleanName || categoryId, true);

  return {
    id: categoryId,
    name: cleanName || 'Custom Activity',
    isProductive: true,
    color: autoColor,
    textColor: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    bgDark: 'bg-indigo-900/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800/50',
    icon: 'Activity',
    description: 'Custom activity category'
  };
}
