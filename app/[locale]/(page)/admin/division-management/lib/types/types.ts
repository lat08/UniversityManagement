export interface Division {
  divisionId: string; // Guid từ backend sẽ được serialize thành string
  divisionName: string;
  divisionCode: string;
  divisionStatus?: string; // Backend trả về string, có thể là 'active' hoặc 'inactive'
  deanId?: string;
  deanName?: string;
  facultyCount: number;
  subjectCount: number;
  instructorCount: number;
  createdAt: string; // DateTime từ backend sẽ được serialize thành ISO string
  updatedAt?: string;
}

export interface DivisionBasic {
  divisionId: string;
  divisionName: string;
  deanId?: string;
  deanName?: string;
  divisionStatus?: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DivisionsResponse {
  data: Division[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PagedResult<T> {
  Items: T;
  TotalCount: number;
  PageNumber: number;
  PageSize: number;
  TotalPages: number;
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
  deanId?: string;
  divisionStatus?: 'active' | 'inactive';
}

export interface BulkUpdateDivisionStatusPayload {
  divisionIds: string[];
  status: 'active' | 'inactive';
}

export interface BulkDeleteDivisionPayload {
  divisionIds: string[];
}

export const STATUS_OPTIONS: Array<{ value: string; labelKey: string }> = [
  { value: '', labelKey: 'status.all' },
  { value: 'active', labelKey: 'status.active' },
  { value: 'inactive', labelKey: 'status.inactive' },
];

export const getStatusDisplay = (
  status: string | undefined,
  labels?: {
    active: string;
    inactive: string;
    unknown: string;
  }
) => {
  const statusLower = status?.toLowerCase() || '';
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: labels?.active ?? 'Active', color: 'bg-green-100 text-green-700' },
    inactive: { label: labels?.inactive ?? 'Inactive', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[statusLower] || { label: labels?.unknown ?? (status || 'Unknown'), color: 'bg-gray-100 text-gray-700' };
};

