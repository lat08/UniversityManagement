// API Endpoints
export const EXAMS_API = {
  GET_EXAM_ENTRIES: '/v1/instructor/exam-entries',
  GET_EXAM_ENTRY_DETAIL: (examEntryId: string) => `/v1/instructor/exam-entries/${examEntryId}`,
  UPLOAD_EXAM_ENTRY: '/v1/instructor/exam-entries',
  UPDATE_EXAM_ENTRY: (examEntryId: string) => `/v1/instructor/exam-entries/${examEntryId}`,
  DOWNLOAD_EXAM_FILE: (examEntryId: string, fileType: 'question' | 'answer') => 
    `/v1/instructor/exam-entries/${examEntryId}/download?fileType=${fileType}`,
} as const;

// Exam Type Labels
export const EXAM_TYPE_LABELS: Record<string, string> = {
  midterm: 'Giữa kỳ',
  final: 'Cuối kỳ',
  quiz: '15 phút',
};

// Entry Status Labels
export const ENTRY_STATUS_LABELS: Record<string, string> = {
  approved: 'Đã duyệt',
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
};

// Entry Status Colors
export const ENTRY_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

// Search debounce time
export const SEARCH_DEBOUNCE_MS = 500;

