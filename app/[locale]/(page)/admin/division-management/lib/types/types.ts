export interface Division {
  divisionId: string;
  divisionName: string;
  divisionCode: string;
  divisionStatus: string;
  deanId?: string;
  deanName?: string;
  facultyCount?: number;
  subjectCount?: number;
  instructorCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DivisionBasic {
  divisionId: string;
  divisionName: string;
  deanId?: string;
  deanName?: string;
  divisionStatus: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface PagedResult {
  data: Division[];
  pagination: Pagination;
}

export interface GetDivisionsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
}

export interface CreateDivisionPayload {
  divisionName: string;
  deanId?: string;
}

export interface UpdateDivisionPayload {
  divisionName: string;
  divisionStatus: 'active' | 'inactive';
  deanId?: string;
}

export interface BulkStatusUpdatePayload {
  divisionIds: string[];
  status: 'active' | 'inactive';
}

export interface BulkDeletePayload {
  divisionIds: string[];
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
