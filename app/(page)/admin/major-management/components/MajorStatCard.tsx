'use client';

import React from 'react';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { useMemo } from 'react';
import { LucideIcon } from 'lucide-react';

interface MajorStatCardProps {
  label: string;
  value: number;
  Icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

export const MajorStatCard = ({ label, value, Icon, bgColor, iconColor }: MajorStatCardProps) => {
  const count = useCountUp(value, { duration: 1200, start: 0 });
  const displayValue = useMemo(() => Math.round(count), [count]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${bgColor} rounded-bl-[100%]`}>
        <div className="absolute top-5 right-5">
          <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} strokeWidth={2} />
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">
        {displayValue.toLocaleString('vi-VN')}
      </p>
    </div>
  );
};
