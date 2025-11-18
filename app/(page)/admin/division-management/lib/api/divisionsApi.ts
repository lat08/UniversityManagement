import { api } from '@/lib/api/client';
import type {
  Division,
  DivisionsResponse,
  ApiResponse,
  GetDivisionsParams,
  CreateDivisionPayload,
  UpdateDivisionPayload,
  Instructor,
} from '../types/types';

// Backend DTO types
interface DivisionDto {
  divisionId: string; // Guid serialized as string
  divisionName: string;
  divisionCode: string;
  divisionStatus?: string;
  deanId?: string | null; // Guid serialized as string or null
  deanName?: string | null;
  facultyCount: number;
  subjectCount: number;
  instructorCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface BackendDivisionsResponse {
  data: DivisionDto[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

interface InstructorDto {
  instructorId: string; // Guid serialized as string
  fullName: string; // Backend uses FullName, not instructorName
  instructorCode?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

// Helper function to map DivisionDto to Division
const mapDivisionDtoToDivision = (division: DivisionDto): Division => ({
  divisionId: division.divisionId,
  divisionCode: division.divisionCode,
  divisionName: division.divisionName,
  deanId: division.deanId || undefined, // Convert null to undefined
  deanName: division.deanName || undefined, // Convert null to undefined
  status: (division.divisionStatus === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
  subjectCount: division.subjectCount,
  instructorCount: division.instructorCount,
  createdAt: division.createdAt,
  updatedAt: division.updatedAt || undefined, // Convert null to undefined
});

// Helper function to map InstructorDto to Instructor
const mapInstructorToInstructor = (instructor: InstructorDto): Instructor | null => {
  // Filter out instructors without name
  if (!instructor.fullName || !instructor.instructorId) {
    return null;
  }
  return {
    instructorId: instructor.instructorId,
    instructorName: instructor.fullName, // Map FullName to instructorName
    instructorCode: instructor.instructorCode || '',
    status: 'active' as const, // Endpoint /v1/common/instructors chỉ trả về giảng viên đang hoạt động
  };
};

export const divisionsApi = {
  /**
   * Lấy danh sách khoa với phân trang và filters
   */
  getDivisions: async (params: GetDivisionsParams = {}): Promise<ApiResponse<DivisionsResponse>> => {
    try {
      const response = await api.get<BackendApiResponse<BackendDivisionsResponse>>('/v1/divisions', {
        params: {
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 20,
          searchTerm: params.searchKeyword || undefined,
          status: params.status || undefined,
        },
      });

      if (response.data.success && response.data.data) {
        const backendData = response.data.data;
        const divisions = backendData.data.map(mapDivisionDtoToDivision);
        
        // Calculate statistics
        const activeDivisions = divisions.filter(d => d.status === 'active').length;
        const inactiveDivisions = divisions.filter(d => d.status === 'inactive').length;

        return {
          success: true,
          message: response.data.message || 'Lấy danh sách khoa thành công',
          data: {
            divisions,
            pagination: backendData.pagination,
            statistics: {
              totalDivisions: backendData.pagination.totalCount,
              activeDivisions,
              inactiveDivisions,
            },
          },
        };
      }

      throw new Error(response.data.message || 'Lấy danh sách khoa thất bại');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi khi lấy danh sách khoa';
      return {
        success: false,
        message: errorMessage,
        data: {
          divisions: [],
          pagination: {
            currentPage: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
          },
          statistics: {
            totalDivisions: 0,
            activeDivisions: 0,
            inactiveDivisions: 0,
          },
        },
        errors: error?.response?.data?.errors,
      };
    }
  },

  /**
   * Lấy danh sách giảng viên đang hoạt động từ /v1/common/instructors
   */
  getInstructors: async (searchString?: string): Promise<ApiResponse<Instructor[]>> => {
    try {
      const response = await api.get<BackendApiResponse<InstructorDto[]>>('/v1/common/instructors', {
        params: {
          searchString: searchString || undefined,
        },
      });

      if (response.data.success && response.data.data) {
        // Endpoint này chỉ trả về giảng viên đang hoạt động, không cần filter thêm
        const instructors = (response.data.data || [])
          .filter(i => i.fullName && i.instructorId)
          .map(mapInstructorToInstructor)
          .filter((i): i is Instructor => i !== null);

        return {
          success: true,
          message: 'Lấy danh sách giảng viên thành công',
          data: instructors,
        };
      }

      throw new Error('Lấy danh sách giảng viên thất bại');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi khi lấy danh sách giảng viên';
      return {
        success: false,
        message: errorMessage,
        data: [],
        errors: error?.response?.data?.errors,
      };
    }
  },

  /**
   * Tạo mới khoa
   */
  createDivision: async (payload: CreateDivisionPayload): Promise<ApiResponse<Division>> => {
    try {
      const createDto = {
        divisionName: payload.divisionName.trim(),
        deanId: payload.deanId || null,
      };

      const response = await api.post<BackendApiResponse<DivisionDto>>('/v1/divisions', createDto);

      if (response.data.success && response.data.data) {
        const division = mapDivisionDtoToDivision(response.data.data);
        return {
          success: true,
          message: response.data.message || 'Thêm khoa thành công',
          data: division,
        };
      }

      throw new Error(response.data.message || 'Thêm khoa thất bại');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi khi thêm khoa';
      return {
        success: false,
        message: errorMessage,
        data: {} as Division,
        errors: error?.response?.data?.errors,
      };
    }
  },

  /**
   * Cập nhật thông tin khoa
   */
  updateDivision: async (payload: UpdateDivisionPayload): Promise<ApiResponse<Division>> => {
    try {
      const updateDto = {
        divisionName: payload.divisionName.trim(),
        deanId: payload.deanId || null,
        divisionStatus: payload.status || 'active',
      };

      const response = await api.put<BackendApiResponse<DivisionDto>>(
        `/v1/divisions/${payload.divisionId}`,
        updateDto
      );

      if (response.data.success && response.data.data) {
        const division = mapDivisionDtoToDivision(response.data.data);
        return {
          success: true,
          message: response.data.message || 'Cập nhật khoa thành công',
          data: division,
        };
      }

      throw new Error(response.data.message || 'Cập nhật khoa thất bại');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi khi cập nhật khoa';
      return {
        success: false,
        message: errorMessage,
        data: {} as Division,
        errors: error?.response?.data?.errors,
      };
    }
  },

  /**
   * Xóa khoa (sử dụng bulk delete với 1 item)
   */
  deleteDivision: async (divisionId: string): Promise<ApiResponse<null>> => {
    try {
      const bulkDeleteDto = {
        divisionIds: [divisionId],
      };

      const response = await api.delete<BackendApiResponse<{ deletedCount: number }>>(
        '/v1/divisions/bulk',
        { data: bulkDeleteDto }
      );

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Xóa khoa thành công',
          data: null,
        };
      }

      throw new Error(response.data.message || 'Xóa khoa thất bại');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi khi xóa khoa';
      return {
        success: false,
        message: errorMessage,
        data: null,
        errors: error?.response?.data?.errors,
      };
    }
  },

  /**
   * Xóa hàng loạt khoa
   */
  bulkDeleteDivisions: async (divisionIds: string[]): Promise<ApiResponse<null>> => {
    try {
      const bulkDeleteDto = {
        divisionIds: divisionIds,
      };

      const response = await api.delete<BackendApiResponse<{ deletedCount: number }>>(
        '/v1/divisions/bulk',
        { data: bulkDeleteDto }
      );

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || `Đã xóa ${divisionIds.length} khoa`,
          data: null,
        };
      }

      throw new Error(response.data.message || 'Xóa hàng loạt thất bại');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đã xảy ra lỗi khi xóa hàng loạt';
      return {
        success: false,
        message: errorMessage,
        data: null,
        errors: error?.response?.data?.errors,
      };
    }
  },

  /**
   * Xuất Excel danh sách khoa
   */
  exportDivisions: async (params: { searchKeyword?: string; status?: string }): Promise<Blob> => {
    const response = await api.get('/v1/divisions/export', {
      params: {
        searchTerm: params.searchKeyword || undefined,
        status: params.status || undefined,
      },
      responseType: 'blob',
    });
    return response.data;
  },
};

