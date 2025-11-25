export const EXAMS_API = {
  GET_EXAM_ENTRIES: '/v1/instructor/exam-entries',
  GET_EXAM_ENTRY_DETAIL: (examEntryId: string) => `/v1/instructor/exam-entries/${examEntryId}`,
  UPLOAD_EXAM_ENTRY: '/v1/instructor/exam-entries',
  UPDATE_EXAM_ENTRY: (examEntryId: string) => `/v1/instructor/exam-entries/${examEntryId}`,
} as const;

export const EXAM_TYPE_LABELS: Record<string, string> = {
  midterm: 'Giữa kỳ',
  final: 'Cuối kỳ',
  quiz: '15 phút',
  makeup: 'Thi lại',
};

export const ENTRY_STATUS_LABELS: Record<string, string> = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
};

export const ENTRY_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export const SEARCH_DEBOUNCE_MS = 500;
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;

