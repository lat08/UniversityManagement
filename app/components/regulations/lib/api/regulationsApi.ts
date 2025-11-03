import { api } from '@/lib/api/client'

export interface Regulation {
  id: string
  title: string
  category: string
  description: string
  fileUrl: string
  fileName: string
  createdAt: string
  updatedAt: string | null
  isActive: boolean
}

export interface RegulationResponse {
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  data: Regulation[]
}

export interface ApiResponse<T> {
  httpStatus: number
  isSuccess: boolean
  data: T
}

export const regulationsApi = {
  getRegulations: async (params: {
    pageIndex?: number
    pageSize?: number
    orderBy?: number
  } = {}): Promise<ApiResponse<RegulationResponse>> => {
    const { pageIndex = 1, pageSize = 20, orderBy = 1 } = params
    
    const searchParams = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      orderBy: orderBy.toString()
    })

    const response = await api.get(`/v1/regulations?${searchParams}`)
    return response.data
  }
}

