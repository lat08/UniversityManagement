import { api } from '@/lib/api/client';
import type {
  Division,
  DivisionBasic,
  ApiResponse,
  PagedResult,
  GetDivisionsParams,
  CreateDivisionPayload,
  UpdateDivisionPayload,
  BulkStatusUpdatePayload,
  BulkDeletePayload,
} from '../types/types';

export const divisionsApi = {
  // GET /v1/divisions - Lấy danh sách khoa
  getAll: async (params: GetDivisionsParams = {}): Promise<ApiResponse<PagedResult>> => {
    const { pageNumber = 1, pageSize = 10, searchTerm, status } = params;
    const queryParams: Record<string, string> = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    if (searchTerm) {
      queryParams.searchTerm = searchTerm;
    }
    if (status) {
      queryParams.status = status;
    }

    const response = await api.get<ApiResponse<PagedResult>>('/v1/divisions', {
      params: queryParams,
    });
    
    return response.data;
  },

  // GET /v1/divisions/{id}/basic - Lấy thông tin cơ bản của khoa
  getBasic: async (id: string): Promise<ApiResponse<DivisionBasic>> => {
    const response = await api.get<ApiResponse<DivisionBasic>>(`/v1/divisions/${id}/basic`);
    return response.data;
  },

  // POST /v1/divisions - Tạo khoa mới
  create: async (payload: CreateDivisionPayload): Promise<ApiResponse<Division>> => {
    const response = await api.post<ApiResponse<Division>>('/v1/divisions', payload);
    return response.data;
  },

  // PUT /v1/divisions/{id} - Cập nhật thông tin khoa
  update: async (id: string, payload: UpdateDivisionPayload): Promise<ApiResponse<Division>> => {
    const response = await api.put<ApiResponse<Division>>(`/v1/divisions/${id}`, payload);
    return response.data;
  },

  // PATCH /v1/divisions/bulk-status - Cập nhật trạng thái hàng loạt
  bulkUpdateStatus: async (payload: BulkStatusUpdatePayload): Promise<ApiResponse<{ updatedCount: number }>> => {
    const response = await api.patch<ApiResponse<{ updatedCount: number }>>('/v1/divisions/bulk-status', payload);
    return response.data;
  },

  // DELETE /v1/divisions/bulk - Xóa hàng loạt
  bulkDelete: async (payload: BulkDeletePayload): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await api.delete<ApiResponse<{ deletedCount: number }>>('/v1/divisions/bulk', {
      data: payload,
    });
    return response.data;
  },

  // GET /v1/divisions/export - Xuất danh sách ra Excel
  export: async (params: { searchTerm?: string; status?: string } = {}): Promise<Blob> => {
    const queryParams: Record<string, string> = {};
    if (params.searchTerm) {
      queryParams.searchTerm = params.searchTerm;
    }
    if (params.status) {
      queryParams.status = params.status;
    }

    const response = await api.get('/v1/divisions/export', {
      params: queryParams,
      responseType: 'blob',
    });
    
    return response.data;
  },
};
