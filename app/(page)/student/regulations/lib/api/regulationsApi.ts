import { api } from '../../../../../../lib/api/client'
import { ApiResponse, RegulationResponse } from '../types/types'

export const regulationsApi = {
  /**
   * Lấy danh sách quy chế với phân trang
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

    const response = await api.get(`/v1/regulations?${searchParams}`)
    return response.data
  }
}
