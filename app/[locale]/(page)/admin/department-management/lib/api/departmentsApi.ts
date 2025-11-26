import { api } from '@/lib/api/client';
import { commonApi } from '@/lib/api/common';
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  BulkEditDepartmentDto,
  DepartmentStats,
  ApiResponse,
  PaginatedResponse,
  Faculty,
  Curriculum,
  DepartmentListResponseDto,
} from '../types/types';

/**
 * @api GET /v1/admin/departments
 * @description Lấy danh sách chuyên ngành với phân trang và tìm kiếm
 * @param searchQuery - Từ khóa tìm kiếm (mã, tên chuyên ngành)
 * @param facultyId - Lọc theo ngành học
 * @param curriculumId - Lọc theo chương trình đào tạo
 * @param status - Lọc theo trạng thái
 * @param pageNumber - Số trang
 * @param pageSize - Số lượng mỗi trang
 * @returns Danh sách chuyên ngành
 * @auth Required (Admin)
 */
export const departmentsApi = {
  async getAll(params?: {
    searchQuery?: string;
    facultyId?: string;
    curriculumId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Department>> {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.searchQuery) {
      queryParams.searchTerm = params.searchQuery;
    }
    if (params?.facultyId) {
      queryParams.facultyId = params.facultyId;
    }
    if (params?.curriculumId) {
      queryParams.curriculumId = params.curriculumId;
    }
    if (params?.pageNumber) {
      queryParams.pageNumber = params.pageNumber;
    }
    if (params?.pageSize) {
      queryParams.pageSize = params.pageSize;
    }

    const response = await api.get<ApiResponse<DepartmentListResponseDto>>(
      '/v1/admin/departments',
      { params: queryParams }
    );

    // Map response structure từ backend
    const backendData = response.data.data;
    return {
      items: backendData.items,
      totalCount: backendData.totalCount,
      pageNumber: backendData.pageNumber,
      pageSize: backendData.pageSize,
      totalPages: backendData.totalPages,
      hasPreviousPage: backendData.hasPreviousPage,
      hasNextPage: backendData.hasNextPage,
    };
  },

  /**
   * @api GET /v1/admin/departments/{id}
   * @description Lấy thông tin chi tiết chuyên ngành theo ID
   * @param id - ID chuyên ngành
   * @returns Thông tin chuyên ngành
   * @auth Required (Admin)
   */
  async getById(id: string): Promise<Department> {
    const response = await api.get<ApiResponse<Department>>(
      `/v1/admin/departments/${id}`
    );
    return response.data.data;
  },

  /**
   * @api POST /v1/admin/departments
   * @description Tạo chuyên ngành mới
   * @param data - Dữ liệu chuyên ngành mới
   * @returns Chuyên ngành vừa tạo
   * @auth Required (Admin)
   */
  async create(data: CreateDepartmentDto): Promise<Department> {
    const response = await api.post<ApiResponse<Department>>(
      '/v1/admin/departments',
      data
    );
    return response.data.data;
  },

  /**
   * @api PUT /v1/admin/departments/{id}
   * @description Cập nhật thông tin chuyên ngành
   * @param id - ID chuyên ngành
   * @param data - Dữ liệu cập nhật
   * @returns Chuyên ngành đã cập nhật
   * @auth Required (Admin)
   */
  async update(id: string, data: UpdateDepartmentDto): Promise<Department> {
    const response = await api.put<ApiResponse<Department>>(
      `/v1/admin/departments/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * @api DELETE /v1/admin/departments/{id}
   * @description Xóa chuyên ngành
   * @param id - ID chuyên ngành
   * @auth Required (Admin)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/v1/admin/departments/${id}`);
  },

  /**
   * @api DELETE /v1/admin/departments (bulk)
   * @description Xóa nhiều chuyên ngành
   * @param ids - Mảng ID chuyên ngành
   * @auth Required (Admin)
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.delete(id)));
  },

  /**
   * @api PUT /v1/admin/departments (bulk)
   * @description Cập nhật hàng loạt chuyên ngành
   * @param data - Dữ liệu cập nhật hàng loạt
   * @auth Required (Admin)
   */
  async bulkEdit(data: BulkEditDepartmentDto): Promise<void> {
    await Promise.all(
      data.ids.map((id) =>
        this.update(id, {
          facultyId: data.updates.facultyId,
        })
      )
    );
  },

  /**
   * @api GET /v1/admin/departments/stats
   * @description Lấy thống kê chuyên ngành
   * @returns Thống kê (tổng số, đang hoạt động, ngừng hoạt động)
   * @auth Required (Admin)
   */
  async getStats(): Promise<DepartmentStats> {
    const departments = await this.getAll({ pageSize: 1000 });
    return {
      total: departments.totalCount,
      active: departments.items.filter((d) => d.isActive).length,
      inactive: departments.items.filter((d) => !d.isActive).length,
    };
  },

  /**
   * @api GET /v1/common/faculties
   * @description Lấy danh sách ngành học (cho dropdown)
   * @returns Danh sách ngành học
   * @auth Required
   */
  async getFaculties(): Promise<Faculty[]> {
    try {
      type RawFaculty = Faculty & {
        id?: string;
        name?: string;
        code?: string;
        FacultyId?: string;
        FacultyName?: string;
        FacultyCode?: string;
      };
      const response = await commonApi.getFaculties();
      const faculties = (response.data ?? []) as RawFaculty[];
      return faculties.map((f) => ({
        facultyId: f.facultyId || f.FacultyId || f.id || '',
        facultyName: f.facultyName || f.FacultyName || f.name || '',
        facultyCode: f.facultyCode || f.FacultyCode || f.code || '',
      }));
    } catch (error) {
      console.error('Failed to fetch faculties:', error);
      return [];
    }
  },

  /**
   * @api GET /v1/admin/curriculums
   * @description Lấy danh sách chương trình đào tạo (cho dropdown)
   * @param departmentId - Lọc theo chuyên ngành (optional, nếu không có sẽ lấy tất cả)
   * @returns Danh sách chương trình đào tạo
   * @auth Required (Admin)
   */
  async getCurricula(departmentId?: string): Promise<Curriculum[]> {
    try {
      const params: Record<string, string | number> = {
        pageSize: 1000,
        pageNumber: 1,
      };
      
      // Nếu có departmentId thì filter, nếu không thì lấy tất cả (không filter)
      if (departmentId) {
        params.departmentId = departmentId;
      }

      const response = await api.get<ApiResponse<{
        items: Array<{
          curriculumId: string;
          curriculumCode: string;
          curriculumName: string;
        }>;
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
      }>>('/v1/admin/curriculums', { params });
      
      const items = response.data.data?.items || [];
      return items.map((item) => ({
        curriculumId: item.curriculumId,
        curriculumCode: item.curriculumCode,
        curriculumName: item.curriculumName,
      }));
    } catch (error) {
      console.error('Failed to fetch curricula:', error);
      return [];
    }
  },
};

