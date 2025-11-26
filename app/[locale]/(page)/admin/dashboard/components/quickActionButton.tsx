'use client';

import React from 'react';
import { QuickAction } from '../lib/types/types';
import { UserPlus, BookOpen, Calendar, Bell } from 'lucide-react';

interface QuickActionButtonProps {
  action: QuickAction;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'user-plus': <UserPlus className="w-5 h-5" />,
    'book-open': <BookOpen className="w-5 h-5" />,
    'calendar': <Calendar className="w-5 h-5" />,
    'bell': <Bell className="w-5 h-5" />,
  };
  return icons[iconName] || <BookOpen className="w-5 h-5" />;
};

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action }) => {
  return (
    <button
      onClick={action.action}
      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-300 rounded-lg transition-all hover:bg-blue-50 text-blue-700 cursor-pointer hover:shadow-sm"
    >
      <div className="flex-shrink-0">{getIcon(action.icon)}</div>
      <span className="font-medium text-sm">{action.title}</span>
    </button>
  );
};