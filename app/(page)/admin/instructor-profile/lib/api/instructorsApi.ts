import { api } from '@/lib/api/client';
import {
  ApiResponse,
  InstructorsResponse,
  CreateInstructorPayload,
  InstructorDetail,
  UpdateInstructorPayload,
} from '../types/types';

export interface GetInstructorsParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  facultyId?: string;
  degree?: string;
  employmentStatus?: string;
}

export const instructorsApi = {
  getInstructors: async (
    params: GetInstructorsParams = {},
  ): Promise<ApiResponse<InstructorsResponse>> => {
    const response = await api.get<ApiResponse<InstructorsResponse>>('/v1/admin/instructors', {
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        searchKeyword: params.searchKeyword || undefined,
        facultyId: params.facultyId || undefined,
        degree: params.degree || undefined,
        employmentStatus: params.employmentStatus || undefined,
      },
    });
    return response.data;
  },

  createInstructor: async (
    payload: CreateInstructorPayload,
  ): Promise<ApiResponse<InstructorDetail>> => {
    const formData = new FormData();
    formData.append('FullName', payload.fullName);
    formData.append('Gender', payload.gender);
    formData.append('FacultyId', payload.facultyId);

    if (payload.dateOfBirth) formData.append('DateOfBirth', payload.dateOfBirth);
    if (payload.hireDate) formData.append('HireDate', payload.hireDate);
    if (payload.phoneNumber) formData.append('PhoneNumber', payload.phoneNumber);
    if (payload.citizenId) formData.append('CitizenId', payload.citizenId);
    if (payload.address) formData.append('Address', payload.address);
    if (payload.degree) formData.append('Degree', payload.degree);
    if (payload.specialization) formData.append('Specialization', payload.specialization);
    if (payload.employmentStatus)
      formData.append('EmploymentStatus', payload.employmentStatus);
    if (payload.profilePicture) formData.append('ProfilePicture', payload.profilePicture);

    const response = await api.post<ApiResponse<InstructorDetail>>(
      '/v1/admin/instructors',
      formData,
      {
        headers: {
          'Content-Type': undefined as unknown as string,
        },
      },
    );
    return response.data;
  },

  getInstructorById: async (
    instructorId: string,
  ): Promise<ApiResponse<InstructorDetail>> => {
    const response = await api.get<ApiResponse<InstructorDetail>>(
      `/v1/admin/instructors/${instructorId}`,
    );
    return response.data;
  },

  updateInstructor: async (
    instructorId: string,
    payload: UpdateInstructorPayload,
  ): Promise<ApiResponse<InstructorDetail>> => {
    const formData = new FormData();

    if (payload.fullName) formData.append('FullName', payload.fullName);
    if (payload.gender) formData.append('Gender', payload.gender);
    if (payload.facultyId) formData.append('FacultyId', payload.facultyId);
    if (payload.dateOfBirth) formData.append('DateOfBirth', payload.dateOfBirth);
    if (payload.hireDate) formData.append('HireDate', payload.hireDate);
    if (payload.phoneNumber) formData.append('PhoneNumber', payload.phoneNumber);
    if (payload.citizenId) formData.append('CitizenId', payload.citizenId);
    if (payload.address) formData.append('Address', payload.address);
    if (payload.degree) formData.append('Degree', payload.degree);
    if (payload.specialization)
      formData.append('Specialization', payload.specialization);
    if (payload.employmentStatus)
      formData.append('EmploymentStatus', payload.employmentStatus);
    if (payload.profilePicture)
      formData.append('ProfilePicture', payload.profilePicture);

    if (payload.password && payload.confirmPassword) {
      formData.append('Password', payload.password);
      formData.append('ConfirmPassword', payload.confirmPassword);
    }

    const response = await api.put<ApiResponse<InstructorDetail>>(
      `/v1/admin/instructors/${instructorId}`,
      formData,
      {
        headers: {
          'Content-Type': undefined as unknown as string,
        },
      },
    );
    return response.data;
  },

  deleteInstructor: async (
    instructorId: string,
  ): Promise<ApiResponse<{ instructorId: string; instructorCode: string; fullName: string }>> => {
    const response = await api.delete<
      ApiResponse<{ instructorId: string; instructorCode: string; fullName: string }>
    >(`/v1/admin/instructors/${instructorId}`);
    return response.data;
  },

  exportInstructors: async (params: {
    facultyId?: string;
    degree?: string;
    employmentStatus?: string;
  } = {}): Promise<Blob> => {
    const response = await api.get('/v1/instructor-excel/export', {
      params: {
        facultyId: params.facultyId || undefined,
        degree: params.degree || undefined,
        employmentStatus: params.employmentStatus || undefined,
      },
      responseType: 'blob',
    });
    return response.data;
  },
};

