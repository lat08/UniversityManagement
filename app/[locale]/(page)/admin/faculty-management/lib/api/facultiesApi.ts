import { api } from '@/lib/api/client';
import type {
  Faculty,
  ApiResponse,
  FacultyListResponse,
  GetFacultiesParams,
  CreateFacultyPayload,
  UpdateFacultyPayload,
  Division,
  Curriculum,
  Instructor,
} from '../types/types';

export const facultiesApi = {
  // GET /v1/admin/faculties - Lấy danh sách ngành với phân trang và filter
  getAll: async (params: GetFacultiesParams = {}): Promise<ApiResponse<FacultyListResponse>> => {
    const queryParams: Record<string, string> = {};
    
    if (params.pageNumber) queryParams.pageNumber = params.pageNumber.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
    if (params.divisionId) queryParams.divisionId = params.divisionId;
    if (params.curriculumId) queryParams.curriculumId = params.curriculumId;
    if (params.isActive !== undefined && params.isActive !== null) {
      queryParams.isActive = params.isActive.toString();
    }
    if (params.deanId) queryParams.deanId = params.deanId;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    const response = await api.get<ApiResponse<FacultyListResponse>>('/v1/admin/faculties', {
      params: queryParams,
    });
    
    return response.data;
  },

  // GET /v1/admin/faculties/{id} - Lấy chi tiết ngành
  getById: async (id: string): Promise<Faculty> => {
    const response = await api.get<ApiResponse<Faculty>>(`/v1/admin/faculties/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không tìm thấy ngành');
  },

  // POST /v1/admin/faculties - Tạo ngành mới
  create: async (payload: CreateFacultyPayload): Promise<ApiResponse<Faculty>> => {
    const response = await api.post<ApiResponse<Faculty>>('/v1/admin/faculties', payload);
    return response.data;
  },

  // PUT /v1/admin/faculties/{id} - Cập nhật ngành
  update: async (id: string, payload: UpdateFacultyPayload): Promise<ApiResponse<Faculty>> => {
    const response = await api.put<ApiResponse<Faculty>>(`/v1/admin/faculties/${id}`, payload);
    return response.data;
  },

  // DELETE /v1/admin/faculties/{id} - Xóa mềm ngành
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/v1/admin/faculties/${id}`);
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

  // Get statistics - lấy thống kê tổng số, active, inactive
  // Stats should always return total counts regardless of filters
  getStats: async (): Promise<{ total: number; active: number; inactive: number }> => {
    try {
      // Gọi API 3 lần để lấy stats chính xác (không có filter)
      const [allResponse, activeResponse, inactiveResponse] = await Promise.all([
        facultiesApi.getAll({ pageNumber: 1, pageSize: 1 }), // Chỉ cần totalCount
        facultiesApi.getAll({ pageNumber: 1, pageSize: 1, isActive: true }),
        facultiesApi.getAll({ pageNumber: 1, pageSize: 1, isActive: false }),
      ]);

      interface ResponseData {
        totalCount?: number;
        TotalCount?: number;
      }

      const getTotalCount = (data: FacultyListResponse | undefined): number => {
        if (!data) return 0;
        const responseData = data as unknown as ResponseData;
        return responseData.totalCount ?? responseData.TotalCount ?? 0;
      };

      const total = allResponse.success ? getTotalCount(allResponse.data) : 0;
      const active = activeResponse.success ? getTotalCount(activeResponse.data) : 0;
      const inactive = inactiveResponse.success ? getTotalCount(inactiveResponse.data) : 0;

      return { total, active, inactive };
    } catch {
      return { total: 0, active: 0, inactive: 0 };
    }
  },
};

// API để lấy danh sách divisions, curriculums, instructors từ các controller
export const commonApi = {
  // GET /v1/divisions - Lấy danh sách tất cả khoa
  getDivisions: async (): Promise<Division[]> => {
    try {
      console.log('Calling /v1/divisions API...');
      const response = await api.get<ApiResponse<{
        data: Division[];
        pagination: {
          currentPage: number;
          pageSize: number;
          totalCount: number;
          totalPages: number;
        };
      }>>('/v1/divisions', {
        params: {
          pageNumber: '1',
          pageSize: '100',
        },
      });
      
      console.log('Full response object:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.success:', response.data?.success);
      console.log('Response.data.data:', response.data?.data);
      
      // Response structure từ API: 
      // { success: true, data: { data: Division[], pagination: {...} } }
      if (response.data?.success) {
        const responseData = response.data.data;
        
        // Check nested structure: response.data.data.data
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          const divisions = (responseData as { data: Division[] }).data;
          if (Array.isArray(divisions)) {
            console.log('Divisions extracted from nested structure:', divisions.length, 'items');
            return divisions;
          }
        }
        
        // Fallback: check if data is directly an array
        if (Array.isArray(responseData)) {
          console.log('Divisions found as direct array:', responseData.length, 'items');
          return responseData;
        }
        
        // Another fallback: check if responseData has a different structure
        if (responseData && typeof responseData === 'object') {
          const keys = Object.keys(responseData);
          console.log('Response data keys:', keys);
          
          // Try to find divisions array in any key
          for (const key of keys) {
            const value = (responseData as Record<string, unknown>)[key];
            if (Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === 'object' && 'divisionId' in value[0]) {
              console.log(`Divisions found in key "${key}":`, value.length, 'items');
              return value as Division[];
            }
          }
        }
      }
      
      console.warn('Unexpected response structure from /v1/divisions:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataType: typeof response.data?.data,
        dataKeys: response.data?.data && typeof response.data.data === 'object' ? Object.keys(response.data.data) : [],
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      return [];
    } catch (error: unknown) {
      console.error('Error fetching divisions:', error);
      const errorObj = error as { message?: string; response?: { data?: unknown; status?: number; statusText?: string }; config?: { url?: string; method?: string; params?: unknown } };
      console.error('Error details:', {
        message: errorObj?.message,
        response: errorObj?.response?.data,
        status: errorObj?.response?.status,
        statusText: errorObj?.response?.statusText,
        config: {
          url: errorObj?.config?.url,
          method: errorObj?.config?.method,
          params: errorObj?.config?.params,
        }
      });
      return [];
    }
  },

  // GET /v1/admin/curriculums - Lấy danh sách chương trình đào tạo
  getCurriculums: async (facultyId?: string, divisionId?: string): Promise<Curriculum[]> => {
    const queryParams: Record<string, string> = {
      pageSize: '100',
      pageNumber: '1',
    };
    if (facultyId) {
      queryParams.facultyId = facultyId;
    }
    if (divisionId) {
      queryParams.divisionId = divisionId;
    }
    
    const response = await api.get<ApiResponse<{ curriculums: Curriculum[]; totalCount: number }>>('/v1/admin/curriculums', {
      params: queryParams,
    });
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      // Handle both PascalCase and camelCase from CurriculumListResponseDto
      interface CurriculumResponseData {
        curriculums?: Curriculum[];
        Curriculums?: Curriculum[];
        items?: Curriculum[];
        Items?: Curriculum[];
      }
      
      const responseData = data as unknown as CurriculumResponseData;
      const items = Array.isArray(responseData.Curriculums)
        ? responseData.Curriculums
        : Array.isArray(responseData.curriculums)
          ? responseData.curriculums
          : Array.isArray(responseData.items)
            ? responseData.items
            : Array.isArray(responseData.Items)
              ? responseData.Items
              : [];
      
      return items;
    }
    return [];
  },

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

