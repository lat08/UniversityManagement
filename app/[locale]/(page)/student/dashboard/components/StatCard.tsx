"use client";

import { memo } from "react";
import type { StatCardData } from "../libs/types/types";
import { useCountUp } from "@/lib/hooks/useCountUp";

interface StatCardProps {
  data: StatCardData;
  loading?: boolean;
}

const StatCard = memo(({ data, loading = false }: StatCardProps) => {
  const Icon = data.icon;
  const animatedValue = useCountUp(loading ? 0 : data.value, { duration: 800 });

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 relative overflow-hidden ${
        data.onClick && !loading ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={!loading ? data.onClick : undefined}
      role={data.onClick && !loading ? "button" : undefined}
      tabIndex={data.onClick && !loading ? 0 : undefined}
      onKeyDown={
        data.onClick && !loading
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                data.onClick?.();
              }
            }
          : undefined
      }
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${data.bgColor} rounded-bl-[100%]`}>
        <div className="absolute top-5 right-5">
          <Icon className={`w-6 h-6 ${data.iconColor} flex-shrink-0`} strokeWidth={2} />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      ) : (
        <>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium relative z-10">{data.title}</p>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1 relative z-10">{animatedValue}</p>
          <p className="text-xs sm:text-sm text-gray-600 relative z-10">{data.unit}</p>
        </>
      )}
    </div>
  );
});
StatCard.displayName = "StatCard";

export default StatCard;