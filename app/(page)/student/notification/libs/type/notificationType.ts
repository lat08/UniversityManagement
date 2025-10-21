// data structure for notifications
export type NotificationType = "all" | "exam" | "event" | "important" | "general"

export interface NotificationData {
  id: string
  title: string
  timeAgo: string
  type: NotificationType
  content: string
  date: string
  time?: string
  location?: string
  note: string
  isRead?: boolean
}
