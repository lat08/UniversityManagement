import { api } from '@/lib/api/client';
import type {
  LeaveRequest,
  LeaveRequestsResponse,
  LeaveRequestsSearchParams,
  ApproveAndAssignPayload,
  RejectPayload,
  RevertPayload,
  UpdateScheduleChangePayload,
  AvailabilityQuery,
  AvailabilityResult,
  AvailableRoom,
  AvailableInstructor,
  ApiResponse,
} from '../types/types';

interface AdminScheduleChangeItemDto {
  scheduleChangeId: string;
  courseClassId: string;
  courseClassCode: string;
  subjectName: string;
  subjectCode: string;
  instructorName: string;
  cancelledWeek: number;
  makeupWeek?: number | null;
  makeupDate?: string | null;
  makeupRoomCode?: string | null;
  makeupRoomName?: string | null;
  dayOfWeek: number;
  dayOfWeekText?: string | null;
  startPeriod: number;
  endPeriod: number;
  currentRoomCode?: string | null;
  currentRoomName?: string | null;
  reason?: string | null;
  status: string;
  createdAt: string;
}

interface AdminScheduleChangeResultDto {
  items: AdminScheduleChangeItemDto[];
  totalCount: number; // Tổng số đơn trong hệ thống (không filter)
  filteredCount?: number; // Số đơn sau khi filter (dùng cho phân trang)
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

const buildRequestCode = (id: string, fallback: string) => {
  if (!id) return fallback;
  return `SC-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
};

const mapStatus = (status?: string): 'pending' | 'approved' | 'rejected' => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'approved' || normalized === 'rejected') {
    return normalized;
  }
  return 'pending';
};

const fallbackDayOfWeekText = (dayOfWeek: number) => {
  const map: Record<number, string> = {
    2: 'Thứ 2',
    3: 'Thứ 3',
    4: 'Thứ 4',
    5: 'Thứ 5',
    6: 'Thứ 6',
    7: 'Thứ 7',
    8: 'Chủ nhật',
  };
  return map[dayOfWeek] || `Thứ ${dayOfWeek}`;
};

export const scheduleChangeApi = {
  // GET /v1/admin/schedule-changes - Search with pagination and stats
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

    const response = await api.get<ApiResponse<AdminScheduleChangeResultDto>>('/v1/admin/schedule-changes', {
      params: queryParams,
    });

    if (response.data.success && response.data.data) {
      const data = response.data.data;
      const items: LeaveRequest[] = (data.items || []).map((item) => ({
        requestId: item.scheduleChangeId,
        requestCode: buildRequestCode(item.scheduleChangeId, item.courseClassCode),
        courseClassId: item.courseClassId,
        courseClassCode: item.courseClassCode,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode,
        instructorName: item.instructorName,
        cancelledWeek: item.cancelledWeek,
        makeupWeek: item.makeupWeek ?? null,
        dayOfWeek: item.dayOfWeek,
        dayOfWeekText: item.dayOfWeekText || fallbackDayOfWeekText(item.dayOfWeek),
        startPeriod: item.startPeriod,
        endPeriod: item.endPeriod,
        makeUpDate: item.makeupDate || null,
        makeUpRoomCode: item.makeupRoomCode || null,
        makeUpRoomName: item.makeupRoomName || null,
        currentRoomCode: item.currentRoomCode || null,
        currentRoomName: item.currentRoomName || null,
        reason: item.reason || '',
        status: mapStatus(item.status),
        createdAt: item.createdAt,
        makeup: null,
      }));

      return {
        page: {
          items,
          // Dùng filteredCount cho phân trang (số đơn sau khi filter)
          totalCount: data.filteredCount ?? data.totalCount,
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
        },
        stats: {
          // Dùng totalCount cho stats (tổng số đơn trong hệ thống, không filter)
          total: data.totalCount,
          pending: data.pendingCount,
          approved: data.approvedCount,
          rejected: data.rejectedCount,
        },
      };
    }
    throw new Error(response.data.message || 'Không thể tải danh sách yêu cầu');
  },

  // GET /v1/admin/schedule-changes/{id}/availability - Get available rooms and instructors
  getAvailability: async (id: string, query: AvailabilityQuery): Promise<AvailabilityResult> => {
    const queryParams: Record<string, string | number> = {
      makeupDate: query.makeupDate,
      startPeriod: query.startPeriod,
      endPeriod: query.endPeriod,
    };

    const response = await api.get<ApiResponse<AvailabilityResult>>(
      `/v1/admin/schedule-changes/${id}/availability`,
      { params: queryParams }
    );

    if (response.data.success && response.data.data) {
      const data = response.data.data as AvailabilityResult & {
        Rooms?: AvailableRoom[];
        Instructors?: AvailableInstructor[];
      };
      const roomsSource = Array.isArray(data.rooms)
        ? data.rooms
        : Array.isArray(data.Rooms)
          ? data.Rooms
          : [];
      const instructorsSource = Array.isArray(data.instructors)
        ? data.instructors
        : Array.isArray(data.Instructors)
          ? data.Instructors
          : [];

      const rooms = roomsSource.map((room: AvailableRoom | { RoomId?: string; RoomName?: string; Capacity?: number }) => ({
        roomId: 'roomId' in room ? room.roomId : room.RoomId || '',
        roomName: 'roomName' in room ? room.roomName : room.RoomName || '',
        capacity: 'capacity' in room ? room.capacity : room.Capacity ?? 0,
      }));

      const instructors = instructorsSource.map((ins: AvailableInstructor | { InstructorId?: string; InstructorName?: string; FullName?: string; WeeklyLoad?: number }) => ({
        instructorId: 'instructorId' in ins ? ins.instructorId : ins.InstructorId || '',
        instructorName: 'instructorName' in ins ? ins.instructorName : ins.InstructorName || ins.FullName || '',
        weeklyLoad: 'weeklyLoad' in ins ? ins.weeklyLoad : ins.WeeklyLoad ?? 0,
      }));

      return {
        rooms,
        instructors,
      };
    }
    throw new Error(response.data.message || 'Không thể lấy thông tin khả dụng');
  },

  // POST /v1/admin/schedule-changes/{id}/approve - Approve and assign makeup class
  approve: async (id: string, payload: ApproveAndAssignPayload): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/v1/admin/schedule-changes/${id}/approve`,
      payload
    );
    return response.data;
  },

  // POST /v1/admin/schedule-changes/{id}/reject - Reject request
  reject: async (id: string, payload: RejectPayload): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/v1/admin/schedule-changes/${id}/reject`,
      payload
    );
    return response.data;
  },

  // POST /v1/admin/schedule-changes/{id}/revert - Revert request back to pending
  revert: async (id: string, payload: RevertPayload): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(
      `/v1/admin/schedule-changes/${id}/revert`,
      payload
    );
    return response.data;
  },

  // PUT /v1/admin/schedule-changes/{id} - Update schedule change request
  update: async (id: string, payload: UpdateScheduleChangePayload): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(
      `/v1/admin/schedule-changes/${id}`,
      payload
    );
    return response.data;
  },

  // GET /v1/admin/schedule-changes/export - Export requests
  export: async (params: LeaveRequestsSearchParams, format: 'csv' | 'xlsx' = 'xlsx'): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.status) queryParams.append('status', params.status);
    if (params.subjectId) queryParams.append('subjectId', String(params.subjectId));
    if (params.courseClassId) queryParams.append('courseClassId', String(params.courseClassId));
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    queryParams.append('format', format);

    try {
    const response = await api.get(
      `/v1/admin/schedule-changes/export?${queryParams.toString()}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
    } catch (error) {
      const apiError = error as { response?: { data?: Blob; status?: number }; message?: string };
      // If error response is a blob (file), try to read it as text
      if (apiError.response?.data instanceof Blob) {
        const text = await apiError.response.data.text();
        try {
          const jsonError = JSON.parse(text);
          throw new Error(jsonError.message || 'Xuất file thất bại');
        } catch {
          throw new Error('Xuất file thất bại');
        }
      }
      throw error;
    }
  },
};

