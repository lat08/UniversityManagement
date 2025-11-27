import { api } from '@/lib/api/client';
import { commonApi } from '@/lib/api/common';
import type {
  Class,
  ClassDetail,
  ClassListResponse,
  ApiResponse,
  ClassFilterDto,
  CreateClassDto,
  UpdateClassDto,
  InstructorBasicDto,
  CurriculumBasicDto,
  Department,
  TrainingSystem,
  AcademicYear,
} from '../types/types';

export const classesApi = {
  /**
   * Lấy danh sách lớp học với phân trang và filters
   */
  getClasses: async (params: ClassFilterDto = {}): Promise<ApiResponse<ClassListResponse>> => {
    const response = await api.get<ApiResponse<ClassListResponse>>('/v1/class', {
      params: {
        DepartmentId: params.departmentId || undefined,
        TrainingSystemId: params.trainingSystemId || undefined,
        AdvisorInstructorId: params.advisorInstructorId || undefined,
        StartAcademicYearId: params.startAcademicYearId || undefined,
        EndAcademicYearId: params.endAcademicYearId || undefined,
        ClassStatus: params.classStatus || undefined,
        SearchTerm: params.searchTerm || undefined,
        Page: params.page || 1,
        PageSize: params.pageSize || 20,
      },
    });
    return response.data;
  },

  /**
   * Lấy thông tin lớp học theo ID
   */
  getClassById: async (id: string): Promise<ApiResponse<ClassDetail>> => {
    const response = await api.get<ApiResponse<ClassDetail>>(`/v1/class/${id}`);
    return response.data;
  },

  /**
   * Tạo lớp học mới
   */
  createClass: async (payload: CreateClassDto): Promise<ApiResponse<ClassDetail>> => {
    const response = await api.post<ApiResponse<ClassDetail>>('/v1/class', {
      ClassCode: payload.classCode,
      ClassName: payload.className,
      DepartmentId: payload.departmentId,
      AdvisorInstructorId: payload.advisorInstructorId || null,
      TrainingSystemId: payload.trainingSystemId,
      StartAcademicYearId: payload.startAcademicYearId,
      CurriculumId: payload.curriculumId || null,
    });
    return response.data;
  },

  /**
   * Cập nhật thông tin lớp học
   */
  updateClass: async (id: string, payload: UpdateClassDto): Promise<ApiResponse<ClassDetail>> => {
    const response = await api.put<ApiResponse<ClassDetail>>(`/v1/class/${id}`, {
      ClassName: payload.className,
      AdvisorInstructorId: payload.advisorInstructorId || null,
      TrainingSystemId: payload.trainingSystemId,
      ClassStatus: payload.classStatus,
      CurriculumId: payload.curriculumId || null,
    });
    return response.data;
  },

  /**
   * Xóa lớp học
   */
  deleteClass: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/v1/class/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách giảng viên có thể làm cố vấn theo chuyên ngành
   */
  getAvailableInstructors: async (departmentId: string): Promise<ApiResponse<InstructorBasicDto[]>> => {
    const response = await api.get<ApiResponse<InstructorBasicDto[]>>(`/v1/class/available-instructors/${departmentId}`);
    return response.data;
  },

  /**
   * Lấy danh sách chương trình đào tạo theo chuyên ngành
   */
  getAvailableCurriculums: async (departmentId: string): Promise<ApiResponse<CurriculumBasicDto[]>> => {
    const response = await api.get<ApiResponse<CurriculumBasicDto[]>>(`/v1/class/available-curriculums/${departmentId}`);
    return response.data;
  },

  /**
   * Lấy danh sách chuyên ngành (departments)
   */
  getDepartments: async (facultyId?: string): Promise<Department[]> => {
    const response = await commonApi.getDepartments(facultyId ? { facultyId } : undefined);
    if (response.success && response.data) {
      return response.data.map((d) => ({
        departmentId: d.departmentId,
        departmentName: d.departmentName,
        departmentCode: d.departmentCode,
        facultyId: d.facultyId,
      }));
    }
    return [];
  },

  /**
   * Lấy danh sách năm học (academic years)
   */
  getAcademicYears: async (count?: number): Promise<AcademicYear[]> => {
    try {
      const response = await commonApi.getAcademicYears(count ? { count } : undefined);
      if (response.success && response.data && Array.isArray(response.data)) {
        const mapped = response.data.map((y: any) => {
          // Handle both yearRange (from common API) and yearName (expected by class management)
          const yearName = y.yearName || y.YearName || y.yearRange || y.YearRange || '';
          const academicYearId = y.academicYearId || y.AcademicYearId || '';
          const yearCode = y.yearCode || y.YearCode || '';

          return {
            academicYearId: String(academicYearId),
            yearName,
            yearCode,
          };
        }).filter((y: AcademicYear) => y.yearName && y.academicYearId && y.yearName.trim() !== '');

        console.log('[DEBUG] Academic years mapped:', mapped);
        return mapped;
      }

      console.warn('[DEBUG] Academic years response:', response);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
    return [];
  },

  /**
   * Lấy danh sách hệ đào tạo (training systems)
   */
  getTrainingSystems: async (): Promise<TrainingSystem[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/v1/class/available-training-systems');
      if (response.data.success && response.data.data) {
        return response.data.data.map((ts: any) => ({
          trainingSystemId: String(ts.trainingSystemId || ts.TrainingSystemId),
          trainingSystemName: ts.trainingSystemName || ts.TrainingSystemName || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching training systems:', error);
    }
    return [];
  },
};

