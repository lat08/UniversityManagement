export interface CurriculumInfo {
  curriculumId: string;
  curriculumCode: string;
  curriculumName: string;
  appliedYear: number;
  versionNumber: number;
  isActive: boolean;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  curricula: CurriculumInfo[];
  subjectCount: number;
  classCount: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface DepartmentListResponse {
  items: Department[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetDepartmentsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  facultyId?: string;
  curriculumId?: string;
  isActive?: boolean | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDepartmentPayload {
  departmentCode: string;
  departmentName: string;
  facultyId: string;
  curriculumIds?: string[];
}

export interface UpdateDepartmentPayload {
  departmentCode?: string;
  departmentName?: string;
  facultyId?: string;
}

export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
}

export interface Curriculum {
  curriculumId: string;
  curriculumCode: string;
  curriculumName: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  appliedYear: number;
  versionNumber: number;
  totalSubjects?: number;
  totalCredits?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
}

export const getStatusDisplay = (
  isActive: boolean,
  labels?: {
    active: string;
    inactive: string;
  }
) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    true: { label: labels?.active ?? 'Active', color: 'bg-green-100 text-green-700' },
    false: { label: labels?.inactive ?? 'Inactive', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[String(isActive)] || { label: labels?.inactive ?? 'Inactive', color: 'bg-gray-100 text-gray-700' };
};

