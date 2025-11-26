export interface Faculty {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  divisionId: string;
  divisionName: string;
  divisionCode: string;
  deanId?: string;
  deanName?: string;
  deanCode?: string;
  facultyStatus: string;
  curriculumCodes: string[];
  departmentCount: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface Pagination {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[] | null;
}

export interface PagedResult {
  data: Faculty[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetFacultiesParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  divisionId?: string;
  curriculumCode?: string;
  status?: string;
}

export interface CreateFacultyPayload {
  facultyName: string;
  facultyCode: string;
  divisionId: string;
  deanId?: string;
  facultyStatus?: 'active' | 'inactive';
}

export interface UpdateFacultyPayload {
  facultyName: string;
  facultyCode: string;
  divisionId: string;
  deanId?: string;
  facultyStatus: 'active' | 'inactive';
}

export const getStatusDisplay = (
  status: string,
  labels?: {
    active: string;
    inactive: string;
    unknown: string;
  }
) => {
  const statusLower = status?.toLowerCase() || '';
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: labels?.active ?? 'Đang hoạt động', color: 'bg-green-100 text-green-700' },
    inactive: { label: labels?.inactive ?? 'Ngưng hoạt động', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[statusLower] || { label: labels?.unknown ?? (status || 'Không xác định'), color: 'bg-gray-100 text-gray-700' };
};
