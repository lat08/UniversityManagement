import { api } from '@/lib/api/client';
import type {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  NotificationHistoryFilterDto,
  ApiResponse,
  NotificationHistoryResponse,
} from '../types/types';

export const notificationsApi = {
  // POST /v1/admin/notifications/save - Lưu nháp thông báo
  save: async (dto: CreateNotificationDto): Promise<ApiResponse<Notification>> => {
    try {
      interface RawApiResponse {
        isSuccess?: boolean;
        success?: boolean;
        resultMessage?: string;
        message?: string;
        data?: Notification;
        error?: string;
      }
      const response = await api.post<RawApiResponse>('/v1/admin/notifications/save', dto);
      const responseData = response.data;
      
      // Transform response to match expected format
      if (responseData.isSuccess !== undefined && responseData.success === undefined) {
        return {
          ...responseData,
          success: responseData.isSuccess,
          message: responseData.resultMessage || responseData.message || '',
          data: responseData.data || {} as Notification,
        } as ApiResponse<Notification>;
      }
      
      return {
        ...responseData,
        data: responseData.data || {} as Notification,
      } as ApiResponse<Notification>;
    } catch (error) {
      // Re-throw with better error message
      interface ErrorWithResponse {
        response?: {
          data?: {
            message?: string;
            resultMessage?: string;
            error?: string;
          };
        };
      }
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as ErrorWithResponse;
        const errorData = err.response?.data;
        const errorMessage = errorData?.message || errorData?.resultMessage || errorData?.error || 'Lưu nháp thông báo thất bại';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  // POST /v1/admin/notifications/{scheduleId}/send - Gửi thông báo
  send: async (scheduleId: string): Promise<ApiResponse<Notification>> => {
    const response = await api.post<ApiResponse<Notification>>(`/v1/admin/notifications/${scheduleId}/send`);
    return response.data;
  },

  // PUT /v1/admin/notifications/{scheduleId} - Cập nhật thông báo
  update: async (scheduleId: string, dto: UpdateNotificationDto): Promise<ApiResponse<Notification>> => {
    try {
      interface RawApiResponse {
        isSuccess?: boolean;
        success?: boolean;
        resultMessage?: string;
        message?: string;
        data?: Notification;
        error?: string;
      }
      const response = await api.put<RawApiResponse>(`/v1/admin/notifications/${scheduleId}`, dto);
      const responseData = response.data;
      
      // Transform response to match expected format
      if (responseData.isSuccess !== undefined && responseData.success === undefined) {
        return {
          ...responseData,
          success: responseData.isSuccess,
          message: responseData.resultMessage || responseData.message || '',
          data: responseData.data || {} as Notification,
        } as ApiResponse<Notification>;
      }
      
      return {
        ...responseData,
        data: responseData.data || {} as Notification,
      } as ApiResponse<Notification>;
    } catch (error) {
      // Re-throw with better error message
      interface ErrorWithResponse {
        response?: {
          data?: {
            message?: string;
            resultMessage?: string;
            error?: string;
          };
        };
      }
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as ErrorWithResponse;
        const errorData = err.response?.data;
        const errorMessage = errorData?.message || errorData?.resultMessage || errorData?.error || 'Cập nhật thông báo thất bại';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  // POST /v1/admin/notifications/{scheduleId}/archive - Lưu trữ thông báo
  archive: async (scheduleId: string): Promise<ApiResponse<Notification>> => {
    const response = await api.post<ApiResponse<Notification>>(`/v1/admin/notifications/${scheduleId}/archive`);
    return response.data;
  },

  // POST /v1/admin/notifications/{scheduleId}/cancel - Hủy thông báo
  cancel: async (scheduleId: string): Promise<ApiResponse<Notification>> => {
    const response = await api.post<ApiResponse<Notification>>(`/v1/admin/notifications/${scheduleId}/cancel`);
    return response.data;
  },

  // GET /v1/admin/notifications - Lấy lịch sử thông báo
  getHistory: async (filter: NotificationHistoryFilterDto = {}): Promise<ApiResponse<NotificationHistoryResponse>> => {
    const queryParams: Record<string, string> = {};
    
    if (filter.searchTerm) {
      queryParams.searchTerm = filter.searchTerm;
    }
    if (filter.targetType) {
      queryParams.targetType = filter.targetType;
    }
    if (filter.status) {
      queryParams.status = filter.status;
    }
    if (filter.pageIndex) {
      queryParams.pageIndex = filter.pageIndex.toString();
    }
    if (filter.pageSize) {
      queryParams.pageSize = filter.pageSize.toString();
    }

    const response = await api.get<ApiResponse<NotificationHistoryResponse>>('/v1/admin/notifications', {
      params: queryParams,
    });
    
    // Transform response to match expected format if needed
    const responseData = response.data;
    if (responseData.isSuccess !== undefined && responseData.success === undefined) {
      // Transform isSuccess format to success format for consistency
      return {
        ...responseData,
        success: responseData.isSuccess,
        message: responseData.resultMessage || responseData.message || '',
      };
    }
    
    return responseData;
  },

  // GET /v1/admin/notifications/{scheduleId} - Lấy chi tiết thông báo
  getDetail: async (scheduleId: string): Promise<ApiResponse<Notification>> => {
    const response = await api.get<ApiResponse<Notification>>(`/v1/admin/notifications/${scheduleId}`);
    
    // Transform response to match expected format if needed
    const responseData = response.data;
    if (responseData.isSuccess !== undefined && responseData.success === undefined) {
      return {
        ...responseData,
        success: responseData.isSuccess,
        message: responseData.resultMessage || responseData.message || '',
      };
    }
    
    return responseData;
  },

  // PUT /v1/admin/notifications/bulk-update - Cập nhật hàng loạt thông báo
  bulkUpdate: async (payload: {
    scheduleIds: string[];
    notificationType?: string;
    sendingMethod?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ updatedCount: number; totalCount: number }>> => {
    try {
      // Convert string[] to Guid[] format for backend
      const backendPayload = {
        scheduleIds: payload.scheduleIds.map(id => id), // Keep as string, backend will parse to Guid
        ...(payload.notificationType && { notificationType: payload.notificationType }),
        ...(payload.sendingMethod && { sendingMethod: payload.sendingMethod }),
        ...(payload.status && { status: payload.status }),
        ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      };
      
      interface RawBulkUpdateResponse {
        isSuccess?: boolean;
        success?: boolean;
        resultMessage?: string;
        message?: string;
        data?: { updatedCount: number; totalCount: number };
        error?: string;
      }
      const response = await api.put<RawBulkUpdateResponse>('/v1/admin/notifications/bulk-update', backendPayload);
      const responseData = response.data;
      
      // Transform response to match expected format
      if (responseData.isSuccess !== undefined && responseData.success === undefined) {
        return {
          ...responseData,
          success: responseData.isSuccess,
          message: responseData.resultMessage || responseData.message || '',
          data: responseData.data || { updatedCount: 0, totalCount: 0 },
        } as ApiResponse<{ updatedCount: number; totalCount: number }>;
      }
      
      return {
        ...responseData,
        data: responseData.data || { updatedCount: 0, totalCount: 0 },
      } as ApiResponse<{ updatedCount: number; totalCount: number }>;
    } catch (error) {
      // Re-throw with better error message
      interface ErrorWithResponse {
        response?: {
          data?: {
            message?: string;
            resultMessage?: string;
            error?: string;
          };
        };
      }
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as ErrorWithResponse;
        const errorData = err.response?.data;
        const errorMessage = errorData?.message || errorData?.resultMessage || errorData?.error || 'Cập nhật hàng loạt thất bại';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
};

