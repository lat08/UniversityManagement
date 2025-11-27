import { api } from './client';
import type {
  TuitionDebtResponse,
  TuitionDebtFilter,
  StudentDebtByCode,
  UpdateTuitionRequest,
  CreateReminderRequest,
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
): Promise<StudentDebtByCode> => {
  const response = await api.get<StudentDebtByCode>(
    `/v1/student-debt/${encodeURIComponent(studentCode)}/detail`,
  );
  return response.data;
};

/**
 * @api PUT /v1/student-debt/{studentCode}/update
 * @description Cập nhật thông tin học phí của sinh viên (trạng thái, ghi chú)
 * @param studentCode - Mã sinh viên
 * @param data - Dữ liệu cập nhật (status, notes)
 * @returns void
 * @auth Required (Admin, Admin_Accountant, Admin_HR)
 */
export const updateTuition = async (
  studentCode: string,
  data: UpdateTuitionRequest,
): Promise<void> => {
  await api.put(`/v1/student-debt/${encodeURIComponent(studentCode)}/update`, data);
};

/**
 * @api POST /v1/student-debt/{studentCode}/reminder
 * @description Tạo và gửi nhắc nhở đóng học phí cho sinh viên
 * @param studentCode - Mã sinh viên
 * @param data - Dữ liệu nhắc nhở (title, content)
 * @returns void
 * @auth Required (Admin, Admin_Accountant, Admin_HR)
 */
export const createReminder = async (
  studentCode: string,
  data: CreateReminderRequest,
): Promise<void> => {
  await api.post(`/v1/student-debt/${encodeURIComponent(studentCode)}/reminder`, data);
};

/**
 * @api DELETE /v1/student-debt/{studentCode}
 * @description Xóa thông tin công nợ học phí của sinh viên
 * @param studentCode - Mã sinh viên
 * @returns void
 * @auth Required (Admin, Admin_Accountant, Admin_HR)
 */
export const deleteTuition = async (studentCode: string): Promise<void> => {
  await api.delete(`/v1/student-debt/${encodeURIComponent(studentCode)}`);
};

export const tuitionApi = {
  getTuitionDebts,
  getStudentDebtByCode,
  updateTuition,
  createReminder,
  deleteTuition,
};

