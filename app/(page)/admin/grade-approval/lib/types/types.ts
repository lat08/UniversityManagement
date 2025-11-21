import {
  CourseClassOption,
  Department,
  Faculty,
  InstructorOption,
  Semester,
  Subject,
} from '@/lib/types/common';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface GradeApprovalFilterState {
  versionStatus?: ApprovalStatus | '';
  semesterId?: string;
  subjectId?: string;
  courseClassId?: string;
  courseId?: string;
  facultyId?: string;
  departmentId?: string;
  instructorId?: string;
}

export interface GetGradeApprovalsParams extends GradeApprovalFilterState {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'subject' | 'instructor' | 'status';
  sortOrder?: 'asc' | 'desc';
  searchKey?: string;
}

export type ExportGradeApprovalsParams = Omit<GetGradeApprovalsParams, 'pageNumber' | 'pageSize' | 'sortBy' | 'sortOrder'>;

export interface AdminGradeApprovalListItem {
  gradeVersionId: string;
  courseClassId: string;
  versionNumber: number;
  versionStatus: ApprovalStatus;
  courseCode: string;
  courseName: string;
  className: string;
  semesterId: string;
  semesterName: string;
  submittedBy: string;
  submittedAt: string | null;
  submissionNote?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvalNote?: string | null;
  totalStudents: number;
  studentsWithGrades: number;
}

export interface AdminGradeApprovalList {
  items: AdminGradeApprovalListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminGradeDetailEntry {
  enrollmentId: string;
  mssv: string;
  fullName: string;
  attendanceGrade?: number | null;
  midtermGrade?: number | null;
  finalGrade?: number | null;
  averageGrade?: number | null;
  previousAttendanceGrade?: number | null;
  previousMidtermGrade?: number | null;
  previousFinalGrade?: number | null;
  previousAverageGrade?: number | null;
  note?: string | null;
}

export interface AdminGradeVersionDetail {
  gradeVersionId: string;
  versionNumber: number;
  versionStatus: ApprovalStatus;
  submittedBy: string;
  submittedAt: string | null;
  submissionNote?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvalNote?: string | null;
  courseClassId: string;
  courseCode: string;
  courseName: string;
  className: string;
  semesterId: string;
  semesterName: string;
  totalStudents: number;
  previousVersionNumber?: number | null;
  hasPreviousVersion: boolean;
  students: AdminGradeDetailEntry[];
}

export interface AdminBulkGradeActionRequest {
  gradeVersionIds: string[];
  approvalNote?: string;
}

export interface AdminBulkGradeActionResult {
  successCount: number;
  failureCount: number;
  errorMessages: string[];
}

export interface AdminGradeStatistics {
  totalGradeVersions: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface GradeApprovalDropdownContext {
  semesters: Semester[];
  subjects: Subject[];
  courseClasses: CourseClassOption[];
  faculties: Faculty[];
  departments: Department[];
  instructors: InstructorOption[];
}

export const APPROVAL_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
];

export const getApprovalStatusDisplay = (status: ApprovalStatus | string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
};
