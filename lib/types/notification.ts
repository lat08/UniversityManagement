export type NotificationType = "all" | "event" | "tuition" | "schedule" | "important"
export type NotificationReadStatus = "all" | "unread" | "read"

export interface NotificationApiItem {
  scheduleId: string
  notificationType: "event" | "tuition" | "schedule" | "important"
  title: string
  content: string | null
  createdAt: string
  visibleFrom: string
  isRead: boolean
  status: string | null
  timeAgo: string
}

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
    data: NotificationApiItem[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}>

export type NotificationDetailResponse = BaseApiResponse<NotificationApiItem>

export type UnreadCountResponse = BaseApiResponse<{
  role: string
  unreadCount: number
}>

export type UnreadCountByCategoryResponse = BaseApiResponse<{
  role: string
  countByCategory: {
    event: number
    tuition: number
    schedule: number
    important: number
    total: number
  }
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
  Role?: string
}

