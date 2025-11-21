import { api } from '@/lib/api/client';
import { ApiResponse } from '@/lib/types/common';
import {
  AdminBulkGradeActionRequest,
  AdminBulkGradeActionResult,
  AdminGradeApprovalList,
  AdminGradeStatistics,
  AdminGradeVersionDetail,
  ExportGradeApprovalsParams,
  GetGradeApprovalsParams,
} from '../types/types';

const sanitizeParams = (params: Record<string, string | number | undefined | null>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

/**
 * @api GET /v1/admin/grade-approvals
 * @description Retrieve paginated grade approval requests for admin review.
 * @param {GetGradeApprovalsParams} params - Filter, search, and pagination parameters.
 * @returns {Promise<AdminGradeApprovalList>} Paginated list of grade approvals.
 * @auth Required (Role: Admin)
 */
const getGradeApprovals = async (
  params: GetGradeApprovalsParams,
): Promise<AdminGradeApprovalList> => {
  const response = await api.get<ApiResponse<AdminGradeApprovalList>>('/v1/admin/grade-approvals', {
    params: sanitizeParams({
      semesterId: params.semesterId,
      subjectId: params.subjectId,
      courseClassId: params.courseClassId,
      courseId: params.courseId,
      versionStatus: params.versionStatus,
      searchKey: params.searchKey,
      facultyId: params.facultyId,
      departmentId: params.departmentId,
      instructorId: params.instructorId,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    }),
  });
  return response.data.data;
};

/**
 * @api GET /v1/admin/grade-approvals/{gradeVersionId}
 * @description Get detailed information for a specific grade version awaiting approval.
 * @param {string} gradeVersionId - Grade version identifier.
 * @returns {Promise<AdminGradeVersionDetail>} Grade version detail with student breakdown.
 * @auth Required (Role: Admin)
 */
const getGradeApprovalDetail = async (
  gradeVersionId: string,
): Promise<AdminGradeVersionDetail> => {
  const response = await api.get<ApiResponse<AdminGradeVersionDetail>>(
    `/v1/admin/grade-approvals/${gradeVersionId}`,
  );
  return response.data.data;
};

/**
 * @api GET /v1/admin/grade-approvals/statistics
 * @description Fetch aggregated grade approval statistics (total, pending, approved, rejected).
 * @returns {Promise<AdminGradeStatistics>} Statistics summary for dashboard cards.
 * @auth Required (Role: Admin)
 */
const getGradeApprovalStatistics = async (): Promise<AdminGradeStatistics> => {
  const response = await api.get<ApiResponse<AdminGradeStatistics>>(
    '/v1/admin/grade-approvals/statistics',
  );
  return response.data.data;
};

/**
 * @api POST /v1/admin/grade-approvals/approve
 * @description Approve one or multiple grade versions in bulk.
 * @param {AdminBulkGradeActionRequest} payload - Grade version ids and optional note.
 * @returns {Promise<AdminBulkGradeActionResult>} Action result with success/failure counts.
 * @auth Required (Role: Admin)
 */
const bulkApproveGrades = async (
  payload: AdminBulkGradeActionRequest,
): Promise<AdminBulkGradeActionResult> => {
  const response = await api.post<ApiResponse<AdminBulkGradeActionResult>>(
    '/v1/admin/grade-approvals/approve',
    payload,
  );
  return response.data.data;
};

/**
 * @api POST /v1/admin/grade-approvals/reject
 * @description Reject one or multiple grade versions in bulk.
 * @param {AdminBulkGradeActionRequest} payload - Grade version ids and optional rejection note.
 * @returns {Promise<AdminBulkGradeActionResult>} Action outcome with error messages (if any).
 * @auth Required (Role: Admin)
 */
const bulkRejectGrades = async (
  payload: AdminBulkGradeActionRequest,
): Promise<AdminBulkGradeActionResult> => {
  const response = await api.post<ApiResponse<AdminBulkGradeActionResult>>(
    '/v1/admin/grade-approvals/reject',
    payload,
  );
  return response.data.data;
};

/**
 * @api GET /v1/admin/grade-approvals/export
 * @description Export the filtered grade approval list into an Excel file.
 * @param {ExportGradeApprovalsParams} params - Filters applied on the main table.
 * @returns {Promise<Blob>} Excel file blob for download.
 * @auth Required (Role: Admin)
 */
const exportGradeApprovals = async (params: ExportGradeApprovalsParams): Promise<Blob> => {
  const response = await api.get('/v1/admin/grade-approvals/export', {
    params: sanitizeParams({
      semesterId: params.semesterId,
      subjectId: params.subjectId,
      courseClassId: params.courseClassId,
      courseId: params.courseId,
      versionStatus: params.versionStatus,
      searchKey: params.searchKey,
      facultyId: params.facultyId,
      departmentId: params.departmentId,
      instructorId: params.instructorId,
    }),
    responseType: 'blob',
  });
  return response.data as Blob;
};

export const gradeApprovalsApi = {
  getGradeApprovals,
  getGradeApprovalDetail,
  getGradeApprovalStatistics,
  bulkApproveGrades,
  bulkRejectGrades,
  exportGradeApprovals,
};
