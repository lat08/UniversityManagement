export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DepartmentListResponseDto {
  items: Department[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

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
  departmentCode: string;
  departmentName: string;
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  curricula: CurriculumInfo[];
  subjectCount: number;
  classCount: number;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface CreateDepartmentDto {
  departmentCode: string;
  departmentName: string;
  facultyId: string;
  curriculumIds?: string[];
}

export interface UpdateDepartmentDto {
  departmentCode?: string;
  departmentName?: string;
  facultyId?: string;
}

export interface BulkEditDepartmentDto {
  ids: string[];
  updates: {
    facultyId?: string;
  };
}

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
}

export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
}

export interface Curriculum {
  curriculumId: string;
  curriculumName: string;
  curriculumCode: string;
}

export const getStatusDisplay = (isActive: boolean) => {
  return isActive
    ? { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700' }
    : { label: 'Ngừng hoạt động', color: 'bg-gray-100 text-gray-700' };
};


