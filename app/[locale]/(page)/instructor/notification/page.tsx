"use client"

import { useTranslations } from "next-intl";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { NotificationsContent } from "./components/content/notificationContent";
import { NotificationErrorBoundary } from "@/lib/features/notifications";

export default function NotificationsPage() {
  const t = useTranslations('instructor.notification');
  usePageTitle(t('title'));
  
  return (
    <NotificationErrorBoundary>
      <NotificationsContent role="Instructor" />
    </NotificationErrorBoundary>
  );
}
