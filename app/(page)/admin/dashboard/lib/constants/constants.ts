export const DASHBOARD_CONSTANTS = {
  STATS: {
    STUDENTS: 'students',
    INSTRUCTORS: 'instructors',
    CLASSES: 'classes',
    SUBJECTS: 'subjects',
  },
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_RECENT_UPDATES: 10,
  MAX_PENDING_TASKS: 5,
};

// Màu mới giống ảnh - nền trắng, icon màu pastel
export const DASHBOARD_COLORS = {
  green: {
    bg: 'bg-white',
    icon: 'bg-green-100',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    iconColor: 'text-green-600',
    border: 'border-gray-200',
  },
  blue: {
    bg: 'bg-white',
    icon: 'bg-blue-100',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    iconColor: 'text-blue-600',
    border: 'border-gray-200',
  },
  red: {
    bg: 'bg-white',
    icon: 'bg-red-100',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    iconColor: 'text-red-600',
    border: 'border-gray-200',
  },
  orange: {
    bg: 'bg-white',
    icon: 'bg-orange-100',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    iconColor: 'text-orange-600',
    border: 'border-gray-200',
  },
  purple: {
    bg: 'bg-white',
    icon: 'bg-purple-100',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    iconColor: 'text-purple-600',
    border: 'border-gray-200',
  },
} as const;

export const TASK_PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-yellow-500',
  high: 'text-red-500',
} as const;