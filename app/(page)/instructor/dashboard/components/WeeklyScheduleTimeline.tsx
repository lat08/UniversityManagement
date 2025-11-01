"use client";

import { WeeklySchedule } from "../lib/types/types";
import { cn } from "@/lib/utils/utils";
import { useRef } from "react";

interface WeeklyScheduleTimelineProps {
  schedules: WeeklySchedule[];
}

export default function WeeklyScheduleTimeline({ schedules }: WeeklyScheduleTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element) return;

    const isScrollingDown = e.deltaY > 0;
    const isAtTop = element.scrollTop === 0;
    const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if ((isAtTop && !isScrollingDown) || (isAtBottom && isScrollingDown)) {
      e.preventDefault();
    }
  };

  const getDayOfWeekColor = (dayOfWeek: string) => {
    // Thứ Ba & Thứ Năm - Red
    if (dayOfWeek === 'Thứ Ba' || dayOfWeek === 'Thứ Năm') {
      return {
        dot: 'bg-white border-[#B41E14]',
        card: 'border-[#B41E14] bg-[#B41E14]/5',
        date: 'text-[#B41E14]'
      };
    }
    // Thứ Tư - Green
    if (dayOfWeek === 'Thứ Tư') {
      return {
        dot: 'bg-white border-[#1B6E53]',
        card: 'border-[#1B6E53] bg-[#1B6E53]/5',
        date: 'text-[#1B6E53]'
      };
    }
    // Default - Gray
    return {
      dot: 'bg-white border-[#757575]',
      card: 'border-[#757575] bg-[#757575]/5',
      date: 'text-[#757575]'
    };
  };

  return (
    <div 
      ref={scrollRef}
      onWheel={handleWheel}
      className="relative max-h-[600px] overflow-y-auto pr-2 overscroll-contain"
    >
      {/* Timeline line */}
      <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline items */}
      <div className="space-y-3 lg:space-y-4">
        {schedules.map((schedule) => {
          const colors = getDayOfWeekColor(schedule.dayOfWeek);
          
          return (
            <div key={schedule.courseClassId} className="relative pl-8 lg:pl-10">
              {/* Timeline dot */}
              <div className={cn(
                "absolute left-[0px] top-3 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10",
                colors.dot
              )} />

              {/* Schedule card */}
              <div className={cn(
                "p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-md",
                colors.card
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Day and time */}
                    <div className={cn(
                      "text-xs lg:text-sm font-bold mb-1",
                      colors.date
                    )}>
                      {schedule.dayOfWeek}, {schedule.timeRange}
                    </div>

                    {/* Subject name and code */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="text-sm lg:text-base font-bold text-gray-900">
                        {schedule.subjectName}
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {schedule.subjectCode}
                      </span>
                    </div>

                    {/* Schedule details */}
                    <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-600 flex-wrap">
                      {/* Room */}
                      <div className="flex items-center gap-1">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{schedule.roomName}</span>
                      </div>

                      {/* Class code */}
                      <div className="flex items-center gap-1">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Lớp: {schedule.classCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

