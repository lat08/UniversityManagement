export interface InstructorCourseClassDto {
  courseClassId: string;
  courseCode: string;
  courseName: string;
  className: string;
  semesterName: string;
  totalStudents: number;
  studentsWithGrades: number;
  status: string;
  isDraftEditable: boolean;
}

export interface InstructorGradeDto {
  enrollmentId: string;
  mssv: string;
  fullName: string;
  attendanceGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  averageGrade: number | null;
  previousAttendanceGrade: number | null;
  previousMidtermGrade: number | null;
  previousFinalGrade: number | null;
  note: string | null;
  className: string | null;
  classId: string | null;
  academicYearName: string | null;
  academicYearId: string | null;
}

export interface CourseClassGradesDto {
  courseClassId: string;
  courseCode: string;
  courseName: string;
  className: string;
  totalStudents: number;
  students: InstructorGradeDto[];
  canEditGrades: boolean;
  noOfficialGradeYet: boolean;
  versionNumber: number;
  versionStatus: GradeStatusType;
  approvedAt: string | null;
}

export interface UpdateStudentGradeDto {
  enrollmentId: string;
  attendanceGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  note?: string | null;
}

export type GradeActionType = 
  | 'Submitted' 
  | 'Approved' 
  | 'Rejected' 
  | 'Updated' 
  | 'Created' 
  | 'BulkUpdated' 
  | 'Edited';

export interface GradeChangeHistoryDto {
  changeId: string;
  action: GradeActionType;
  actorName: string;
  changeDate: string;
  note: string | null;
}

export interface GradeVersionDetailDto {
  gradeVersionId: string;
  versionNumber: number;
  versionStatus: GradeStatusType;
  submittedBy: string | null;
  submittedAt: string | null;
  submissionNote: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  approvalNote: string | null;
  courseClassId: string;
  courseCode: string;
  courseName: string;
  className: string;
  totalStudents: number;
  students: InstructorGradeDto[];
}

export type GradeStatusType = 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected';

export type CourseClassIdGuid = string & { __brand: 'CourseClassIdGuid' };
export type EnrollmentIdGuid = string & { __brand: 'EnrollmentIdGuid' };

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}