export interface Regulation {
  id: string;
  title: string;
  target: string;
  description: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
}

export interface RegulationResponse {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Regulation[];
}

export interface ApiResponse<T> {
  httpStatus: number;
  isSuccess: boolean;
  data: T;
}

export interface RegulationQueryParams {
  pageIndex?: number;
  pageSize?: number;
  orderBy?: 1 | 2;
  searchTerm?: string;
  isActive?: boolean;
}

export interface RegulationFilterOptions {
  target?: 'student' | 'instructor' | 'all';
  isActive?: boolean;
  searchTerm?: string;
}
