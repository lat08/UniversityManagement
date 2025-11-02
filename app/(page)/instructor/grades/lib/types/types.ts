export interface Semester {
  semesterId: string;
  semesterName: string;
  year: number;
  startDate: string;
  endDate: string;
}

export interface CourseClass {
  courseClassId: string;
  courseCode: string;
  courseName: string;
  className: string;
  semesterName: string;
  totalStudents: number;
  studentsWithGrades: number;
  status: string;
}

export interface StudentGrade {
  enrollmentId: string;
  mssv: string;
  fullName: string;
  attendanceGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
  averageGrade: number | null;
  note: string | null;
}

export interface CourseClassGrades {
  courseClassId: string;
  courseCode: string;
  courseName: string;
  className: string;
  totalStudents: number;
  canEditGrades: boolean;
  students: StudentGrade[];
}

export interface GradeHistory {
  id: string;
  studentCode: string;
  studentName: string;
  field: string;
  oldValue: number | null;
  newValue: number | null;
  changedBy: string;
  changedAt: string;
}

