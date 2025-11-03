import { NotificationType } from "../types/notification"

export const notificationFilters: { key: NotificationType; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "important", label: "Quan trọng" },
  { key: "tuition", label: "Học phí" },
  { key: "event", label: "Sự kiện" },
  { key: "schedule", label: "Lịch học" },
]

