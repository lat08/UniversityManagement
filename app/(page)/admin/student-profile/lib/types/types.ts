export interface Student {
  studentId: string;
  studentCode: string;
  fullName: string;
  departmentName: string;
  academicYear: string;
  email: string;
  className: string;
  enrollmentStatus: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StudentsResponse {
  students: Student[];
  pagination: Pagination;
  statistics?: {
    currentYear?: number;
    totalStudents: number;
    enrolledThisYear: number;
    enrolledLastYear?: number;
    growthPercentage?: number; // vs last year
    graduatingSoon: number;
    onLeave: number;
  };
 }

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface AcademicYear {
  academicYearId: string;
  yearRange: string;
  yearCode: string;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  facultyId: string;
  facultyName: string;
}

export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
}

export interface ClassItem {
  classId: string;
  classCode: string;
  className: string;
  departmentId: string;
  departmentName: string;
  startDate: string;
  endDate: string;
}

export interface GetStudentsParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  departmentId?: string;
  facultyId?: string;
  academicYearId?: string;
  enrollmentStatus?: string;
}

export interface ExportStudentsParams {
  searchKeyword?: string;
  departmentId?: string;
  facultyId?: string;
  academicYearId?: string;
  enrollmentStatus?: string;
}

export interface CreateStudentPayload {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  phoneNumber: string;
  citizenId: string;
  address: string;
  classId: string;
  enrollmentStatus?: string;
  profilePicturePath?: string;
}

export interface CreateStudentResponse {
  studentId: string;
  personId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  citizenId: string;
  address: string;
  profilePicture: string;
  studentCode: string;
  classId: string;
  enrollmentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang học' },
  { value: 'inactive', label: 'Đình chỉ' },
  { value: 'dropped_out', label: 'Thôi học' },
  { value: 'suspended', label: 'Bảo lưu' },
  { value: 'qualified', label: 'Đủ điều kiện TN' },
];

export interface StudentDetail {
  studentId: string;
  fullName: string;
  studentCode: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  citizenId: string;
  majorName?: string;
  facultyName: string;
  facultyId: string;
  departmentId: string;
  departmentName: string;
  classCode: string;
  className: string;
  classId: string;
  enrollmentStatus: string;
  educationLevel: string;
  academicYear: string;
  address: string;
  profilePicture: string | null;
  role: string;
  // New fields from API
  startAcademicYear?: string;
  endAcademicYear?: string;
  trainingSystemName?: string;
  averageGPA?: number | null;
  earnedCredits?: number;
  totalCreditsRequired?: number;
  totalCreditsInCurriculum?: number;
  creditsEarnedInCurriculum?: number;
  creditsEarnedOutsideCurriculum?: number;
  unpaidAmount?: number;
  unpaidEnrollmentsCount?: number;
  isQualifiedToGraduate?: boolean;
}

export const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang học', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Đình chỉ', color: 'bg-gray-100 text-gray-700' },
    dropped_out: { label: 'Thôi học', color: 'bg-red-100 text-red-700' },
    suspended: { label: 'Bảo lưu', color: 'bg-yellow-100 text-yellow-700' },
    qualified: { label: 'Đủ điều kiện TN', color: 'bg-blue-100 text-blue-700' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
};

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Đang học' },
  { value: 'inactive', label: 'Đình chỉ' },
  { value: 'dropped_out', label: 'Thôi học' },
  { value: 'suspended', label: 'Bảo lưu' },
  { value: 'qualified', label: 'Đủ điều kiện TN' },
];

export interface UpdateStudentPayload {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD format
  gender: string;
  phoneNumber: string;
  citizenId: string;
  address: string;
  classId: string;
  enrollmentStatus: string;
  profilePicture?: File | string; // File object or base64 string
  password?: string;
  confirmPassword?: string;
}

export interface Semester {
  semesterId: string;
  semesterName: string;
  semesterCode: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
  yearRange: string;
}

export interface TuitionFeeCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  courseFee: number;
  status: string;
}

export interface TuitionFee {
  semesterId: string;
  semesterName: string;
  courses: TuitionFeeCourse[];
}

export interface Insurance {
  studentHealthInsuranceId: string;
  academicYear: string;
  healthInsuranceFee: number;
  status: string;
}

export interface Grade {
  semesterId: string;
  semesterName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  midtermGrade: number | null;
  finalGrade: number | null;
  attendanceGrade: number | null;
  finalGrade10: number | null;
  finalGrade4: number;
  gradeLetter: string;
  status: string;
}

export interface SemesterGrades {
  semesterId: string;
  semesterName: string;
  semesterGPA10: number;
  semesterGPA4: number;
  semesterClassification: string;
  grades: Grade[];
}

