// Exam Entry Types based on API response
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

// API Response Types
export interface GetExamEntriesResponse {
  success: boolean;
  message: string;
  data: ExamEntry[];
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

// Filter and Search Types
export interface GetExamEntriesParams {
  searchTerm?: string;
  examType?: string;
  entryStatus?: string;
  semesterId?: string;
  subjectId?: string;
}

// Course Class for dropdown
export interface CourseClass {
  courseClassId: string;
  courseClassCode: string;
  courseClassName: string;
  subjectName: string;
  subjectCode: string;
}

