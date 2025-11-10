"use client";

import { Calendar, CalendarClock, CalendarCheck } from "lucide-react";
import { ExamStatCard as ExamStatCardType } from "../lib/types/types";
import { useCountUp } from "@/lib/hooks/useCountUp";

interface ExamStatCardProps {
  data: ExamStatCardType;
}

export default function ExamStatCard({ data }: ExamStatCardProps) {
  const numericValue = typeof data.value === 'number' ? data.value : 0;
  const countValue = useCountUp(numericValue, { duration: 1500 });
  const countProgress = useCountUp(data.progress ?? 0, { duration: 1000 });
  
  const displayValue = typeof data.value === 'number' ? countValue : data.value;

  const getIconAndColors = () => {
    if (data.title.includes("Tổng")) {
      return {
        Icon: Calendar,
        quarterCircleBg: 'bg-gray-200',
        iconColor: 'text-gray-700'
      };
    }
    if (data.title.includes("sắp tới")) {
      return {
        Icon: CalendarClock,
        quarterCircleBg: 'bg-[#FFBBAA]',
        iconColor: 'text-[#CC4444]'
      };
    }
    return {
      Icon: CalendarCheck,
      quarterCircleBg: 'bg-[#CCEECC]',
      iconColor: 'text-[#44AA44]'
    };
  };

  const { Icon, quarterCircleBg, iconColor } = getIconAndColors();

  // Determine text color for main value
  const getMainValueColor = () => {
    if (data.title.includes("sắp tới")) return 'text-red-600';
    if (data.title.includes("đã thi")) return 'text-green-600';
    return 'text-gray-900';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
      {/* Quarter-circle decorative element with icon */}
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
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Tiến độ</p>
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
      ) : data.title.includes("sắp tới") && data.subtitle ? (
        <div className="relative z-10">
          {!data.subtitle.includes("Không có") && (
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Môn thi sắp tới:</p>
          )}
          <p className={`text-xs sm:text-sm ${data.subtitle.includes("Không có") ? 'text-gray-600' : 'text-red-600'}`}>
            {data.subtitle}
          </p>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-gray-600 relative z-10">
          {data.subtitle}
        </p>
      )}
    </div>
  );
}

