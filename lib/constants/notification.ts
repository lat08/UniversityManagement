import { NotificationReadStatus, NotificationType } from "../types/notification"

export const notificationFilters: { key: NotificationType; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "important", label: "Quan trọng" },
  { key: "tuition", label: "Học phí" },
  { key: "event", label: "Sự kiện" },
  { key: "schedule", label: "Lịch học" },
]

export const notificationReadStatusFilters: { key: NotificationReadStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "read", label: "Đã đọc" },
]

