export interface Division {
  divisionId: string;
  divisionCode: string;
  divisionName: string;
  deanId?: string;
  deanName?: string;
  status: 'active' | 'inactive';
  subjectCount: number;
  instructorCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DivisionsResponse {
  divisions: Division[];
  pagination: Pagination;
  statistics?: {
    totalDivisions: number;
    activeDivisions: number;
    inactiveDivisions: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface Instructor {
  instructorId: string;
  instructorName: string;
  instructorCode: string;
  status: 'active' | 'inactive';
}

export interface GetDivisionsParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  status?: string;
}

export interface CreateDivisionPayload {
  divisionName: string;
  divisionCode?: string;
  deanId?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateDivisionPayload {
  divisionId: string;
  divisionName: string;
  deanId?: string;
  status?: 'active' | 'inactive';
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

export const getStatusDisplay = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang hoạt động', color: 'text-green-600' },
    inactive: { label: 'Ngừng hoạt động', color: 'text-gray-500' },
  };
  return statusMap[status] || { label: status, color: 'text-gray-600' };
};

