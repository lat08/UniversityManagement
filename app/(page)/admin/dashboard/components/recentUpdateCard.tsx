'use client';

import React from 'react';
import { RecentUpdate } from '../lib/types/types';
import { getUpdateTypeIcon } from '../lib/utils/utils';

interface RecentUpdateCardProps {
  update: RecentUpdate;
}

export const RecentUpdateCard: React.FC<RecentUpdateCardProps> = ({ update }) => {
  const typeColors = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`flex gap-3 p-3 border rounded-lg ${typeColors[update.type]}`}>
      <div className="flex-shrink-0 text-xl">
        {getUpdateTypeIcon(update.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm mb-1">{update.title}</h4>
        <p className="text-xs text-gray-600 mb-2">{update.description}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {update.timestamp}
        </p>
      </div>
    </div>
  );
};