'use client';

import { useMemo } from 'react';
import { LucideIcon } from 'lucide-react';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { useLocale } from 'next-intl';

interface TuitionStatCardProps {
  label: string;
  value: number;
  Icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

/**
 * Format large numbers with units (tỷ, triệu, nghìn)
 * Example: 2504902228 -> "2.5 tỷ"
 * All units use 1 decimal place only
 */
const formatLargeNumber = (value: number, locale: string): string => {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  // Tỷ (billion) - format with 1 decimal place
  if (absValue >= 1_000_000_000) {
    const ty = absValue / 1_000_000_000;
    const formatted = ty.toFixed(1).replace(/\.?0+$/, '');
    return `${sign}${formatted} tỷ`;
  }
  
  // Triệu (million) - format with 1 decimal place
  if (absValue >= 1_000_000) {
    const trieu = absValue / 1_000_000;
    const formatted = trieu.toFixed(1).replace(/\.?0+$/, '');
    return `${sign}${formatted} triệu`;
  }
  
  // Nghìn (thousand) - format with 1 decimal place
  if (absValue >= 1_000) {
    const nghin = absValue / 1_000;
    const formatted = nghin.toFixed(1).replace(/\.?0+$/, '');
    return `${sign}${formatted} nghìn`;
  }
  
  // Less than 1000 - use locale formatting (no decimals)
  return `${sign}${absValue.toLocaleString(locale)}`;
};

export const TuitionStatCard = ({
  label,
  value,
  Icon,
  bgColor,
  iconColor,
}: TuitionStatCardProps) => {
  const locale = useLocale();
  const count = useCountUp(value, { duration: 1200, start: 0 });
  const displayValue = useMemo(() => Math.round(count), [count]);
  const formattedValue = useMemo(
    () => formatLargeNumber(displayValue, locale),
    [displayValue, locale],
  );

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
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 relative z-10 break-words">
        {formattedValue}
      </p>
      {/* Show full number on hover */}
      <p className="text-xs text-gray-400 relative z-10">
        {displayValue.toLocaleString(locale)} VNĐ
      </p>
    </div>
  );
};

