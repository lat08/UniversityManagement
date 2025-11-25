"use client"

import { useTranslations } from "next-intl";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { NotificationsContent } from "./components/content/notificationContent";
import { NotificationErrorBoundary } from "@/lib/features/notifications";

export default function NotificationsPage() {
  const t = useTranslations('student.notification');
  usePageTitle(t('title'));
  
  return (
    <NotificationErrorBoundary>
      <NotificationsContent role="Student" />
    </NotificationErrorBoundary>
  );
}
