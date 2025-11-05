"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { Calendar, Clock, CheckCircle } from "lucide-react";
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

  const getIcon = () => {
    if (data.title.includes("Tổng")) return Calendar;
    if (data.title.includes("sắp tới")) return Clock;
    return CheckCircle;
  };

  const Icon = getIcon();

  return (
    <Card className={`${data.bgColor} border-none shadow-sm`}>
      <CardContent className="p-4 lg:p-5 relative">
        <div className="absolute top-4 right-4">
          <div className={`${data.iconColor} opacity-10`}>
            <Icon className="w-10 h-10 lg:w-12 lg:h-12" />
          </div>
        </div>

        <h3 className="text-xs lg:text-sm text-gray-700 mb-3 font-medium">
          {data.title}
        </h3>

        <div className={`text-4xl lg:text-5xl font-bold ${data.textColor} mb-2`}>
          {displayValue}
        </div>
        {data.progress !== undefined ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Tiến độ</span>
              <span className="font-bold">{Math.round(countProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${data.iconColor}`}
                style={{ width: `${countProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-600">
            {data.subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

