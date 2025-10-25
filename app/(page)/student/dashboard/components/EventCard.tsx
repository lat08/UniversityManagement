"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar } from "lucide-react";
import { upcomingEvents } from "../libs/constants/dashboardConstant";

export default function EventCard() {
  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm lg:text-base font-semibold">
          Sự kiện sắp tới
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--primary-foreground)]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                  <span className="px-2 py-1 bg-white rounded text-xs">
                    {event.type}
                  </span>
                  <span>{event.date}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Không có sự kiện nào
          </div>
        )}
      </CardContent>
    </Card>
  );
}

