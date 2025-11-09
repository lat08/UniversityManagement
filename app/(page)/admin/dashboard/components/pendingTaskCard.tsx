'use client';

import React from 'react';
import { PendingTask } from '../lib/types/types';
import { getPriorityColorClass } from '../lib/utils/utils';

interface PendingTaskCardProps {
  task: PendingTask;
  onClick?: () => void;
}

export const PendingTaskCard: React.FC<PendingTaskCardProps> = ({ task, onClick }) => {
  const priorityColor = task.priority ? getPriorityColorClass(task.priority) : '';

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
        {task.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {task.title}
          </h4>
          {task.count !== undefined && (
            <span className={`text-xs font-semibold ${priorityColor}`}>
              ({task.count})
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{task.description}</p>
      </div>
      <div className="flex-shrink-0">
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};