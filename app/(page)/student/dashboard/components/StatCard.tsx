"use client";

import { StatCardData } from "../libs/types/types";
import { useCountUp } from "@/lib/hooks/useCountUp";

interface StatCardProps {
  data: StatCardData;
}

export default function StatCard({ data }: StatCardProps) {
  const Icon = data.icon;
  const animatedValue = useCountUp(data.value, { duration: 800 });

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden">
      {/* Quarter-circle decorative element with icon */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${data.bgColor} rounded-bl-[100%]`}>
        <div className="absolute top-5 right-5">
          <Icon className={`w-6 h-6 ${data.iconColor} flex-shrink-0`} strokeWidth={2} />
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">{data.title}</p>
      <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{animatedValue}</p>
      <p className="text-xs sm:text-sm text-gray-600 relative z-10">{data.unit}</p>
    </div>
  );
}

