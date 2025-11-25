'use client';

import React from 'react';
import Link from 'next/link';
import { RecentUpdate } from '../lib/types/types';
import { Clock, FileText } from 'lucide-react';

interface RecentUpdateCardProps {
  update: RecentUpdate;
}

export const RecentUpdateCard: React.FC<RecentUpdateCardProps> = ({ update }) => {
  const content = (
    <>
      <div className="flex-shrink-0">
        <FileText className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm mb-1">{update.title}</h4>
        <p className="text-xs text-gray-600 mb-2">{update.description}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {update.timestamp}
        </p>
      </div>
    </>
  );

  if (update.link) {
    return (
      <Link href={update.link} className="flex gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
        {content}
      </Link>
    );
  }

  return (
    <div className="flex gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
      {content}
    </div>
  );
};