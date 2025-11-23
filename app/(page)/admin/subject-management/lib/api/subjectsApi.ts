import { api } from '@/lib/api/client';
import type {
  SubjectDetail,
  CreateSubjectPayload,
  GetSubjectsParams,
  SubjectsResponse,
  ApiResponse,
} from '../types/types';

export const subjectsApi = {
  getSubjects: async (params: GetSubjectsParams): Promise<ApiResponse<SubjectsResponse>> => {
    const response = await api.get<ApiResponse<SubjectsResponse>>('/v1/subjects', { params });
    return response.data;
  },

  getSubjectById: async (subjectId: string): Promise<ApiResponse<SubjectDetail>> => {
    const response = await api.get<ApiResponse<SubjectDetail>>(`/v1/subjects/${subjectId}`);
    return response.data;
  },

  createSubject: async (payload: CreateSubjectPayload): Promise<ApiResponse<SubjectDetail>> => {
    const response = await api.post<ApiResponse<SubjectDetail>>('/v1/subjects', payload);
    return response.data;
  },

  updateSubject: async (
    subjectId: string,
    payload: CreateSubjectPayload,
  ): Promise<ApiResponse<SubjectDetail>> => {
    const response = await api.put<ApiResponse<SubjectDetail>>(
      `/v1/subjects/${subjectId}`,
      payload,
    );
    return response.data;
  },

  deleteSubject: async (subjectId: string): Promise<ApiResponse<boolean>> => {
    const response = await api.delete<ApiResponse<boolean>>(`/v1/subjects/${subjectId}`);
    return response.data;
  },
};
