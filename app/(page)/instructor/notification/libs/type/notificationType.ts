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

export interface NotificationListResponse extends BaseApiResponse<{
  data: NotificationApiItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}> {}

export interface NotificationDetailResponse extends BaseApiResponse<NotificationApiItem> {}

export interface UnreadCountResponse extends BaseApiResponse<{
  unreadCount: number
}> {}

export interface MarkAllAsReadResponse extends BaseApiResponse<{
  message: string
  count: number
}> {}

export interface NotificationQueryParams {
  NotificationType?: "event" | "tuition" | "schedule" | "important"
  IsRead?: boolean
  SearchTerm?: string
  PageIndex?: number
  PageSize?: number
}

// Legacy type for backward compatibility (if needed)
export interface NotificationData {
  id: string
  title: string
  timeAgo: string
  type: Exclude<NotificationType, "all">
  content: string
  date: string
  time?: string
  location?: string
  note: string
  isRead?: boolean
}

export interface NotificationApiResponse {
  success: boolean
  data: NotificationApiItem[]
  message?: string
}
