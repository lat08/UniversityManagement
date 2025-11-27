import { NotificationsContent as SharedNotificationsContent } from "@/app/[locale]/(page)/student/notification/components/content/notificationContent";

interface NotificationsContentProps {
  role?: string;
}

export function NotificationsContent({ role = "Instructor" }: NotificationsContentProps) {
  return <SharedNotificationsContent role={role} />;
}

