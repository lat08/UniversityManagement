export type NotificationType = 'event' | 'tuition' | 'schedule' | 'important';
export type TargetType = 'all' | 'all_students' | 'all_instructors' | 'faculty' | 'department' | 'class' | 'instructor' | 'student';
export type SendingMethod = 'System' | 'Email' | 'Both';
export type NotificationStatus = 'pending' | 'sent' | 'cancelled';

export type TranslateFn = (key: string, values?: Record<string, unknown>) => string;

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

const DEFAULT_UNKNOWN_KEY = 'general.unknown';

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'event', labelKey: 'options.notificationTypes.event' },
  { value: 'tuition', labelKey: 'options.notificationTypes.tuition' },
  { value: 'schedule', labelKey: 'options.notificationTypes.schedule' },
  { value: 'important', labelKey: 'options.notificationTypes.important' },
] as const;

export const TARGET_TYPE_OPTIONS = [
  { value: 'all', labelKey: 'options.targetTypes.all' },
  { value: 'all_students', labelKey: 'options.targetTypes.allStudents' },
  { value: 'all_instructors', labelKey: 'options.targetTypes.allInstructors' },
  { value: 'faculty', labelKey: 'options.targetTypes.faculty' },
  { value: 'department', labelKey: 'options.targetTypes.department' },
  { value: 'class', labelKey: 'options.targetTypes.class' },
  { value: 'instructor', labelKey: 'options.targetTypes.instructor' },
  { value: 'student', labelKey: 'options.targetTypes.student' },
] as const;

export const SENDING_METHOD_OPTIONS = [
  { value: 'System', labelKey: 'options.sendingMethods.system' },
  { value: 'Email', labelKey: 'options.sendingMethods.email' },
  { value: 'Both', labelKey: 'options.sendingMethods.both' },
] as const;

export const STATUS_OPTIONS = [
  { value: '', labelKey: 'options.status.all' },
  { value: 'pending', labelKey: 'options.status.pending' },
  { value: 'sent', labelKey: 'options.status.sent' },
  { value: 'cancelled', labelKey: 'options.status.cancelled' },
] as const;

export const buildNotificationTypeOptions = (t: TranslateFn) =>
  NOTIFICATION_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

export const buildTargetTypeOptions = (t: TranslateFn) =>
  TARGET_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

export const buildSendingMethodOptions = (t: TranslateFn) =>
  SENDING_METHOD_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

export const buildStatusOptions = (t: TranslateFn) =>
  STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

const STATUS_DISPLAY_MAP: Record<string, { labelKey: string; color: string }> = {
  pending: { labelKey: 'options.status.pending', color: 'bg-yellow-100 text-yellow-700' },
  sent: { labelKey: 'options.status.sent', color: 'bg-green-100 text-green-700' },
  cancelled: { labelKey: 'options.status.cancelled', color: 'bg-red-100 text-red-700' },
};

export const getStatusDisplay = (status: NotificationStatus | string, t: TranslateFn) => {
  const statusLower = status?.toLowerCase() || '';
  const matchedStatus = STATUS_DISPLAY_MAP[statusLower];
  if (matchedStatus) {
    return {
      label: t(matchedStatus.labelKey),
      color: matchedStatus.color,
    };
  }
  return {
    label: typeof status === 'string' && status ? status : t(DEFAULT_UNKNOWN_KEY),
    color: 'bg-gray-100 text-gray-700',
  };
};

const NOTIFICATION_TYPE_DISPLAY_MAP: Record<string, { labelKey: string; color: string }> = {
  event: { labelKey: 'options.notificationTypes.event', color: 'bg-blue-100 text-blue-700' },
  tuition: { labelKey: 'options.notificationTypes.tuition', color: 'bg-purple-100 text-purple-700' },
  schedule: { labelKey: 'options.notificationTypes.schedule', color: 'bg-cyan-100 text-cyan-700' },
  important: { labelKey: 'options.notificationTypes.important', color: 'bg-red-100 text-red-700' },
};

export const getNotificationTypeDisplay = (type: NotificationType | string, t: TranslateFn) => {
  const typeLower = type?.toLowerCase() || '';
  const matchedType = NOTIFICATION_TYPE_DISPLAY_MAP[typeLower];
  if (matchedType) {
    return {
      label: t(matchedType.labelKey),
      color: matchedType.color,
    };
  }
  return {
    label: typeof type === 'string' && type ? type : t(DEFAULT_UNKNOWN_KEY),
    color: 'bg-gray-100 text-gray-700',
  };
};

const TARGET_TYPE_LABEL_MAP: Record<string, string> = TARGET_TYPE_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.labelKey;
  return acc;
}, {});

export const getTargetTypeDisplay = (targetType: TargetType | string, t: TranslateFn) => {
  if (targetType && TARGET_TYPE_LABEL_MAP[targetType]) {
    return t(TARGET_TYPE_LABEL_MAP[targetType]);
  }
  if (typeof targetType === 'string' && targetType.trim().length > 0) {
    return targetType;
  }
  return t(DEFAULT_UNKNOWN_KEY);
};

const SENDING_METHOD_LABEL_MAP: Record<string, string> = SENDING_METHOD_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.labelKey;
  return acc;
}, {});

export const getSendingMethodDisplay = (method: SendingMethod | string, t: TranslateFn) => {
  if (method && SENDING_METHOD_LABEL_MAP[method]) {
    return t(SENDING_METHOD_LABEL_MAP[method]);
  }
  if (typeof method === 'string' && method.trim().length > 0) {
    return method;
  }
  return t(DEFAULT_UNKNOWN_KEY);
};

// Helper to check if targetId is required for a targetType
export const requiresTargetId = (targetType: TargetType): boolean => {
  return !['all', 'all_students', 'all_instructors'].includes(targetType);
};

