export interface GradeApproval {
  gradeApprovalId: string;
  gradeSheetCode: string; // Mã bản điểm
  courseName: string;
  courseCode: string;
  className: string;
  instructorName: string;
  semester: string;
  studentCount: number; // Số sinh viên
  submittedDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GradeApprovalsResponse {
  gradeApprovals: GradeApproval[];
  pagination: Pagination;
  statistics?: {
    totalApprovals: number;
    pendingApprovals: number;
    approvedApprovals: number;
    rejectedApprovals: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  facultyId: string;
  facultyName: string;
}

export interface Instructor {
  instructorId: string;
  instructorName: string;
  instructorCode: string;
  email: string;
  departmentId: string;
  departmentName: string;
}

export interface GetGradeApprovalsParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  facultyId?: string;
  departmentId?: string;
  instructorId?: string;
  approvalStatus?: string;
}

export interface ExportGradeApprovalsParams {
  searchKeyword?: string;
  facultyId?: string;
  departmentId?: string;
  instructorId?: string;
  approvalStatus?: string;
}

export const APPROVAL_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
];

export const getApprovalStatusDisplay = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
};
