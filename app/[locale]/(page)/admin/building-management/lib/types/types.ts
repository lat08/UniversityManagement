export interface Building {
  buildingId: string; // Guid từ backend sẽ được serialize thành string
  buildingName: string;
  buildingCode: string;
  address?: string;
  buildingStatus: string; // Backend trả về string, có thể là 'active' hoặc 'inactive'
  createdAt: string; // DateTime từ backend sẽ được serialize thành ISO string
}

export interface BuildingLight {
  buildingId: string;
  buildingName: string;
  buildingCode: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface BuildingsResponse {
  items: Building[];
  pagination: Pagination;
  statistics?: {
    totalBuildings: number;
    activeBuildings: number;
    inactiveBuildings: number;
  };
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

export interface GetBuildingsParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateBuildingPayload {
  buildingName: string;
  buildingCode: string;
  address?: string;
  buildingStatus?: 'active' | 'inactive';
}

export interface UpdateBuildingPayload {
  buildingName?: string;
  buildingCode?: string;
  address?: string;
  buildingStatus?: 'active' | 'inactive';
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

export const getStatusDisplay = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Ngừng hoạt động', color: 'bg-red-100 text-red-700' },
  };
  return statusMap[statusLower] || { label: status || 'Không xác định', color: 'bg-gray-100 text-gray-700' };
};

