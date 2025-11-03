export interface ExamEntry {
  examEntryId: string;
  examId: string;
  courseClassId: string;
  examType: 'midterm' | 'final' | 'quiz';
  subjectName: string;
  courseClassCode: string;
  displayName: string;
  durationMinutes: number;
  entryStatus: 'approved' | 'pending' | 'rejected';
  rejectionReason: string | null;
  entryCode: string | null;
  isPicked: boolean;
  createdAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
}

export interface ExamEntryDetail extends ExamEntry {
  subjectCode: string;
  courseClassName: string;
  semesterName: string;
  questionFilePath?: string;
  answerFilePath?: string;
  updatedAt: string | null;
  description?: string;
}

export interface GetExamEntriesResponse {
  success: boolean;
  message: string;
  data: {
    items: ExamEntry[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  errors: string[] | null;
}

export interface GetExamEntryDetailResponse {
  success: boolean;
  message: string;
  data: ExamEntryDetail;
  errors: string[] | null;
}

export interface UploadExamRequest {
  courseClassId: string;
  examType: 'midterm' | 'final' | 'quiz';
  durationMinutes: number;
  description: string;
  questionFile: File;
  answerFile: File;
}

export interface UploadExamResponse {
  success: boolean;
  message: string;
  data: {
    examEntryId: string;
  };
  errors: string[] | null;
}

export interface UpdateExamRequest {
  durationMinutes?: number;
  description?: string;
  questionFile?: File;
  answerFile?: File;
}

export interface UpdateExamResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
  };
  errors: string[] | null;
}

export interface GetExamEntriesParams {
  semesterId?: string;
  subjectId?: string;
  status?: string;
  examType?: string;
  searchKeyword?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CourseClass {
  courseClassId: string;
  courseClassCode: string;
  courseClassName: string;
  subjectName: string;
  subjectCode: string;
}

