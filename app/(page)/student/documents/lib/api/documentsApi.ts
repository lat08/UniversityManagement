import { api } from '@/lib/api/client';
import { DocumentsApiResponse, CourseGroup, DocumentItem } from '../types/types';

export const documentsApi = {
  /**
   * Lấy danh sách tài liệu của sinh viên (grouped by course)
   */
  getDocuments: async (): Promise<DocumentsApiResponse> => {
    const response = await api.get('/v1/students/me/documents');
    return response.data;
  },
};

export type { DocumentItem, CourseGroup };


