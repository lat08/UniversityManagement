"use client"

import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { NotificationsContent } from "./components/content/notificationContent"

export default function NotificationsPage() {
  usePageTitle('Thông báo');
  return <NotificationsContent role="Student" />
}
