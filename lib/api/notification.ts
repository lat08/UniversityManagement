import { api } from "./client"
import { 
  NotificationListResponse,
  NotificationDetailResponse,
  UnreadCountResponse,
  UnreadCountByCategoryResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  NotificationQueryParams
} from "../types/notification"

export const notificationApi = {
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
    const url = `/v1/notifications${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<NotificationListResponse>(url)
    return response.data
  },

  getNotificationById: async (id: string): Promise<NotificationDetailResponse> => {
    const response = await api.get<NotificationDetailResponse>(`/v1/notifications/${id}`)
    return response.data
  },

  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    const response = await api.put<MarkAsReadResponse>(`/v1/notifications/${id}/mark-as-read`)
    return response.data
  },

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await api.put<MarkAllAsReadResponse>('/v1/notifications/mark-all-as-read')
    return response.data
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get<UnreadCountResponse>('/v1/notifications/unread-count')
    return response.data
  },

  getUnreadCountByCategory: async (): Promise<UnreadCountByCategoryResponse> => {
    const response = await api.get<UnreadCountByCategoryResponse>('/v1/notifications/unread-count-by-category')
    return response.data
  }
}

