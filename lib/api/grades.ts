import { api } from '@/lib/api/client';

import type {
  CumulativeGradesResponse,
  SemesterGradeResponse,
} from '@/app/[locale]/(page)/student/grades/lib/types/types';

const createGradesError = (error: unknown, defaultMessage: string): Error => {
  const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
  if (axiosError.response?.status === 401) {
    return new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }
  return new Error(axiosError.response?.data?.message || defaultMessage);
};

export const gradesApi = {
  /**
   * @api GET /v1/students/me/grades/cumulative
   * @description Lấy bảng điểm tích lũy và chi tiết từng học kỳ của sinh viên hiện tại
   * @returns {Promise<CumulativeGradesResponse>} Dữ liệu bảng điểm tích lũy
   * @auth Required (Student)
   */
  async getCumulativeGrades(): Promise<CumulativeGradesResponse> {
    try {
      const response = await api.get<CumulativeGradesResponse>('/v1/students/me/grades/cumulative');
      return response.data;
    } catch (error: unknown) {
      throw createGradesError(error, 'Không thể tải dữ liệu điểm');
    }
  },

  /**
   * @api GET /v1/students/semesters/{semesterId}/grades
   * @description Lấy bảng điểm chi tiết của một học kỳ cụ thể
   * @param {string} semesterId ID của học kỳ cần lấy điểm
   * @returns {Promise<SemesterGradeResponse>} Dữ liệu điểm theo học kỳ
   * @auth Required (Student)
   */
  async getSemesterGrades(semesterId: string): Promise<SemesterGradeResponse> {
    try {
      const response = await api.get<SemesterGradeResponse>(`/v1/students/semesters/${semesterId}/grades`);
      return response.data;
    } catch (error: unknown) {
      throw createGradesError(error, 'Không thể tải dữ liệu điểm học kỳ');
    }
  },

  /**
   * @api GET /v1/student/transcript/pdf
   * @description Xuất bảng điểm của sinh viên ra file PDF
   * @returns {Promise<Blob>} File PDF bảng điểm
   * @auth Required (Student)
   */
  async exportTranscriptPdf(): Promise<Blob> {
    try {
      const response = await api.get('/v1/student/transcript/pdf', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: unknown) {
      throw createGradesError(error, 'Không thể xuất file PDF');
    }
  },
};

