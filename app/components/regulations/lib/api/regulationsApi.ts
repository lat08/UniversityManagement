import { api } from '@/lib/api/client';

export interface Regulation {
  id: string;
  title: string;
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

export const regulationsApi = {
  getRegulations: async (params: RegulationQueryParams = {}): Promise<ApiResponse<RegulationResponse>> => {
    const { pageIndex = 1, pageSize = 50, orderBy = 1, searchTerm, isActive } = params;
    
    const searchParams = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      orderBy: orderBy.toString(),
    });

    if (searchTerm) searchParams.append('searchTerm', searchTerm);
    if (isActive !== undefined) searchParams.append('isActive', isActive.toString());

    const response = await api.get(`/v1/regulations?${searchParams}`);
    return response.data;
  },

  getRegulationById: async (id: string): Promise<ApiResponse<Regulation>> => {
    const response = await api.get(`/v1/regulations/${id}`);
    return response.data;
  },
};

