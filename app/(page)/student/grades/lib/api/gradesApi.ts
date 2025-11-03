import { api } from '@/lib/api/client'
import { CumulativeGradesResponse, SemesterGradeResponse, GradesStatsResponse } from '../types/types'
import { commonApi } from '@/lib/api'

export const gradesApi = {
  /**
   * Lấy bảng điểm chi tiết theo tất cả học kì và điểm tích lũy của sinh viên
   */
  getCumulativeGrades: async (): Promise<CumulativeGradesResponse> => {
    try {
      const response = await api.get<CumulativeGradesResponse>('/v1/students/me/grades/cumulative')
      return response.data
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      throw new Error(axiosError.response?.data?.message || 'Không thể tải dữ liệu điểm')
    }
  },

  /**
   * Lấy bảng điểm chi tiết của sinh viên trong một học kỳ
   * @param semesterId - ID của học kỳ
   */
  getSemesterGrades: async (semesterId: string): Promise<SemesterGradeResponse> => {
    try {
      const response = await api.get<SemesterGradeResponse>(`/v1/students/me/semesters/${semesterId}/grades`)
      return response.data
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      throw new Error(axiosError.response?.data?.message || 'Không thể tải dữ liệu điểm học kỳ')
    }
  },

  /**
   * Xuất bảng điểm ra file PDF
   */
  exportTranscriptPdf: async (): Promise<Blob> => {
    try {
      const response = await api.get('/v1/student/transcript/pdf', {
        responseType: 'blob',
      })
      return response.data
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      throw new Error('Không thể xuất file PDF')
    }
  },

  /**
   * Lấy thống kê học tập tổng quan
   */
  getGradesStats: async (): Promise<GradesStatsResponse> => {
    try {
      const response = await api.get<GradesStatsResponse>('/v1/students/me/grades/stats')
      return response.data
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      throw new Error(axiosError.response?.data?.message || 'Không thể tải thống kê học tập')
    }
  },

  getCommonSemesters: async () => {
    return commonApi.getSemesters()
  },
}