"use client";

import { Calendar, CalendarClock, CalendarCheck } from "lucide-react";
import { ExamStatCard as ExamStatCardType } from "../lib/types/types";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { memo } from "react";

interface ExamStatCardProps {
  data: ExamStatCardType;
  loading?: boolean;
}

const ExamStatCard = memo(function ExamStatCard({ data, loading = false }: ExamStatCardProps) {
  const numericValue = typeof data.value === 'number' ? data.value : 0;
  const countValue = useCountUp(numericValue, { duration: 1500 });
  const countProgress = useCountUp(data.progress ?? 0, { duration: 1000 });
  
  const displayValue = typeof data.value === 'number' ? countValue : data.value;

  const getIconAndColors = () => {
    switch (data.variant) {
      case 'total':
        return {
          Icon: Calendar,
          quarterCircleBg: 'bg-gray-200',
          iconColor: 'text-gray-700'
        };
      case 'upcoming':
        return {
          Icon: CalendarClock,
          quarterCircleBg: 'bg-[#FFBBAA]',
          iconColor: 'text-[#CC4444]'
        };
      case 'completed':
        return {
          Icon: CalendarCheck,
          quarterCircleBg: 'bg-[#CCEECC]',
          iconColor: 'text-[#44AA44]'
        };
      default:
        return {
          Icon: Calendar,
          quarterCircleBg: 'bg-gray-200',
          iconColor: 'text-gray-700'
        };
    }
  };

  const { Icon, quarterCircleBg, iconColor } = getIconAndColors();

  const getMainValueColor = () => {
    switch (data.variant) {
      case 'upcoming':
        return 'text-red-600';
      case 'completed':
        return 'text-green-600';
      default:
        return 'text-gray-900';
    }
  };

  const getSubtitleClass = () => {
    switch (data.subtitleTone) {
      case 'alert':
        return 'text-red-600';
      case 'muted':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-white p-4 shadow-sm sm:p-6">
        <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[100%] bg-gray-200" />
        <div className="space-y-3">
          <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-2 w-full animate-pulse rounded bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="h-3 flex-1 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${quarterCircleBg} rounded-bl-[100%]`}>
        <div className="absolute top-5 right-5">
          <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} strokeWidth={2} />
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">
        {data.title}
      </p>

      <p className={`text-3xl sm:text-4xl font-bold mb-1 relative z-10 ${getMainValueColor()}`}>
        {displayValue}
      </p>

      {data.progress !== undefined ? (
        <div className="relative z-10">
          {data.subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2">{data.subtitle}</p>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all duration-1000 ease-out bg-green-600"
                style={{ width: `${countProgress}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm text-gray-900 font-medium">{Math.round(countProgress)}%</span>
          </div>
        </div>
      ) : (
        data.subtitle && (
          <p className={`text-xs sm:text-sm relative z-10 ${getSubtitleClass()}`}>
            {data.subtitle}
          </p>
        )
      )}
    </div>
  );
});

export default ExamStatCard;

