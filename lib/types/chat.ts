// Chat response types
export type ChatResponseType = 'text' | 'grade_info' | 'schedule' | 'exam_schedule' | 'course_list' | 'course_materials';

export interface BaseResponse {
  type: ChatResponseType;
  text: string; // Fallback text
}

export interface GradeInfoData {
  gpa: number;
  totalCredits: number;
  semester?: string;
}

export interface GradeInfoResponse extends BaseResponse {
  type: 'grade_info';
  data: GradeInfoData;
}

export interface ScheduleItem {
  dayOfWeek: string; // Thứ 2, Thứ 3, etc.
  date: string;
  period: string; // Tiết 1-5
  courseName: string;
  courseCode: string;
  room: string;
  instructor: string;
}

export interface ScheduleResponse extends BaseResponse {
  type: 'schedule';
  data: {
    weekNumber: number;
    dateRange: string;
    items: ScheduleItem[];
  };
}

export interface TextResponse extends BaseResponse {
  type: 'text';
}

export interface ExamItem {
  courseName: string;
  courseCode: string;
  date: string; // "Thứ Tư, 17/12/2025"
  time: string; // "00:00–02:00"
  duration: number; // minutes
  room: string;
  format: string; // "Thực hành", "Vấn đáp", "Trắc nghiệm"
  status: string; // "Chưa tới", "Đã thi"
}

export interface ExamScheduleResponse extends BaseResponse {
  type: 'exam_schedule';
  data: {
    items: ExamItem[];
  };
}

export interface CourseMaterialDocument {
  documentId: string;
  fileTitle: string;
  fileType: string;
  fileSize: number;
  fileSizeMb?: string;
  description: string;
  documentType: string;
  filePath: string;
  previewUrl: string;
  downloadUrl: string;
  created: string;
}

export interface CourseMaterial {
  courseClassId: string;
  courseName: string;
  uploadedById: string;
  uploadedByName: string;
  documents: CourseMaterialDocument[];
}

export interface CourseMaterialsResponse extends BaseResponse {
  type: 'course_materials';
  data: CourseMaterial[];
}

export type ChatResponse = TextResponse | GradeInfoResponse | ScheduleResponse | ExamScheduleResponse | CourseMaterialsResponse;
