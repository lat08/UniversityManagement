import { api } from "@/lib/api/client"
import { 
  NotificationListResponse,
  NotificationDetailResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  NotificationQueryParams
} from "../type/notificationType"

const ROLE = "Instructor"

export const notificationApi = {
  // Lấy danh sách thông báo với filters
  getNotifications: async (params?: NotificationQueryParams): Promise<NotificationListResponse> => {
    const queryParams = new URLSearchParams()
    
    if (params?.NotificationType) {
      queryParams.append('NotificationType', params.NotificationType)
    }
    if (params?.IsRead !== undefined) {
      queryParams.append('IsRead', params.IsRead.toString())
    }
    if (params?.SearchTerm) {
      queryParams.append('SearchTerm', params.SearchTerm)
    }
    if (params?.PageIndex) {
      queryParams.append('PageIndex', params.PageIndex.toString())
    }
    if (params?.PageSize) {
      queryParams.append('PageSize', params.PageSize.toString())
    }

    const queryString = queryParams.toString()
    const url = `/v1/instructor/notifications${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<NotificationListResponse>(url)
    return response.data
  },

  // Lấy chi tiết thông báo và TỰ ĐỘNG đánh dấu đã đọc
  getNotificationById: async (id: string): Promise<NotificationDetailResponse> => {
    const response = await api.get<NotificationDetailResponse>(
      `/v1/instructor/notifications/${id}?role=${ROLE}`
    )
    return response.data
  },

  // Đánh dấu một thông báo cụ thể đã đọc
  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    const response = await api.put<MarkAsReadResponse>(
      `/v1/instructor/notifications/${id}/mark-as-read`
    )
    return response.data
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await api.put<MarkAllAsReadResponse>(
      `/v1/instructor/notifications/mark-all-as-read?role=${ROLE}`
    )
    return response.data
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get<UnreadCountResponse>(
      `/v1/instructor/notifications/unread-count?role=${ROLE}`
    )
    return response.data
  }
}

