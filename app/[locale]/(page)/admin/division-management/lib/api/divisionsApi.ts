import { api } from '@/lib/api/client';
import type {
  Division,
  DivisionBasic,
  ApiResponse,
  GetDivisionsParams,
  CreateDivisionPayload,
  UpdateDivisionPayload,
  BulkUpdateDivisionStatusPayload,
  BulkDeleteDivisionPayload,
} from '../types/types';

export const divisionsApi = {
  // GET /v1/divisions - Lấy danh sách khoa với phân trang và tìm kiếm
  getAll: async (params: GetDivisionsParams = {}): Promise<ApiResponse<{
    data: Division[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  }>> => {
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

    const response = await api.get<ApiResponse<{
      data: Division[];
      pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
      };
    }>>('/v1/divisions', {
      params: queryParams,
    });
    
    return response.data;
  },

  // GET /v1/divisions/{id}/basic - Lấy thông tin cơ bản của khoa
  getBasicById: async (id: string): Promise<DivisionBasic> => {
    const response = await api.get<ApiResponse<DivisionBasic>>(`/v1/divisions/${id}/basic`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không tìm thấy khoa');
  },

  // POST /v1/divisions - Tạo khoa mới
  create: async (payload: CreateDivisionPayload): Promise<ApiResponse<Division>> => {
    const response = await api.post<ApiResponse<Division>>('/v1/divisions', payload);
    return response.data;
  },

  // PUT /v1/divisions/{id} - Cập nhật khoa
  update: async (id: string, payload: UpdateDivisionPayload): Promise<ApiResponse<Division>> => {
    const response = await api.put<ApiResponse<Division>>(`/v1/divisions/${id}`, payload);
    return response.data;
  },

  // PATCH /v1/divisions/bulk-status - Cập nhật trạng thái hàng loạt
  bulkUpdateStatus: async (payload: BulkUpdateDivisionStatusPayload): Promise<ApiResponse<{ updatedCount: number }>> => {
    const response = await api.patch<ApiResponse<{ updatedCount: number }>>('/v1/divisions/bulk-status', {
      divisionIds: payload.divisionIds,
      status: payload.status,
    });
    return response.data;
  },

  // DELETE /v1/divisions/bulk - Xóa mềm hàng loạt
  bulkDelete: async (payload: BulkDeleteDivisionPayload): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await api.delete<ApiResponse<{ deletedCount: number }>>('/v1/divisions/bulk', {
      data: {
        divisionIds: payload.divisionIds,
      },
    });
    return response.data;
  },

  // GET /v1/divisions/export - Xuất danh sách khoa ra file Excel
  exportToExcel: async (searchTerm?: string, status?: string): Promise<Blob> => {
    const queryParams: Record<string, string> = {};
    if (searchTerm) {
      queryParams.searchTerm = searchTerm;
    }
    if (status) {
      queryParams.status = status;
    }

    const response = await api.get('/v1/divisions/export', {
      params: queryParams,
      responseType: 'blob',
    });
    
    return response.data;
  },
};

// API để lấy danh sách instructors từ CommonController
export interface Instructor {
  instructorId: string;
  instructorCode: string;
  fullName: string;
}

export const commonApi = {
  // GET /v1/common/instructors - Lấy danh sách tất cả giảng viên đang hoạt động
  getInstructors: async (searchString?: string): Promise<Instructor[]> => {
    const queryParams: Record<string, string> = {};
    if (searchString) {
      queryParams.searchString = searchString;
    }
    
    const response = await api.get<ApiResponse<Instructor[]>>('/v1/common/instructors', {
      params: queryParams,
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },
};

