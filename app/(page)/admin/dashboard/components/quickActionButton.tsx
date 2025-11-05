'use client';

import React from 'react';
import { QuickAction } from '../lib/types/types';

interface QuickActionButtonProps {
  action: QuickAction;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action }) => {
  const colorClasses = {
    primary: 'border-blue-300 hover:bg-blue-50 text-blue-700',
    secondary: 'border-gray-300 hover:bg-gray-50 text-gray-700',
    success: 'border-green-300 hover:bg-green-50 text-green-700',
    warning: 'border-orange-300 hover:bg-orange-50 text-orange-700',
  };

  return (
    <button
      onClick={action.action}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all ${colorClasses[action.color]}`}
    >
      <div className="text-3xl mb-2">{action.icon}</div>
      <span className="font-medium text-sm">{action.title}</span>
      {action.description && (
        <span className="text-xs text-gray-500 mt-1">{action.description}</span>
      )}
    </button>
  );
};