import { ApiResponse } from '@/lib/types/common';

export type ExamStatus = 'pending' | 'approved' | 'rejected';

export type ExamType =
  | 'midterm'
  | 'final'
  | 'quiz'
  | 'makeup'
  | string;

export interface AdminExamQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  semesterId?: string;
  subjectId?: string;
  examType?: ExamType;
  status?: ExamStatus;
  delivery?: string;
}

export interface AdminExamRecord {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  courseClassId: string;
  courseClassCode: string;
  courseClassName?: string;
  semesterId: string;
  semesterName: string;
  instructorId?: string;
  instructorName?: string;
  examType: ExamType;
  status: ExamStatus;
  submissionDate?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminExamDetail extends AdminExamRecord {
  entryCode?: string;
  durationMinutes?: number | null;
  questionFilePath?: string | null;
  answerFilePath?: string | null;
  reviewNote?: string | null;
  reviewerName?: string;
}

export interface PagingMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminExamListPayload {
  data: AdminExamRecord[];
  paging: PagingMetadata;
}

export type AdminExamListResponse = ApiResponse<AdminExamListPayload>;

export type AdminExamDetailResponse = ApiResponse<AdminExamDetail>;

export interface ApproveExamRequest {
  note?: string;
}

export type ApproveExamResponse = ApiResponse<AdminExamDetail>;

export interface RejectExamRequest {
  reason: string;
  note?: string;
}

export type RejectExamResponse = ApiResponse<AdminExamDetail>;
