import { DASHBOARD_COLORS, TASK_PRIORITY_COLORS } from '../constants/constants';

export const getStatsColorClasses = (color: keyof typeof DASHBOARD_COLORS) => {
  return DASHBOARD_COLORS[color];
};

export const getPriorityColorClass = (priority: keyof typeof TASK_PRIORITY_COLORS) => {
  return TASK_PRIORITY_COLORS[priority];
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const getRelativeTime = (timestamp: string): string => {
  // Helper để format thời gian tương đối
  return timestamp;
};

export const getUpdateTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    info: '📢',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };
  return icons[type] || '📢';
};