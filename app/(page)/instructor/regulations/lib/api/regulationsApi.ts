import { api } from '../../../../../../lib/api/client'
import { ApiResponse, RegulationResponse } from '../types/types'

export const regulationsApi = {
  /**
   * Lấy danh sách quy chế cho giảng viên với phân trang
   */
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

    // Sử dụng cùng endpoint - backend sẽ phân biệt dựa trên role trong token
    const response = await api.get(`/v1/regulations?${searchParams}`)
    return response.data
  }
}

