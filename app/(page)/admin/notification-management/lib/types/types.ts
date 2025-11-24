export type NotificationType = 'event' | 'tuition' | 'schedule' | 'important';
export type TargetType = 'all' | 'all_students' | 'all_instructors' | 'faculty' | 'department' | 'class' | 'instructor' | 'student';
export type SendingMethod = 'System' | 'Email' | 'Both';
export type NotificationStatus = 'pending' | 'sent' | 'cancelled';

export interface Notification {
  scheduleId: string;
  title: string;
  content?: string; // Optional in list response
  noticeMessage?: string | null; // Thông báo ngắn (tùy chọn)
  notificationType?: NotificationType; // Optional in list response
  targetType: TargetType;
  targetId?: string | null; // Optional in list response
  sendingMethod: SendingMethod;
  status: NotificationStatus;
  totalRecipients: number;
  isActive?: boolean; // Optional in list response
  scheduledDate?: string | null; // Scheduled date for notification
  createdAt: string;
  updatedAt?: string; // Optional in list response
  createdBy?: string;
  targetValue?: string | null; // Display name for target (e.g., class name, faculty name)
}

export interface CreateNotificationDto {
  title: string;
  content: string;
  noticeMessage?: string | null; // Thông báo ngắn (tùy chọn, max 1000 ký tự)
  notificationType: NotificationType;
  targetType: TargetType;
  targetId: string | null;
  sendingMethod: SendingMethod;
  scheduledDate?: string | null; // Ngày lên lịch (tùy chọn, ISO string format)
}

export interface UpdateNotificationDto {
  title: string;
  content: string;
  noticeMessage?: string | null; // Thông báo ngắn (tùy chọn, max 1000 ký tự)
  notificationType: NotificationType;
  targetType: TargetType;
  targetId: string | null;
  sendingMethod: SendingMethod;
  scheduledDate?: string | null; // Ngày lên lịch (tùy chọn, ISO string format)
}

export interface NotificationHistoryFilterDto {
  searchTerm?: string;
  targetType?: 'all' | 'student' | 'instructor';
  status?: NotificationStatus;
  notificationType?: NotificationType | string;
  sendingMethod?: SendingMethod | string;
  startDate?: string;
  endDate?: string;
  facultyId?: string;
  departmentId?: string;
  classId?: string;
  instructorId?: string;
  studentId?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationStatistics {
  totalNotifications: number;
  pendingNotifications: number;
  sentNotifications: number;
  cancelledNotifications: number;
}

export interface NotificationHistoryResponse {
  paginatedResult: PagedResult<Notification[]>;
  statistics: NotificationStatistics;
}

// Support both response formats
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  isSuccess?: boolean;
  resultMessage?: string;
  httpStatus?: number;
  errorCode?: string;
  data: T;
  errors?: string[];
}

export interface NotificationStats {
  totalNotifications: number;
  pendingNotifications: number;
  sentNotifications: number;
  cancelledNotifications: number;
}

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'event', label: 'Sự kiện' },
  { value: 'tuition', label: 'Học phí' },
  { value: 'schedule', label: 'Lịch học' },
  { value: 'important', label: 'Quan trọng' },
] as const;

export const TARGET_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả người dùng' },
  { value: 'all_students', label: 'Tất cả sinh viên' },
  { value: 'all_instructors', label: 'Tất cả giảng viên' },
  { value: 'faculty', label: 'Khoa/Viện' },
  { value: 'department', label: 'Bộ môn' },
  { value: 'class', label: 'Lớp học' },
  { value: 'instructor', label: 'Giảng viên' },
  { value: 'student', label: 'Sinh viên' },
] as const;

export const SENDING_METHOD_OPTIONS = [
  { value: 'System', label: 'Hệ thống' },
  { value: 'Email', label: 'Email' },
  { value: 'Both', label: 'Cả hai' },
] as const;

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Đang chờ' },
  { value: 'sent', label: 'Đã gửi' },
  { value: 'cancelled', label: 'Đã hủy' },
] as const;

export const getStatusDisplay = (status: NotificationStatus | string) => {
  const statusLower = status?.toLowerCase() || '';
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Đang chờ', color: 'bg-yellow-100 text-yellow-700' },
    sent: { label: 'Đã gửi', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[statusLower] || { label: status || 'Không xác định', color: 'bg-gray-100 text-gray-700' };
};

export const getNotificationTypeDisplay = (type: NotificationType | string) => {
  const typeLower = type?.toLowerCase() || '';
  const typeMap: Record<string, { label: string; color: string }> = {
    event: { label: 'Sự kiện', color: 'bg-blue-100 text-blue-700' },
    tuition: { label: 'Học phí', color: 'bg-purple-100 text-purple-700' },
    schedule: { label: 'Lịch học', color: 'bg-cyan-100 text-cyan-700' },
    important: { label: 'Quan trọng', color: 'bg-red-100 text-red-700' },
  };
  return typeMap[typeLower] || { label: type || 'Không xác định', color: 'bg-gray-100 text-gray-700' };
};

export const getTargetTypeDisplay = (targetType: TargetType | string) => {
  const targetMap: Record<string, string> = {
    all: 'Tất cả người dùng',
    all_students: 'Tất cả sinh viên',
    all_instructors: 'Tất cả giảng viên',
    faculty: 'Khoa/Viện',
    department: 'Bộ môn',
    class: 'Lớp học',
    instructor: 'Giảng viên',
    student: 'Sinh viên',
  };
  return targetMap[targetType] || targetType || 'Không xác định';
};

export const getSendingMethodDisplay = (method: SendingMethod | string) => {
  const methodMap: Record<string, string> = {
    System: 'Hệ thống',
    Email: 'Email',
    Both: 'Cả hai',
  };
  return methodMap[method] || method || 'Không xác định';
};

// Helper to check if targetId is required for a targetType
export const requiresTargetId = (targetType: TargetType): boolean => {
  return !['all', 'all_students', 'all_instructors'].includes(targetType);
};

