export interface LeaveRequest {
  requestId: string;
  requestCode: string;
  instructorId: string;
  instructorName: string;
  courseClassId: string;
  courseClassCode: string;
  subjectName: string;
  cancelDate: string; // ISO date string - ngày hủy (lịch hiện tại)
  cancelStartPeriod: number; // Tiết bắt đầu của lịch hiện tại
  cancelEndPeriod: number; // Tiết kết thúc của lịch hiện tại
  oldRoomCode: string; // Mã phòng của lịch hiện tại
  makeUpDate: string; // ISO date string - ngày dạy bù đề xuất (lịch đề xuất)
  startPeriod: number; // Tiết bắt đầu của lịch đề xuất
  endPeriod: number; // Tiết kết thúc của lịch đề xuất
  makeUpRoomCode: string; // Mã phòng của lịch đề xuất
  totalPeriods: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string; // ISO date string
  makeup?: MakeupAssignment;
}

export interface MakeupAssignment {
  instructorId: string;
  instructorName: string;
  makeupDate: string; // ISO date string - ngày dạy bù đã được duyệt
  startPeriod: number;
  endPeriod: number;
  roomId: string;
  roomName: string;
}

export interface LeaveRequestsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  deleted?: number;
}

export interface LeaveRequestsResponse {
  page: {
    items: LeaveRequest[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  stats: LeaveRequestsStats;
}

export interface LeaveRequestsSearchParams {
  searchTerm?: string;
  status?: string; // 'pending' | 'approved' | 'rejected' | 'all'
  subjectId?: string;
  courseClassId?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  pageNumber?: number;
  pageSize?: number;
}

export interface ApproveAndAssignPayload {
  makeupDate: string; // ISO date string
  startPeriod: number;
  endPeriod: number;
  roomId: string;
  reviewNote?: string;
}

export interface RejectPayload {
  reason: string; // max 500 chars
}

export interface RevertPayload {
  reason?: string; // Optional reason for reverting
}

export interface AvailabilityQuery {
  makeupDate: string; // ISO date string
  startPeriod: number;
  endPeriod: number;
}

export interface AvailableInstructor {
  instructorId: string;
  instructorName: string;
  weeklyLoad: number;
}

export interface AvailableRoom {
  roomId: string;
  roomName: string;
  capacity: number;
}

export interface AvailabilityResult {
  instructors: AvailableInstructor[];
  rooms: AvailableRoom[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
];

export const getStatusDisplay = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ duyệt', color: 'bg-orange-100 text-orange-700' },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[statusLower] || { label: status || 'Không xác định', color: 'bg-gray-100 text-gray-700' };
};

// Class periods mapping
export const CLASS_PERIODS = [
  { period: 1, startTime: '07:15', endTime: '08:05', label: 'Tiết 1' },
  { period: 2, startTime: '08:10', endTime: '09:00', label: 'Tiết 2' },
  { period: 3, startTime: '09:10', endTime: '10:00', label: 'Tiết 3' },
  { period: 4, startTime: '10:05', endTime: '10:55', label: 'Tiết 4' },
  { period: 5, startTime: '11:00', endTime: '11:50', label: 'Tiết 5' },
  { period: 6, startTime: '13:30', endTime: '14:20', label: 'Tiết 6' },
  { period: 7, startTime: '14:25', endTime: '15:15', label: 'Tiết 7' },
  { period: 8, startTime: '15:20', endTime: '16:10', label: 'Tiết 8' },
  { period: 9, startTime: '16:15', endTime: '17:05', label: 'Tiết 9' },
  { period: 10, startTime: '17:10', endTime: '18:00', label: 'Tiết 10' },
  { period: 11, startTime: '18:05', endTime: '18:55', label: 'Tiết 11' },
  { period: 12, startTime: '19:00', endTime: '19:50', label: 'Tiết 12' },
  { period: 13, startTime: '19:55', endTime: '20:45', label: 'Tiết 13' },
];

export const getPeriodLabel = (startPeriod: number, endPeriod: number): string => {
  if (startPeriod === endPeriod) {
    return `Tiết ${startPeriod}`;
  }
  return `Tiết ${startPeriod}-${endPeriod}`;
};

export const getPeriodTimeRange = (startPeriod: number, endPeriod: number): string => {
  const startPeriodData = CLASS_PERIODS.find(p => p.period === startPeriod);
  const endPeriodData = CLASS_PERIODS.find(p => p.period === endPeriod);
  
  if (startPeriodData && endPeriodData) {
    return `${startPeriodData.startTime} - ${endPeriodData.endTime}`;
  }
  return '';
};

