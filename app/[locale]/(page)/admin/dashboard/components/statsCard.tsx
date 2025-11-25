'use client';

import React from 'react';
import { DashboardStats } from '../lib/types/types';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { useMemo } from 'react';
import { Users, GraduationCap, BookOpen, School } from 'lucide-react';

interface StatsCardProps {
  stat: DashboardStats;
}

const getIconAndColors = (color: string) => {
  switch (color) {
    case 'green':
      return {
        Icon: Users,
        bgColor: 'bg-[#CCEECC]',
        iconColor: 'text-[#44AA44]',
      };
    case 'blue':
      return {
        Icon: GraduationCap,
        bgColor: 'bg-[#AACCFF]',
        iconColor: 'text-[#3366CC]',
      };
    case 'red':
      return {
        Icon: BookOpen,
        bgColor: 'bg-[#FFBBAA]',
        iconColor: 'text-[#CC4444]',
      };
    case 'orange':
      return {
        Icon: School,
        bgColor: 'bg-[#FFDDAA]',
        iconColor: 'text-[#CC8800]',
      };
    default:
      return {
        Icon: Users,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
      };
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  const count = useCountUp(stat.value, { duration: 1200, start: 0 });
  const displayValue = useMemo(() => Math.round(count), [count]);
  const { Icon, bgColor, iconColor } = getIconAndColors(stat.color);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${bgColor} rounded-bl-[100%]`}>
        <div className="absolute top-5 right-5">
          <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} strokeWidth={2} />
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">
        {stat.title}
      </p>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
        {displayValue.toLocaleString('vi-VN')}
      </p>
      {stat.description && (
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">
          {stat.description}
        </p>
      )}
    </div>
  );
};