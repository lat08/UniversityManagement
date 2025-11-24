import { api } from '@/lib/api/client';
import type {
  LeaveRequest,
  LeaveRequestsResponse,
  LeaveRequestsSearchParams,
  ApproveAndAssignPayload,
  RejectPayload,
  AvailabilityQuery,
  AvailabilityResult,
  ApiResponse,
} from '../types/types';

export const scheduleChangeApi = {
  // GET /v1/schedule-changes - Search with pagination and stats
  search: async (params: LeaveRequestsSearchParams = {}): Promise<LeaveRequestsResponse> => {
    const queryParams: Record<string, string | number> = {};
    
    if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
    if (params.status) queryParams.status = params.status;
    if (params.subjectId) queryParams.subjectId = params.subjectId;
    if (params.courseClassId) queryParams.courseClassId = params.courseClassId;
    if (params.dateFrom) {
      // dateFrom is already in yyyy-MM-dd format from date input
      queryParams.dateFrom = params.dateFrom;
    }
    if (params.dateTo) {
      // dateTo is already in yyyy-MM-dd format from date input
      queryParams.dateTo = params.dateTo;
    }
    if (params.pageNumber) queryParams.pageNumber = params.pageNumber;
    if (params.pageSize) queryParams.pageSize = params.pageSize;

    const response = await api.get<ApiResponse<LeaveRequestsResponse>>('/v1/schedule-changes', {
      params: queryParams,
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể tải danh sách yêu cầu');
  },

  // GET /v1/schedule-changes/{id}/availability - Get available rooms and instructors
  getAvailability: async (id: string, query: AvailabilityQuery): Promise<AvailabilityResult> => {
    const queryParams: Record<string, string | number> = {
      makeupDate: query.makeupDate,
      startPeriod: query.startPeriod,
      endPeriod: query.endPeriod,
    };

    const response = await api.get<ApiResponse<AvailabilityResult>>(
      `/v1/schedule-changes/${id}/availability`,
      { params: queryParams }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể lấy thông tin khả dụng');
  },

  // POST /v1/schedule-changes/{id}/approve - Approve and assign makeup class
  approve: async (id: string, payload: ApproveAndAssignPayload): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/v1/schedule-changes/${id}/approve`,
      payload
    );
    return response.data;
  },

  // POST /v1/schedule-changes/{id}/reject - Reject request
  reject: async (id: string, payload: RejectPayload): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/v1/schedule-changes/${id}/reject`,
      payload
    );
    return response.data;
  },

  // POST /v1/schedule-changes/{id}/revert - Revert request back to pending
  revert: async (id: string, payload: RevertPayload): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/v1/schedule-changes/${id}/revert`,
      payload
    );
    return response.data;
  },

  // POST /v1/schedule-changes/export - Export requests
  export: async (params: LeaveRequestsSearchParams, format: 'csv' | 'xlsx' = 'xlsx'): Promise<Blob> => {
    const response = await api.post(
      `/v1/schedule-changes/export?format=${format}`,
      params,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

