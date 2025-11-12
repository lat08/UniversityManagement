"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils/utils";
import { formatDate } from "@/lib/utils/format";
import { Reminder } from "../lib/types/types";

interface RemindersSectionProps {
  reminders: Reminder[];
}

const ReminderCard = memo(({ 
  reminder, 
  index, 
  onClick 
}: { 
  reminder: Reminder; 
  index: number; 
  onClick: (reminder: Reminder) => void;
}) => {
  const colorClass = useMemo(() => {
    const colors = {
      tuition: 'border-blue-200 bg-blue-50',
      schedule: 'border-orange-200 bg-orange-50',
      important: 'border-red-200 bg-red-50',
      event: 'border-purple-200 bg-purple-50',
    };
    return colors[reminder.notificationType] || 'border-gray-200 bg-gray-50';
  }, [reminder.notificationType]);

  const Icon = useMemo(() => {
    const icons = {
      tuition: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      schedule: (
        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      important: (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      event: (
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    };
    return icons[reminder.notificationType];
  }, [reminder.notificationType]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(reminder);
    }
  }, [onClick, reminder]);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer animate-fade-up",
        colorClass
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
      onClick={() => onClick(reminder)}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {Icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs lg:text-sm font-bold text-gray-900 mb-1">
            {reminder.title}
          </div>
          <div className="text-xs text-gray-600 line-clamp-2">
            {reminder.content}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Hạn: {formatDate(reminder.createdAt)}</span>
      </div>
    </div>
  );
});

ReminderCard.displayName = 'ReminderCard';

const RemindersSection = ({ reminders }: RemindersSectionProps) => {
  const router = useRouter();

  const handleReminderClick = useCallback((reminder: Reminder) => {
    router.push(`/instructor/notification?type=${reminder.notificationType}&id=${reminder.notificationId}`);
  }, [router]);

  return (
    <div className="bg-[#DBEDFF] rounded-lg p-4 lg:p-6 h-full min-h-[400px] flex flex-col border-2 border-[#4196F0]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Nhắc nhở
        </h3>
      </div>

      <div className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
        {reminders.length > 0 ? (
          reminders.map((reminder, index) => (
            <ReminderCard
              key={reminder.notificationId}
              reminder={reminder}
              index={index}
              onClick={handleReminderClick}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-500 text-sm">Chưa có nhắc nhở nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(RemindersSection);

