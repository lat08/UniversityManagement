'use client';

import React from 'react';
import Link from 'next/link';
import { PendingTask } from '../lib/types/types';
import { FileText } from 'lucide-react';

interface PendingTaskCardProps {
  task: PendingTask;
}

export const PendingTaskCard: React.FC<PendingTaskCardProps> = ({ task }) => {
  const content = (
    <>
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
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
    </>
  );

  if (task.link) {
    return (
      <Link href={task.link} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
      {content}
    </div>
  );
};