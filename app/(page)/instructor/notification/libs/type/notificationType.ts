// data structure for notifications
export type NotificationType = "all" | "event" | "tuition" | "schedule" | "important"

// API Response Types
export interface NotificationApiItem {
  scheduleId: string
  notificationType: "event" | "tuition" | "schedule" | "important"
  title: string
  content: string
  createdAt: string
  visibleFrom: string
  isRead: boolean
  status: string
  timeAgo: string
}

// Base API Response (matches backend structure)
interface BaseApiResponse<T> {
  httpStatus: number
  isSuccess: boolean
  data: T
  errorCode: string
  resultMessage: string
}

export type NotificationListResponse = BaseApiResponse<{
  role: string
  notifications: {
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    data: NotificationApiItem[]
  }
}>

export type NotificationDetailResponse = BaseApiResponse<{
  role: string
  notification: NotificationApiItem
}>

export type UnreadCountResponse = BaseApiResponse<{
  role: string
  unreadCount: number
}>

export type MarkAsReadResponse = BaseApiResponse<{
  message: string
  notificationId: string
}>

export type MarkAllAsReadResponse = BaseApiResponse<{
  role: string
  message: string
  count: number
}>

export interface NotificationQueryParams {
  NotificationType?: "event" | "tuition" | "schedule" | "important"
  IsRead?: boolean
  SearchTerm?: string
  PageIndex?: number
  PageSize?: number
}
