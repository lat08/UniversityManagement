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
    if (params?.Role) {
      queryParams.append('role', params.Role)
    }

    const queryString = queryParams.toString()
    const url = `/v1/notification${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<NotificationListResponse>(url)
    return response.data
  },

  getNotificationById: async (id: string, role?: string): Promise<NotificationDetailResponse> => {
    const queryString = role ? `?role=${encodeURIComponent(role)}` : ''
    const response = await api.get<NotificationDetailResponse>(`/v1/notification/${id}${queryString}`)
    return response.data
  },

  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    const response = await api.put<MarkAsReadResponse>(`/v1/notification/${id}/mark-as-read`)
    return response.data
  },

  markAllAsRead: async (role?: string): Promise<MarkAllAsReadResponse> => {
    const queryString = role ? `?role=${encodeURIComponent(role)}` : ''
    const response = await api.put<MarkAllAsReadResponse>(`/v1/notification/mark-all-as-read${queryString}`)
    return response.data
  },

  getUnreadCount: async (role?: string): Promise<UnreadCountResponse> => {
    const queryString = role ? `?role=${encodeURIComponent(role)}` : ''
    const response = await api.get<UnreadCountResponse>(`/v1/notification/unread-count${queryString}`)
    return response.data
  },

  getUnreadCountByCategory: async (role?: string): Promise<UnreadCountByCategoryResponse> => {
    const queryString = role ? `?role=${encodeURIComponent(role)}` : ''
    const response = await api.get<UnreadCountByCategoryResponse>(`/v1/notification/unread-count-by-category${queryString}`)
    return response.data
  },

  getPageNumber: async (id: string, params: NotificationQueryParams): Promise<{ isSuccess: boolean; data: { notificationId: string; pageNumber: number; pageSize: number } }> => {
    const queryParams = new URLSearchParams()
    
    if (params.NotificationType) {
      queryParams.append('NotificationType', params.NotificationType)
    }
    if (params.IsRead !== undefined) {
      queryParams.append('IsRead', params.IsRead.toString())
    }
    if (params.SearchTerm) {
      queryParams.append('SearchTerm', params.SearchTerm)
    }
    if (params.PageSize) {
      queryParams.append('PageSize', params.PageSize.toString())
    }
    if (params.Role) {
      queryParams.append('role', params.Role)
    }

    const queryString = queryParams.toString()
    const url = `/v1/notification/${id}/page-number${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<{ isSuccess: boolean; data: { notificationId: string; pageNumber: number; pageSize: number } }>(url)
    return response.data
  }
}

