export interface Course {
  courseId: string;
  courseCode: string;
  subjectName: string;
  subjectId?: string;
  subjectCode?: string;
  lecturerName: string;
  lecturerId: string;
  enrollment: number;
  maxEnrollment?: number;
  semester: string;
  semesterId?: string;
  academicYear?: string;
  academicYearId?: string;
  status: 'active' | 'inactive';
  feePerCredit?: number;
  totalFee?: number;
  batchId?: string;
  batchName?: string;
  majorId?: string;
  majorName?: string;
  specializationId?: string;
  specializationName?: string;
  createdAt: string;
  updatedAt: string;
  totalClasses?: number;
  totalStudents?: number;
  courseClasses?: CourseClassSummary[];
}

export interface FacultyAssignment {
  assignmentId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  effectiveDate: string;
  notes: string;
  subjectId?: string;
  subjectName?: string;
  batchId?: string;
  batchName?: string;
  majorId?: string;
  majorName?: string;
  specializationId?: string;
  specializationName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: Pagination;
}

export interface AssignmentsResponse {
  assignments: FacultyAssignment[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface Subject {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
}

export interface Instructor {
  instructorId: string;
  instructorName: string;
  instructorCode?: string;
}

export interface Batch {
  batchId: string;
  batchName: string;
  batchCode?: string;
}

export interface Major {
  majorId: string;
  majorName: string;
  majorCode?: string;
}

export interface Specialization {
  specializationId: string;
  specializationName: string;
  specializationCode?: string;
}

export interface Semester {
  semesterId: string;
  semesterName: string;
  semesterType?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Room {
  roomId: string;
  roomCode: string;
  roomName: string;
  buildingId?: string;
  buildingName?: string;
  roomType?: string;
  capacity?: number;
  status?: string;
}

export interface CourseClassSummary {
  courseClassId: string;
  courseClassCode: string;
  instructorName: string;
  enrolledStudents: number;
  maximumStudents: number;
  room: string;
  startDate: string;
  endDate: string;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  status: string;
}

/**
 * Schedule suggestions returned from
 * GET /v1/course-classes/schedule-suggestions
 */
export interface ScheduleSuggestion {
  roomId: string;
  roomName: string;
  roomType: string;
  buildingName: string;
  capacity: number;
  period: 'morning' | 'afternoon' | 'evening';
  startTime: string;
  endTime: string;
  startPeriod: number;
  endPeriod: number;
}

export interface GetCoursesParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  subjectId?: string;
  instructorId?: string;
  batchId?: string;
  majorId?: string;
  specializationId?: string;
  status?: string;
  academicYearId?: string;
}

export interface GetAssignmentsParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  subjectId?: string;
  instructorId?: string;
  batchId?: string;
  majorId?: string;
  specializationId?: string;
}

export interface CreateCoursePayload {
  courseCode: string;
  subjectId: string;
  semesterId: string;
  roomId: string;
  startDate: string;
  maxEnrollment: number;
  periodRange: 'morning' | 'afternoon' | 'evening';
}

export interface UpdateCoursePayload {
  courseId: string;
  maxEnrollment: number;
  status: 'active' | 'inactive';
  roomId: string;
  startDate: string;
  periodRange: 'morning' | 'afternoon' | 'evening';
}

export interface CreateAssignmentPayload {
  courseId: string;
  instructorId: string;
  effectiveDate: string;
  notes: string;
}

export interface UpdateAssignmentPayload extends CreateAssignmentPayload {
  assignmentId: string;
}

export const STATUS_OPTIONS: Array<{ value: '' | 'active' | 'inactive' | 'completed'; labelKey: string }> = [
  { value: '', labelKey: 'status.all' },
  { value: 'active', labelKey: 'status.active' },
  { value: 'inactive', labelKey: 'status.inactive' },
  { value: 'completed', labelKey: 'status.completed' },
];

export const getStatusDisplay = (
  status: string,
  translate?: (key: string) => string,
) => {
  const statusMap: Record<string, { labelKey: string; color: string }> = {
    active: { labelKey: 'status.active', color: 'bg-green-100 text-green-700' },
    inactive: { labelKey: 'status.inactive', color: 'bg-gray-100 text-gray-700' },
    completed: { labelKey: 'status.completed', color: 'bg-blue-100 text-blue-700' },
  };

  const fallback = { labelKey: 'status.unknown', color: 'bg-gray-100 text-gray-700' };
  const statusMeta = statusMap[status] || fallback;

  return {
    label: translate ? translate(statusMeta.labelKey) : statusMeta.labelKey,
    color: statusMeta.color,
  };
};
