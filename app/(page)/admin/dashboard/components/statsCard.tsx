'use client';

import React from 'react';
import { DashboardStats } from '../lib/types/types';
import { getStatsColorClasses, formatNumber } from '../lib/utils/utils';

interface StatsCardProps {
  stat: DashboardStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  const colors = getStatsColorClasses(stat.color);

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-6 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.subtext} mb-3`}>
            {stat.title}
          </p>
          <p className={`text-3xl font-bold ${colors.text} mb-2`}>
            {formatNumber(stat.value)}
          </p>
          {stat.change && (
            <p className={`text-xs ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
              {stat.changeType === 'increase' ? '↑' : '↓'} {stat.change}
            </p>
          )}
          {stat.description && (
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-2xl ${colors.iconColor}`}>{stat.icon}</span>
        </div>
      </div>
    </div>
  );
};