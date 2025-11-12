"use client"

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { NotificationsContent } from "./components/content/notificationContent";
import { NotificationErrorBoundary } from "@/lib/features/notifications";

export default function NotificationsPage() {
  usePageTitle('Thông báo');
  
  return (
    <NotificationErrorBoundary>
      <NotificationsContent role="Student" />
    </NotificationErrorBoundary>
  );
}
