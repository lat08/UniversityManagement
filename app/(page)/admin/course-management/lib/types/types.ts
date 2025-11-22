export interface Course {
  courseId: string;
  courseCode: string;
  subjectName: string;
  lecturerName: string;
  lecturerId: string;
  enrollment: number;
  maxEnrollment?: number;
  semester: string;
  status: 'active' | 'inactive';
  batchId?: string;
  batchName?: string;
  majorId?: string;
  majorName?: string;
  specializationId?: string;
  specializationName?: string;
  createdAt: string;
  updatedAt: string;
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
  subjectId: string;
  maxEnrollment: number;
  status: 'active' | 'inactive';
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

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang học' },
  { value: 'inactive', label: 'Không hoạt động' },
];

export const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang học', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-700' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
};
