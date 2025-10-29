import { NotificationType, NotificationApiItem } from "../type/notificationType"

export interface NotificationCardProps {
  notification: NotificationApiItem
  onNotificationClick?: (id: string) => void
}


// config for notification types - Using CSS Variables for Theme Customization
export const notificationTypeConfig = {
  all: {
    key: "all" as NotificationType,
    label: "Tất cả",
    iconBg: "bg-[var(--notification-event-bg)]",
    iconColor: "text-[var(--notification-event-icon)]",
    iconBorder: "border-2 border-[var(--notification-event-border)]",
  },
  event: {
    key: "event" as NotificationType,
    label: "Sự kiện",
    iconBg: "bg-[var(--notification-event-bg)]",
    iconColor: "text-[var(--notification-event-icon)]",
    iconBorder: "border-2 border-[var(--notification-event-border)]",
  },
  tuition: {
    key: "tuition" as NotificationType,
    label: "Học phí",
    iconBg: "bg-[var(--notification-tuition-bg)]",
    iconColor: "text-[var(--notification-tuition-icon)]",
    iconBorder: "border-2 border-[var(--notification-tuition-border)]",
  },
  schedule: {
    key: "schedule" as NotificationType,
    label: "Lịch học",
    iconBg: "bg-[var(--notification-schedule-bg)]",
    iconColor: "text-[var(--notification-schedule-icon)]",
    iconBorder: "border-2 border-[var(--notification-schedule-border)]",
  },
  important: {
    key: "important" as NotificationType,
    label: "Quan trọng",
    iconBg: "bg-[var(--notification-important-bg)]",
    iconColor: "text-[var(--notification-important-icon)]",
    iconBorder: "border-2 border-[var(--notification-important-border)]",
  },
}

// Filter tabs configuration
export const notificationFilters: { key: NotificationType; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "important", label: "Quan trọng" },
  { key: "tuition", label: "Học phí" },
  { key: "event", label: "Sự kiện" },
  { key: "schedule", label: "Lịch học" },
]
