"use client";

import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EventData } from "../libs/types/types";
import { formatDate } from "@/lib/utils/format";

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

const EventCard = memo(({ events }: EventData) => {
  const router = useRouter();
  const isLoading = !events;
  const upcomingEvents = events || [];

  const handleEventClick = useCallback((notificationId: string) => {
    router.push(`/student/notification?type=event&id=${notificationId}`);
  }, [router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, notificationId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEventClick(notificationId);
    }
  }, [handleEventClick]);

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm lg:text-base font-semibold">Sự kiện sắp tới</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 relative max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 p-3 rounded-sm">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="relative pl-6">
            <div className="absolute left-2 top-1 bottom-0 w-[1.5px] bg-[var(--event-timeline)]" />

            {upcomingEvents.map((event, index) => (
              <div
                key={event.notificationId}
                className="shadow shadow-md relative flex items-start gap-3 mb-4 animate-fade-up cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleEventClick(event.notificationId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, event.notificationId)}
              >
                <div className="absolute -left-[23px] w-4 h-4 top-1 rounded-full border-4 border-[var(--event-dot-border)] bg-white z-10" />

                <div className="border border-[var(--event-border)] flex-1 p-3 rounded-sm hover:bg-[var(--bg-tertiary)] transition-colors">
                  <h4 className="text-sm lg:text-base font-bold text-[var(--event-title)] mb-1">{event.title}</h4>
                  <p className="text-sm lg:text-base font-medium text-[var(--event-content)]">{event.content}</p>

                  <div className="flex flex-wrap gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--event-meta)]">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--event-meta)]">
                      <Clock className="w-4 h-4" />
                      <span>
                        {WEEKDAYS[new Date(event.eventDate).getDay()]}, {formatDate(event.eventDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)] text-sm">Không có sự kiện nào</div>
        )}
      </CardContent>
    </Card>
  );
});
EventCard.displayName = "EventCard";

export default EventCard;