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
  Semester,
  TuitionFee,
  Insurance,
  SemesterGrades,
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
    const response = await api.post<ApiResponse<CreateStudentResponse>>('/v1/admin/students', formData, {
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
    const response = await api.get('/v1/student-excel/export', {
      params: {
        departmentId: params.departmentId || undefined,
        facultyId: params.facultyId || undefined,
        academicYearId: params.academicYearId || undefined,
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
  getAcademicYears: async (params?: { count?: number }): Promise<ApiResponse<AcademicYear[]>> => {
    const response = await api.get<ApiResponse<AcademicYear[]>>('/v1/common/academic-years', {
      params: {
        count: params?.count || undefined,
      },
    });
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
    const response = await api.put<ApiResponse<CreateStudentResponse>>(`/v1/admin/students/${studentId}`, formData, {
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

  /**
   * Lấy danh sách tất cả học kì
   */
  getSemesters: async (): Promise<ApiResponse<Semester[]>> => {
    const response = await api.get<ApiResponse<Semester[]>>('/v1/common/semesters');
    return response.data;
  },

  /**
   * Lấy danh sách học phí của sinh viên theo học kì
   */
  getTuitionFees: async (params: { studentId: string; semesterId?: string }): Promise<ApiResponse<TuitionFee>> => {
    const response = await api.get<ApiResponse<TuitionFee>>('/v1/tuition-fees', {
      params: {
        StudentId: params.studentId,
        SemesterId: params.semesterId || undefined,
      },
    });
    return response.data;
  },

  /**
   * Lấy danh sách bảo hiểm y tế của sinh viên theo học kì
   */
  getInsurances: async (params: { studentId: string; semesterId?: string }): Promise<ApiResponse<Insurance[]>> => {
    const response = await api.get<ApiResponse<Insurance[]>>('/v1/insurances', {
      params: {
        StudentId: params.studentId,
        SemesterId: params.semesterId || undefined,
      },
    });
    return response.data;
  },

  /**
   * Xuất Excel học phí theo học kì
   */
  exportTuitionFees: async (params: { studentId: string; semesterId?: string }): Promise<Blob> => {
    const response = await api.get('/v1/tuition-fees/excel', {
      params: {
        StudentId: params.studentId,
        SemesterId: params.semesterId || undefined,
      },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Xuất Excel bảo hiểm y tế theo học kì
   */
  exportInsurances: async (params: { studentId: string; semesterId?: string }): Promise<Blob> => {
    const response = await api.get('/v1/insurances/excel', {
      params: {
        StudentId: params.studentId,
        SemesterId: params.semesterId || undefined,
      },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Lấy điểm học kỳ của sinh viên
   */
  getSemesterGrades: async (params: { studentId: string; semesterId: string }): Promise<ApiResponse<SemesterGrades>> => {
    const response = await api.get<ApiResponse<SemesterGrades>>(`/v1/students/semesters/${params.semesterId}/grades`, {
      params: {
        studentId: params.studentId,
      },
    });
    return response.data;
  },

  /**
   * Cập nhật hàng loạt sinh viên
   */
  bulkUpdateStudents: async (payload: { studentIds: string[]; enrollmentStatus?: string; classId?: string }): Promise<ApiResponse<{ updatedCount: number; totalRequested: number; failedCount: number }>> => {
    const response = await api.put<ApiResponse<{ updatedCount: number; totalRequested: number; failedCount: number }>>('/v1/admin/students/mass-edit', payload);
    return response.data;
  },

  /**
   * Xóa hàng loạt sinh viên (soft delete)
   */
  bulkDeleteStudents: async (studentIds: string[]): Promise<ApiResponse<{ deletedCount: number }>> => {
    const deletePromises = studentIds.map(id => api.delete(`/v1/admin/students/${id}`));
    const results = await Promise.allSettled(deletePromises);
    
    const deletedCount = results.filter(r => r.status === 'fulfilled').length;
    
    return {
      success: true,
      message: `Đã xóa ${deletedCount}/${studentIds.length} sinh viên`,
      data: { deletedCount }
    };
  },
};

