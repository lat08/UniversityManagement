export interface Student {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  facultyName: string;
  departmentName: string;
  academicYear: string;
  className: string;
  classId: string;
  enrollmentStatus: string;
  trainingSystemName: string;
  cumulativeGPA10: number | null; // GPA hệ 10
  averageGPA: number | null; // GPA hệ 4
  totalCreditsInCurriculum: number;
  creditsEarnedInCurriculum: number;
  creditsEarnedOutsideCurriculum: number;
  totalPaidAmount: number;
  totalOwedAmount: number;
  unpaidEnrollmentsCount: number;
  unpaidCreditsCount: number;
  totalEnrollmentsCount: number;
  completedEnrollmentsCount: number;
  lastEnrollmentDate: string | null;
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
    currentlyActive: number;
    enrolledThisYear: number;
    enrolledLastYear?: number;
    growthPercentage?: number;
    graduatingSoon: number;
    onLeave: number;
    suspended: number;
    droppedOut: number;
    graduated: number;
  };
  appliedFilters?: {
    searchKeyword?: string;
    facultyId?: string;
    departmentId?: string;
    academicYearId?: string;
    classId?: string;
    trainingSystemId?: string;
    enrollmentStatus?: string;
    nearestYearsCount?: number;
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
  facultyId?: string;
  departmentId?: string;
  academicYearId?: string;
  classId?: string;
  trainingSystemId?: string;
  enrollmentStatus?: string;
  nearestYearsCount?: number;
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
  { value: '', labelKey: 'status.all' },
  { value: 'active', labelKey: 'status.active' },
  { value: 'inactive', labelKey: 'status.inactive' },
  { value: 'dropped_out', labelKey: 'status.droppedOut' },
  { value: 'suspended', labelKey: 'status.suspended' },
  { value: 'qualified', labelKey: 'status.qualified' },
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
  cumulativeGPA10?: number | null; // GPA hệ 10
  averageGPA?: number | null; // GPA hệ 4
  earnedCredits?: number;
  totalCreditsRequired?: number;
  totalCreditsInCurriculum?: number;
  creditsEarnedInCurriculum?: number;
  creditsEarnedOutsideCurriculum?: number;
  unpaidAmount?: number;
  unpaidEnrollmentsCount?: number;
  isQualifiedToGraduate?: boolean;
}

const STATUS_DISPLAY_MAP: Record<
  string,
  { labelKey: keyof StudentProfileStatusMap; fallbackLabel: string; color: string }
> = {
  active: {
    labelKey: 'status.active',
    fallbackLabel: 'Active',
    color: 'bg-green-100 text-green-700',
  },
  inactive: {
    labelKey: 'status.inactive',
    fallbackLabel: 'Inactive',
    color: 'bg-gray-100 text-gray-700',
  },
  dropped_out: {
    labelKey: 'status.droppedOut',
    fallbackLabel: 'Dropped out',
    color: 'bg-red-100 text-red-700',
  },
  suspended: {
    labelKey: 'status.suspended',
    fallbackLabel: 'Suspended',
    color: 'bg-yellow-100 text-yellow-700',
  },
  qualified: {
    labelKey: 'status.qualified',
    fallbackLabel: 'Qualified',
    color: 'bg-blue-100 text-blue-700',
  },
};

export const getStatusDisplay = (
  status: string,
  translate?: (key: keyof StudentProfileStatusMap) => string,
) => {
  const statusInfo =
    STATUS_DISPLAY_MAP[status] ??
    ({
      labelKey: 'status.unknown',
      fallbackLabel: status,
      color: 'bg-gray-100 text-gray-700',
    } as const);

  return {
    label: translate ? translate(statusInfo.labelKey) : statusInfo.fallbackLabel,
    color: statusInfo.color,
    labelKey: statusInfo.labelKey,
  };
};

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'active', labelKey: 'status.active' },
  { value: 'inactive', labelKey: 'status.inactive' },
  { value: 'dropped_out', labelKey: 'status.droppedOut' },
  { value: 'suspended', labelKey: 'status.suspended' },
  { value: 'qualified', labelKey: 'status.qualified' },
];

export type StudentProfileStatusMap = {
  'status.all': string;
  'status.active': string;
  'status.inactive': string;
  'status.droppedOut': string;
  'status.suspended': string;
  'status.qualified': string;
  'status.unknown': string;
};

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
  registrationStartDate?: string;
  registrationEndDate?: string;
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

// Cumulative Grades Types (for full academic record)
export interface GradeItem {
  semesterId: string;
  semesterName: string;
  semesterStartDate?: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  midtermGrade: number | null;
  finalGrade: number | null;
  attendanceGrade: number | null;
  finalGrade10: number | null;
  finalGrade4: number | null;
  gradeLetter: string | null;
  status: string | null;
}

export interface SemesterResult {
  semesterId: string;
  semesterName: string;
  // Điểm tổng kết học kỳ
  semesterGPA10: number;
  semesterGPA4: number;
  semesterCredits: number;
  // Tín chỉ trong/ngoài CTDT học kỳ
  semesterCreditsInCurriculum?: number;
  semesterCreditsOutOfCurriculum?: number;
  // Điểm tích lũy đến học kỳ này
  cumulativeGPA10: number;
  cumulativeGPA4: number;
  cumulativeCredits: number;
  cumulativeClassification: string;
  grades: GradeItem[];
}

export interface CumulativeGradesData {
  cumulativeGPA10: number;
  cumulativeGPA4: number;
  totalCompletedCredits: number;
  totalRequiredCredits: number;
  totalSubjects: number;
  semesters: SemesterResult[];
}


