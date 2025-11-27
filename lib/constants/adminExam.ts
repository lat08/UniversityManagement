export const ADMIN_EXAM_API = {
  GET_EXAMS: '/v1/admin/exams',
  GET_EXAM_DETAIL: (id: string) => `/v1/admin/exams/${id}`,
  APPROVE_EXAM: (id: string) => `/v1/admin/exams/${id}/approve`,
  REJECT_EXAM: (id: string) => `/v1/admin/exams/${id}/reject`,
  EXPORT_EXAMS: '/v1/admin/exams/export',
  EXPORT_EXAM_PDF: (id: string, type: 'exam' | 'answer') => `/v1/admin/exams/${id}/export-pdf/${type}`,
} as const;

export const EXAM_TYPE_OPTIONS = [
  { value: 'midterm', label: 'Giữa kỳ' },
  { value: 'final', label: 'Cuối kỳ' },
  { value: 'quiz', label: '15 phút' },
  { value: 'makeup', label: 'Thi lại' },
] as const;

export const EXAM_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
] as const;

export const EXAM_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export const EXAM_TYPE_LABELS: Record<string, string> = {
  midterm: 'Giữa kỳ',
  final: 'Cuối kỳ',
  quiz: '15 phút',
  makeup: 'Thi lại',
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;






