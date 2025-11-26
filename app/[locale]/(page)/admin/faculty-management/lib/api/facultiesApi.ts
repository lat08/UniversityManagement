import { api } from '@/lib/api/client';
import type {
  Faculty,
  ApiResponse,
  PagedResult,
  GetFacultiesParams,
  CreateFacultyPayload,
  UpdateFacultyPayload,
} from '../types/types';

export const facultiesApi = {
  // GET /v1/faculties - Lấy danh sách ngành
  getAll: async (params: GetFacultiesParams = {}): Promise<ApiResponse<PagedResult>> => {
    const { pageNumber = 1, pageSize = 10, searchTerm, divisionId, curriculumCode, status } = params;
    const queryParams: Record<string, string> = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    if (searchTerm) {
      queryParams.searchTerm = searchTerm;
    }
    if (divisionId) {
      queryParams.divisionId = divisionId;
    }
    if (curriculumCode) {
      queryParams.curriculumCode = curriculumCode;
    }
    if (status) {
      queryParams.status = status;
    }

    const response = await api.get<ApiResponse<PagedResult>>('/v1/faculties', {
      params: queryParams,
    });
    
    return response.data;
  },

  // GET /v1/faculties/{id} - Lấy thông tin chi tiết ngành
  getById: async (id: string): Promise<ApiResponse<Faculty>> => {
    const response = await api.get<ApiResponse<Faculty>>(`/v1/faculties/${id}`);
    return response.data;
  },

  // POST /v1/faculties - Tạo ngành mới
  create: async (payload: CreateFacultyPayload): Promise<ApiResponse<Faculty>> => {
    const response = await api.post<ApiResponse<Faculty>>('/v1/faculties', payload);
    return response.data;
  },

  // PUT /v1/faculties/{id} - Cập nhật thông tin ngành
  update: async (id: string, payload: UpdateFacultyPayload): Promise<ApiResponse<Faculty>> => {
    const response = await api.put<ApiResponse<Faculty>>(`/v1/faculties/${id}`, payload);
    return response.data;
  },

  // DELETE /v1/faculties/{id} - Xóa ngành
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/v1/faculties/${id}`);
    return response.data;
  },

  // Bulk delete - xóa nhiều ngành
  bulkDelete: async (ids: string[]): Promise<ApiResponse<null>> => {
    try {
      const results = await Promise.allSettled(ids.map((id) => facultiesApi.delete(id)));
      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      if (failed.length > 0) {
        return {
          success: false,
          message: `Xóa thành công ${ids.length - failed.length}/${ids.length} ngành`,
          data: null,
        };
      }
      
      return {
        success: true,
        message: `Đã xóa ${ids.length} ngành`,
        data: null,
      };
    } catch {
      return {
        success: false,
        message: 'Xóa hàng loạt thất bại',
        data: null,
      };
    }
  },

  // Bulk update - cập nhật nhiều ngành
  bulkUpdate: async (payload: {
    facultyIds: string[];
    facultyStatus?: 'active' | 'inactive';
    curriculumCode?: string;
  }): Promise<ApiResponse<null>> => {
    try {
      const results = await Promise.allSettled(
        payload.facultyIds.map(async (id) => {
          const faculty = await facultiesApi.getById(id);
          if (!faculty.success) return faculty;
          
          const updatePayload: UpdateFacultyPayload = {
            facultyName: faculty.data.facultyName,
            facultyCode: faculty.data.facultyCode,
            divisionId: faculty.data.divisionId,
            deanId: faculty.data.deanId,
            facultyStatus: payload.facultyStatus || faculty.data.facultyStatus as 'active' | 'inactive',
          };
          
          return facultiesApi.update(id, updatePayload);
        })
      );
      
      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      if (failed.length > 0) {
        return {
          success: false,
          message: `Cập nhật thành công ${payload.facultyIds.length - failed.length}/${payload.facultyIds.length} ngành`,
          data: null,
        };
      }
      
      return {
        success: true,
        message: `Đã cập nhật ${payload.facultyIds.length} ngành`,
        data: null,
      };
    } catch {
      return {
        success: false,
        message: 'Cập nhật hàng loạt thất bại',
        data: null,
      };
    }
  },
};
