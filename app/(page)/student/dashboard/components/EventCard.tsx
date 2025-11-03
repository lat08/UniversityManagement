"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { EventData, EventNotification } from "../libs/types/types";
import { formatDate } from "@/lib/utils/format";

export default function EventCard({ events }: EventData) {
  const [upcomingEvents] = useState<EventNotification[]>(events);

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm lg:text-base font-semibold">
          Sự kiện sắp tới
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 relative max-h-[400px] overflow-y-auto">
        {upcomingEvents.length > 0 ? (
          <div className="relative pl-6">
            {/* Vertical timeline line */}
            <div className="absolute left-2 top-1 bottom-0 w-[1.5px] bg-[var(--event-timeline)]" />

            {upcomingEvents.map((event, index) => (
              <div
                key={event.notificationId}
                className="shadow shadow-md relative flex items-start gap-3 mb-4"
              >
                {/* Event dot */}
                <div className="absolute -left-[23px] w-4 h-4 top-1 rounded-full border-4 border-[var(--event-dot-border)] bg-white z-10" />

                {/* Event card */}
                <div className="border border-[var(--event-border)] flex-1 p-3 rounded-sm hover:bg-[var(--bg-tertiary)] transition-colors">
                  <h4 className="text-sm lg:text-base font-bold text-[var(--event-title)] mb-1">
                    {event.title}
                  </h4>
                  <p className="text-sm lg:text-base font-medium text-[var(--event-content)]">
                    {event.content}
                  </p>

                  <div className="flex flex-wrap gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--event-meta)]">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs lg:text-sm text-[var(--event-meta)]">
                      <Clock className="w-4 h-4" />
                      <span>
                        {[
                          "Chủ nhật",
                          "Thứ hai",
                          "Thứ ba",
                          "Thứ tư",
                          "Thứ năm",
                          "Thứ sáu",
                          "Thứ bảy",
                        ][new Date(event.eventDate).getDay()]}
                        , {formatDate(event.eventDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
            Không có sự kiện nào
          </div>
        )}
      </CardContent>
    </Card>
  );
}
