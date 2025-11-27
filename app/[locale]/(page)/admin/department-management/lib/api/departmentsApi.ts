import { api } from '@/lib/api/client';
import type {
  Department,
  ApiResponse,
  DepartmentListResponse,
  GetDepartmentsParams,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  Faculty,
  Curriculum,
} from '../types/types';

export const departmentsApi = {
  // GET /v1/admin/departments - Lấy danh sách chuyên ngành với phân trang và filter
  getAll: async (params: GetDepartmentsParams = {}): Promise<ApiResponse<DepartmentListResponse>> => {
    const queryParams: Record<string, string> = {};
    
    if (params.pageNumber) queryParams.pageNumber = params.pageNumber.toString();
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
    if (params.facultyId) queryParams.facultyId = params.facultyId;
    if (params.curriculumId) queryParams.curriculumId = params.curriculumId;
    if (params.isActive !== undefined && params.isActive !== null) {
      queryParams.isActive = params.isActive.toString();
    }
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    const response = await api.get<ApiResponse<DepartmentListResponse>>('/v1/admin/departments', {
      params: queryParams,
    });
    
    return response.data;
  },

  // GET /v1/admin/departments/{id} - Lấy chi tiết chuyên ngành
  getById: async (id: string): Promise<Department> => {
    const response = await api.get<ApiResponse<Department>>(`/v1/admin/departments/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không tìm thấy chuyên ngành');
  },

  // POST /v1/admin/departments - Tạo chuyên ngành mới
  create: async (payload: CreateDepartmentPayload): Promise<ApiResponse<Department>> => {
    const response = await api.post<ApiResponse<Department>>('/v1/admin/departments', payload);
    return response.data;
  },

  // PUT /v1/admin/departments/{id} - Cập nhật chuyên ngành
  update: async (id: string, payload: UpdateDepartmentPayload): Promise<ApiResponse<Department>> => {
    const response = await api.put<ApiResponse<Department>>(`/v1/admin/departments/${id}`, payload);
    return response.data;
  },

  // DELETE /v1/admin/departments/{id} - Xóa mềm chuyên ngành
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/v1/admin/departments/${id}`);
    return response.data;
  },

  // Bulk delete - xóa nhiều chuyên ngành
  bulkDelete: async (ids: string[]): Promise<ApiResponse<null>> => {
    try {
      const results = await Promise.allSettled(ids.map((id) => departmentsApi.delete(id)));
      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      if (failed.length > 0) {
        return {
          success: false,
          message: `Xóa thành công ${ids.length - failed.length}/${ids.length} chuyên ngành`,
          data: null,
        };
      }
      
      return {
        success: true,
        message: `Đã xóa ${ids.length} chuyên ngành`,
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
  getStats: async (): Promise<{ total: number; active: number; inactive: number }> => {
    try {
      // Gọi API 3 lần để lấy stats chính xác
      const [allResponse, activeResponse, inactiveResponse] = await Promise.all([
        departmentsApi.getAll({ pageNumber: 1, pageSize: 1 }), // Chỉ cần totalCount
        departmentsApi.getAll({ pageNumber: 1, pageSize: 1, isActive: true }),
        departmentsApi.getAll({ pageNumber: 1, pageSize: 1, isActive: false }),
      ]);

      interface ResponseData {
        totalCount?: number;
        TotalCount?: number;
      }

      const getTotalCount = (data: DepartmentListResponse | undefined): number => {
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

// API để lấy danh sách faculties và curriculums từ CommonController
export const commonApi = {
  // GET /v1/common/faculties - Lấy danh sách tất cả khoa
  getFaculties: async (): Promise<Faculty[]> => {
    const response = await api.get<ApiResponse<Faculty[]>>('/v1/common/faculties');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  },

  // GET /v1/admin/curriculums - Lấy danh sách chương trình đào tạo
  getCurriculums: async (departmentId?: string, facultyId?: string): Promise<Curriculum[]> => {
    const queryParams: Record<string, string> = {};
    if (departmentId) {
      queryParams.departmentId = departmentId;
    }
    if (facultyId) {
      queryParams.facultyId = facultyId;
    }
    // Set page size to get more results
    queryParams.pageSize = '1000';
    queryParams.pageNumber = '1';
    
    const response = await api.get<ApiResponse<{ curriculums: Curriculum[]; totalCount: number }>>('/v1/admin/curriculums', {
      params: queryParams,
    });
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      // Handle both PascalCase and camelCase from CurriculumListResponseDto
      // Backend returns: { Curriculums: CurriculumListItemDto[], TotalCount, PageNumber, PageSize, TotalPages }
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
};

