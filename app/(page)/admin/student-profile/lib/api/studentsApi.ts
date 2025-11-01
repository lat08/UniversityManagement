import { api } from '@/lib/api/client';
import {
  ApiResponse,
  StudentsResponse,
  GetStudentsParams,
  ExportStudentsParams,
  CreateStudentPayload,
  CreateStudentResponse,
  AcademicYear,
  Department,
  Faculty,
  StudentDetail,
  ClassItem,
  UpdateStudentPayload,
} from '../types/types';

export const studentsApi = {
  /**
   * Lấy danh sách sinh viên với phân trang và filters
   */
  getStudents: async (params: GetStudentsParams = {}): Promise<ApiResponse<StudentsResponse>> => {
    const response = await api.get<ApiResponse<StudentsResponse>>('/v1/admin/students', {
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        searchKeyword: params.searchKeyword || undefined,
        departmentId: params.departmentId || undefined,
        academicYearId: params.academicYearId || undefined,
        enrollmentStatus: params.enrollmentStatus || undefined,
      },
    });
    return response.data;
  },

  /**
   * Tạo sinh viên mới
   */
  createStudent: async (payload: CreateStudentPayload): Promise<ApiResponse<CreateStudentResponse>> => {
    const formData = new FormData();
    formData.append('FullName', payload.fullName);
    formData.append('DateOfBirth', payload.dateOfBirth);
    formData.append('Gender', payload.gender);
    formData.append('PhoneNumber', payload.phoneNumber);
    formData.append('CitizenId', payload.citizenId);
    formData.append('Address', payload.address);
    formData.append('ClassId', payload.classId);
    if (payload.enrollmentStatus) {
      formData.append('EnrollmentStatus', payload.enrollmentStatus);
    }
    if (payload.profilePicturePath) {
      formData.append('ProfilePicturePath', payload.profilePicturePath);
    }

    // Xóa Content-Type để axios tự động set multipart/form-data với boundary
    const response = await api.post<ApiResponse<CreateStudentResponse>>('/v1/students', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  /**
   * Xoá mềm sinh viên theo ID
   */
  deleteStudent: async (studentId: string): Promise<ApiResponse<{ studentId: string }>> => {
    const response = await api.delete<ApiResponse<{ studentId: string }>>(`/v1/admin/students/${studentId}`);
    return response.data;
  },

  /**
   * Export danh sách sinh viên ra Excel theo bộ lọc hiện tại
   */
  exportStudents: async (params: ExportStudentsParams = {}): Promise<Blob> => {
    const response = await api.get('/v1/admin/students/export', {
      params: {
        searchKeyword: params.searchKeyword || undefined,
        departmentId: params.departmentId || undefined,
        facultyId: params.facultyId || undefined,
        enrollmentStatus: params.enrollmentStatus || undefined,
      },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Validate file Excel trước khi import
   */
  validateExcelFile: async (file: File): Promise<ApiResponse<{ isValid: boolean; errors?: string[] }>> => {
    const formData = new FormData();
    formData.append('excelFile', file);

    const response = await api.post<ApiResponse<{ isValid: boolean; errors?: string[] }>>('/v1/student-excel/validate', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  /**
   * Import sinh viên từ file Excel đã được validate
   */
  importStudentsFromExcel: async (file: File): Promise<ApiResponse<{ importedCount: number; failedCount: number }>> => {
    const formData = new FormData();
    formData.append('excelFile', file);

    const response = await api.post<ApiResponse<{ importedCount: number; failedCount: number }>>('/v1/student-excel/import', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  /**
   * Download template Excel để import sinh viên
   */
  downloadExcelTemplate: async (): Promise<Blob> => {
    const response = await api.get('/v1/student-excel/download-template', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Import sinh viên từ file Excel (legacy)
   * @deprecated Use validateExcelFile + importStudentsFromExcel instead
   */
  importStudents: async (file: File): Promise<ApiResponse<{ importedCount: number; failedCount: number }>> => {
    const formData = new FormData();
    formData.append('file', file);

    // Xóa Content-Type để axios tự động set multipart/form-data với boundary
    const response = await api.post<ApiResponse<{ importedCount: number; failedCount: number }>>('/v1/admin/students/import', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách năm học
   */
  getAcademicYears: async (): Promise<ApiResponse<AcademicYear[]>> => {
    const response = await api.get<ApiResponse<AcademicYear[]>>('/v1/common/academic-years');
    return response.data;
  },

  /**
   * Lấy danh sách chuyên ngành
   */
  getDepartments: async (params: { pageNumber?: number; pageSize?: number } = {}): Promise<ApiResponse<{ items: Department[] }>> => {
    const response = await api.get<ApiResponse<{ items: Department[] }>>('/v1/admin/departments', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 100,
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách ngành
   */
  getFaculties: async (params: { pageNumber?: number; pageSize?: number } = {}): Promise<ApiResponse<{ items: Faculty[] }>> => {
    const response = await api.get<ApiResponse<{ items: Faculty[] }>>('/v1/admin/faculties', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 100,
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách lớp (tuỳ chọn lọc theo departmentId)
   */
  getClasses: async (params: { departmentId?: string } = {}): Promise<ApiResponse<ClassItem[]>> => {
    const response = await api.get<ApiResponse<ClassItem[]>>('/v1/common/classes', {
      params: {
        departmentId: params.departmentId || undefined,
      },
    });
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết sinh viên theo ID
   */
  getStudentById: async (studentId: string): Promise<ApiResponse<StudentDetail>> => {
    const response = await api.get<ApiResponse<StudentDetail>>(`/v1/admin/students/${studentId}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin sinh viên theo ID
   */
  updateStudent: async (studentId: string, payload: UpdateStudentPayload): Promise<ApiResponse<CreateStudentResponse>> => {
    const formData = new FormData();
    formData.append('FullName', payload.fullName);
    formData.append('DateOfBirth', payload.dateOfBirth);
    formData.append('Gender', payload.gender);
    formData.append('PhoneNumber', payload.phoneNumber || '');
    formData.append('CitizenId', payload.citizenId || '');
    formData.append('Address', payload.address || '');
    formData.append('ClassId', payload.classId);
    formData.append('EnrollmentStatus', payload.enrollmentStatus);
    
    if (payload.profilePicture) {
      formData.append('ProfilePicture', payload.profilePicture);
    }
    
    if (payload.password && payload.password.trim()) {
      formData.append('Password', payload.password);
      formData.append('ConfirmPassword', payload.confirmPassword || payload.password);
    }

    // Xóa Content-Type để axios tự động set multipart/form-data với boundary
    const response = await api.put<ApiResponse<CreateStudentResponse>>(`/v1/students/${studentId}`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách khoa (common endpoint)
   */
  getCommonFaculties: async (): Promise<ApiResponse<Faculty[]>> => {
    const response = await api.get<ApiResponse<Faculty[]>>('/v1/common/faculties');
    return response.data;
  },

  /**
   * Lấy danh sách chuyên ngành (common endpoint)
   */
  getCommonDepartments: async (params: { facultyId?: string } = {}): Promise<ApiResponse<Department[]>> => {
    const response = await api.get<ApiResponse<Department[]>>('/v1/common/departments', {
      params: {
        facultyId: params.facultyId || undefined,
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách lớp (common endpoint với facultyId filter)
   */
  getCommonClasses: async (params: { departmentId?: string; facultyId?: string } = {}): Promise<ApiResponse<ClassItem[]>> => {
    const response = await api.get<ApiResponse<ClassItem[]>>('/v1/common/classes', {
      params: {
        departmentId: params.departmentId || undefined,
        facultyId: params.facultyId || undefined,
      },
    });
    return response.data;
  },
};

