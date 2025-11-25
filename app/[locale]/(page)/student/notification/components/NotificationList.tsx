"use client";

import { NotificationApiItem } from "@/lib/types/notification";
import { NotificationCard } from "@/app/components/notification/NotificationCard";

interface NotificationListProps {
  notifications: NotificationApiItem[];
  expandedNotificationId: string | null;
  onNotificationClick: (id: string) => void;
}

export function NotificationList({ 
  notifications, 
  expandedNotificationId, 
  onNotificationClick 
}: NotificationListProps) {
  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard 
          key={notification.scheduleId} 
          notification={notification}
          onNotificationClick={onNotificationClick}
          initialExpanded={notification.scheduleId === expandedNotificationId}
        />
      ))}
    </div>
  );
}
