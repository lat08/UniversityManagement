import { api } from './client';
import {
  AdminExamQueryParams,
  AdminExamListResponse,
  AdminExamDetailResponse,
  ApproveExamRequest,
  ApproveExamResponse,
  RejectExamRequest,
  RejectExamResponse,
} from '../types/adminExam';
import { ADMIN_EXAM_API } from '../constants/adminExam';

/**
 * @api GET /v1/admin/exams
 * @description Lấy danh sách đề thi với filters và pagination
 * @param params Query parameters cho filtering và pagination
 * @returns Danh sách đề thi và thông tin pagination
 * @auth Required (Admin)
 */
export const getAdminExams = async (params?: AdminExamQueryParams): Promise<AdminExamListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params?.sortDir) {
    queryParams.append('sortDir', params.sortDir);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.semesterId) {
    queryParams.append('semesterId', params.semesterId);
  }
  if (params?.subjectId) {
    queryParams.append('subjectId', params.subjectId);
  }
  if (params?.examType) {
    queryParams.append('examType', params.examType);
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${ADMIN_EXAM_API.GET_EXAMS}?${queryString}` : ADMIN_EXAM_API.GET_EXAMS;
  
  const response = await api.get<AdminExamListResponse>(url);
  return response.data;
};

/**
 * @api GET /v1/admin/exams/{id}
 * @description Lấy chi tiết đề thi
 * @param id ID của đề thi
 * @returns Chi tiết đề thi
 * @auth Required (Admin)
 */
export const getAdminExamDetail = async (id: string): Promise<AdminExamDetailResponse> => {
  const response = await api.get<AdminExamDetailResponse>(ADMIN_EXAM_API.GET_EXAM_DETAIL(id));
  return response.data;
};

/**
 * @api POST /v1/admin/exams/{id}/approve
 * @description Duyệt đề thi
 * @param id ID của đề thi
 * @param data Dữ liệu duyệt (note tùy chọn)
 * @returns Thông tin đề thi sau khi duyệt
 * @auth Required (Admin)
 */
export const approveAdminExam = async (
  id: string,
  data?: ApproveExamRequest
): Promise<ApproveExamResponse> => {
  const response = await api.post<ApproveExamResponse>(
    ADMIN_EXAM_API.APPROVE_EXAM(id),
    data || {}
  );
  return response.data;
};

/**
 * @api POST /v1/admin/exams/{id}/reject
 * @description Từ chối đề thi
 * @param id ID của đề thi
 * @param data Dữ liệu từ chối (reason bắt buộc)
 * @returns Thông tin đề thi sau khi từ chối
 * @auth Required (Admin)
 */
export const rejectAdminExam = async (
  id: string,
  data: RejectExamRequest
): Promise<RejectExamResponse> => {
  const response = await api.post<RejectExamResponse>(
    ADMIN_EXAM_API.REJECT_EXAM(id),
    data
  );
  return response.data;
};

/**
 * @api GET /v1/admin/exams/export
 * @description Xuất danh sách đề thi ra Excel
 * @param params Query parameters giống như getAdminExams
 * @returns File Excel hoặc message nếu không có dữ liệu
 * @auth Required (Admin)
 */
export const exportAdminExams = async (params?: AdminExamQueryParams): Promise<Blob | { success: boolean; message: string }> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params?.sortDir) {
    queryParams.append('sortDir', params.sortDir);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.semesterId) {
    queryParams.append('semesterId', params.semesterId);
  }
  if (params?.subjectId) {
    queryParams.append('subjectId', params.subjectId);
  }
  if (params?.examType) {
    queryParams.append('examType', params.examType);
  }
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.delivery) {
    queryParams.append('delivery', params.delivery);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `${ADMIN_EXAM_API.EXPORT_EXAMS}?${queryString}` : ADMIN_EXAM_API.EXPORT_EXAMS;
  
  const response = await api.get(url, {
    responseType: 'blob',
  });

  // Check if response is JSON (no data message)
  const contentType = response.headers['content-type'];
  if (contentType?.includes('application/json')) {
    const text = await response.data.text();
    try {
      return JSON.parse(text) as { success: boolean; message: string };
    } catch {
      throw new Error('Không thể parse response');
    }
  }

  return response.data as Blob;
};

/**
 * @api GET /v1/admin/exams/{id}/export-pdf/{type}
 * @description Xuất file PDF đề thi hoặc đáp án
 * @param id ID của đề thi
 * @param type Loại file: 'exam' hoặc 'answer'
 * @returns File PDF hoặc DOCX (nếu không có LibreOffice)
 * @auth Required (Admin)
 */
export const exportAdminExamPdf = async (
  id: string,
  type: 'exam' | 'answer'
): Promise<Blob> => {
  const response = await api.get(ADMIN_EXAM_API.EXPORT_EXAM_PDF(id, type), {
    responseType: 'blob',
  });
  return response.data as Blob;
};






