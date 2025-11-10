export const GRADE_STATUS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'PendingApproval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export const GRADE_STATUS_LABELS: Record<string, string> = {
  Draft: 'Bản nháp',
  PendingApproval: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
};

export const GRADE_STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  PendingApproval: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export const GRADE_WEIGHTS = {
  ATTENDANCE: 0.2,
  MIDTERM: 0.3,
  FINAL: 0.5,
} as const;

export const GRADE_RANGE = {
  MIN: 0,
  MAX: 10,
} as const;

export const GRADE_ACTION_LABELS: Record<string, string> = {
  Submitted: 'Gửi duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
  Updated: 'Cập nhật điểm',
  Created: 'Tạo bản nháp',
  BulkUpdated: 'Cập nhật hàng loạt',
  Edited: 'Chỉnh sửa',
};

export const GRADE_ACTION_COLORS: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Updated: 'bg-gray-100 text-gray-700',
  Created: 'bg-purple-100 text-purple-700',
  BulkUpdated: 'bg-indigo-100 text-indigo-700',
  Edited: 'bg-gray-100 text-gray-700',
};