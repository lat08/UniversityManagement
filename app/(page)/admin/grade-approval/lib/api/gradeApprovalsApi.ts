import { api } from '@/lib/api/client';
import {
  ApiResponse,
  GradeApprovalsResponse,
  GetGradeApprovalsParams,
  ExportGradeApprovalsParams,
  Faculty,
  Department,
  Instructor,
} from '../types/types';

export const gradeApprovalsApi = {
  // Get grade approvals with filters
  getGradeApprovals: async (params: GetGradeApprovalsParams): Promise<ApiResponse<GradeApprovalsResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());
    if (params.searchKeyword) queryParams.append('SearchKeyword', params.searchKeyword);
    if (params.facultyId) queryParams.append('FacultyId', params.facultyId);
    if (params.departmentId) queryParams.append('DepartmentId', params.departmentId);
    if (params.instructorId) queryParams.append('InstructorId', params.instructorId);
    if (params.approvalStatus) queryParams.append('ApprovalStatus', params.approvalStatus);

    const response = await api.get(`/api/grades/approvals?${queryParams.toString()}`);
    return response.data;
  },

  // Get faculties for filter dropdown
  getFaculties: async (): Promise<ApiResponse<Faculty[]>> => {
    const response = await api.get('/api/faculties');
    return response.data;
  },

  // Get departments for filter dropdown
  getDepartments: async (params?: { facultyId?: string }): Promise<ApiResponse<{ items: Department[] }>> => {
    const queryParams = new URLSearchParams();
    if (params?.facultyId) queryParams.append('FacultyId', params.facultyId);
    
    const response = await api.get(`/api/departments?${queryParams.toString()}`);
    return response.data;
  },

  // Get instructors for filter dropdown
  getInstructors: async (params?: { departmentId?: string }): Promise<ApiResponse<Instructor[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.departmentId) queryParams.append('DepartmentId', params.departmentId);
    
    const response = await api.get(`/api/instructors?${queryParams.toString()}`);
    return response.data;
  },

  // Export grade approvals to Excel
  exportGradeApprovals: async (params: ExportGradeApprovalsParams): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    
    if (params.searchKeyword) queryParams.append('SearchKeyword', params.searchKeyword);
    if (params.facultyId) queryParams.append('FacultyId', params.facultyId);
    if (params.departmentId) queryParams.append('DepartmentId', params.departmentId);
    if (params.instructorId) queryParams.append('InstructorId', params.instructorId);
    if (params.approvalStatus) queryParams.append('ApprovalStatus', params.approvalStatus);

    const response = await api.get(`/api/grades/approvals/export?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  },

  // Approve grade
  approveGrade: async (gradeApprovalId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/grades/approvals/${gradeApprovalId}/approve`);
    return response.data;
  },

  // Reject grade
  rejectGrade: async (gradeApprovalId: string, reason?: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/grades/approvals/${gradeApprovalId}/reject`, {
      reason,
    });
    return response.data;
  },
};
