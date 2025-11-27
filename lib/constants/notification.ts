import { NotificationReadStatus, NotificationType } from "../types/notification"

export const notificationFilters: { key: NotificationType }[] = [
  { key: "all" },
  { key: "important" },
  { key: "tuition" },
  { key: "event" },
  { key: "schedule" },
]

export const notificationReadStatusFilters: { key: NotificationReadStatus }[] = [
  { key: "all" },
  { key: "unread" },
  { key: "read" },
]

