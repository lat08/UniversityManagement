import {
  CourseClassOption,
  Department,
  Faculty,
  Instructor,
  Semester,
  Subject,
} from '@/lib/types/common';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStatusOptionDefinition {
  value: ApprovalStatus | '';
  translationKey: string;
}

const APPROVAL_STATUS_OPTION_DEFINITIONS: ApprovalStatusOptionDefinition[] = [
  { value: '', translationKey: 'admin.gradeApproval.filters.allStatuses' },
  { value: 'pending', translationKey: 'admin.gradeApproval.statuses.pending' },
  { value: 'approved', translationKey: 'admin.gradeApproval.statuses.approved' },
  { value: 'rejected', translationKey: 'admin.gradeApproval.statuses.rejected' },
];

export const buildApprovalStatusOptions = (translate: (key: string) => string) =>
  APPROVAL_STATUS_OPTION_DEFINITIONS.map((option) => ({
    value: option.value,
    label: translate(option.translationKey),
  }));

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
  facultyName?: string | null;
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
  instructors: Instructor[];
}

export interface ApprovalStatusDisplay {
  translationKey?: string;
  fallbackLabel?: string;
  color: string;
}

export const getApprovalStatusDisplay = (status: ApprovalStatus | string): ApprovalStatusDisplay => {
  const statusMap: Record<string, ApprovalStatusDisplay> = {
    pending: { translationKey: 'admin.gradeApproval.statuses.pending', color: 'bg-yellow-100 text-yellow-700' },
    approved: { translationKey: 'admin.gradeApproval.statuses.approved', color: 'bg-green-100 text-green-700' },
    rejected: { translationKey: 'admin.gradeApproval.statuses.rejected', color: 'bg-red-100 text-red-700' },
  };
  return (
    statusMap[status] ?? {
      translationKey: 'admin.gradeApproval.statuses.unknown',
      fallbackLabel: typeof status === 'string' ? status : undefined,
      color: 'bg-gray-100 text-gray-700',
    }
  );
};
