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
  versionStatus: string;
  approvedAt: string | null;
}

export interface UpdateStudentGradeDto {
  enrollmentId: string;
  attendanceGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
}

export interface GradeChangeHistoryDto {
  changeId: string;
  action: string;
  actorName: string;
  changeDate: string;
  note: string | null;
}

export interface GradeVersionDetailDto {
  gradeVersionId: string;
  versionNumber: number;
  versionStatus: string;
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}