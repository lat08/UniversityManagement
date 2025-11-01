export interface StudentGrade {
  studentId: string;
  studentCode: string;
  fullName: string;
  className: string;
  classCode: string;
  attendanceScore: number | null; // Chuyên cần (20%)
  midtermScore: number | null; // Giữa kỳ (30%)
  finalScore: number | null; // Cuối kỳ (50%)
  averageScore: number | null; // Trung bình
}

export interface CourseGradeData {
  courseId: string;
  courseName: string;
  courseCode: string;
  className: string;
  classCode: string;
  semester: string;
  totalStudents: number;
  submittedCount: number;
  isLocked: boolean;
  lastModified: string | null;
  students: StudentGrade[];
}

export interface GradeSubmission {
  courseId: string;
  students: StudentGrade[];
}

