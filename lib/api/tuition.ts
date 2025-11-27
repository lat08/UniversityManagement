import { api } from './client';
import type {
  TuitionDebtResponse,
  TuitionDebtFilter,
  StudentDebtByCode,
  ApiResponse,
} from '@/lib/types';

/**
 * @api GET /v1/student-debt/tuitions
 * @description Lấy danh sách công nợ học phí sinh viên với phân trang và filter
 * @param filter - Bộ lọc tìm kiếm (semesterId, search, classId, departmentId, status, pageNumber, pageSize)
 * @returns TuitionDebtResponse - Danh sách công nợ với thống kê
 * @auth Required (Admin, Admin_Accountant, Admin_HR)
 */
export const getTuitionDebts = async (
  filter: TuitionDebtFilter,
): Promise<TuitionDebtResponse> => {
  const params: Record<string, string | number> = {};
  
  // Only add semesterId if provided (empty string means all semesters)
  if (filter.semesterId && filter.semesterId.trim() !== '') {
    params.semesterId = filter.semesterId;
  }
  if (filter.search) {
    params.search = filter.search;
  }
  if (filter.classId) {
    params.classId = filter.classId;
  }
  if (filter.departmentId) {
    params.departmentId = filter.departmentId;
  }
  if (filter.status && filter.status !== 'all') {
    params.status = filter.status;
  }
  if (filter.pageNumber) {
    params.pageNumber = filter.pageNumber;
  }
  if (filter.pageSize) {
    params.pageSize = filter.pageSize;
  }

  // Controller returns TuitionDebtResponseDto directly (not wrapped in ApiResponse)
  // Axios wraps it in response.data, so we get: { statistics: {...}, data: {...} }
  const response = await api.get<TuitionDebtResponse>(
    '/v1/student-debt/tuitions',
    { params },
  );
  return response.data;
};

/**
 * @api GET /v1/student-debt/{studentCode}/detail
 * @description Lấy chi tiết công nợ học phí của sinh viên theo mã (tất cả học kỳ)
 * @param studentCode - Mã sinh viên (VD: SV001)
 * @returns StudentDebtByCode - Chi tiết công nợ học phí chia theo học kỳ
 * @auth Required (Admin, Admin_Accountant, Admin_HR)
 */
export const getStudentDebtByCode = async (
  studentCode: string,
): Promise<ApiResponse<StudentDebtByCode>> => {
  const response = await api.get<ApiResponse<StudentDebtByCode>>(
    `/v1/student-debt/${encodeURIComponent(studentCode)}/detail`,
  );
  return response.data;
};

export const tuitionApi = {
  getTuitionDebts,
  getStudentDebtByCode,
};

