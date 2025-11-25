"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/utils";
import { WeeklySchedule } from "../lib/types/types";

interface WeeklyScheduleTimelineProps {
  schedules: WeeklySchedule[];
}

const ScheduleCard = memo(({ 
  schedule, 
  index, 
  onClick,
  t
}: { 
  schedule: WeeklySchedule; 
  index: number; 
  onClick: (schedule: WeeklySchedule) => void;
  t: (key: string) => string;
}) => {
  const isTheory = schedule.classType === t('classTypes.theory') || schedule.classType === 'Lý thuyết';
  const colors = isTheory
    ? { dot: 'bg-white border-blue-600', card: 'border-blue-600 bg-blue-50', date: 'text-blue-600' }
    : { dot: 'bg-white border-red-600', card: 'border-red-600 bg-red-50', date: 'text-red-600' };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(schedule);
    }
  }, [onClick, schedule]);

  return (
    <div 
      className="relative pl-8 lg:pl-10 animate-fade-up"
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      <div className={cn(
        "absolute left-[0px] top-3 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10",
        colors.dot
      )} />

      <div 
        className={cn(
          "p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer",
          colors.card
        )}
        onClick={() => onClick(schedule)}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className={cn("text-xs lg:text-sm font-bold mb-1", colors.date)}>
              {schedule.dayOfWeek}, {schedule.timeRange}
            </div>

            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="text-sm lg:text-base font-bold text-gray-900">
                {schedule.subjectName}
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {schedule.subjectCode}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{schedule.roomName}</span>
              </div>

              {schedule.classCode && (
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{t('class')}: {schedule.classCode}</span>
                </div>
              )}

              {schedule.classType && (
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {schedule.classType}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ScheduleCard.displayName = 'ScheduleCard';

const WeeklyScheduleTimeline = ({ schedules }: WeeklyScheduleTimelineProps) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('instructor.dashboard');

  const handleScheduleClick = useCallback((schedule: WeeklySchedule) => {
    const url = `/instructor/schedule/weekly?highlightSubject=${schedule.subjectCode}&highlightClass=${schedule.courseClassId}`;
    router.push(url);
  }, [router]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const element = scrollRef.current;
    if (!element) return;

    const isScrollingDown = e.deltaY > 0;
    const isAtTop = element.scrollTop === 0;
    const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if ((isAtTop && !isScrollingDown) || (isAtBottom && isScrollingDown)) {
      e.preventDefault();
    }
  }, []);

  return (
    <div 
      ref={scrollRef}
      onWheel={handleWheel}
      className="relative max-h-[600px] overflow-y-auto pr-2 overscroll-contain"
    >
      <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-3 lg:space-y-4">
        {schedules.map((schedule, index) => (
          <ScheduleCard
            key={schedule.courseClassId}
            schedule={schedule}
            index={index}
            onClick={handleScheduleClick}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(WeeklyScheduleTimeline);

