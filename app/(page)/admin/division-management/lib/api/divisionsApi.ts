import { api } from '@/lib/api/client'
import type {
  ApiResponse,
  DivisionListItem,
  DivisionListResponse,
  DivisionBasicInfo,
  GetDivisionsParams,
  CreateDivisionPayload,
  UpdateDivisionPayload,
  BulkStatusUpdatePayload,
  BulkDeletePayload,
  InstructorOption,
} from '../types/types'

export const divisionsApi = {
  async getDivisions(params: GetDivisionsParams = {}): Promise<ApiResponse<DivisionListResponse>> {
    const response = await api.get<ApiResponse<DivisionListResponse>>('/v1/divisions', {
      params: {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
        searchTerm: params.searchTerm || undefined,
        status: params.status || undefined,
      },
    })

    return response.data
  },

  async getDivisionBasic(divisionId: string): Promise<ApiResponse<DivisionBasicInfo>> {
    const response = await api.get<ApiResponse<DivisionBasicInfo>>(`/v1/divisions/${divisionId}/basic`)
    return response.data
  },

  async createDivision(payload: CreateDivisionPayload): Promise<ApiResponse<DivisionListItem>> {
    const response = await api.post<ApiResponse<DivisionListItem>>('/v1/divisions', payload)
    return response.data
  },

  async updateDivision(divisionId: string, payload: UpdateDivisionPayload): Promise<ApiResponse<DivisionListItem>> {
    const response = await api.put<ApiResponse<DivisionListItem>>(`/v1/divisions/${divisionId}`, payload)
    return response.data
  },

  async bulkUpdateStatus(payload: BulkStatusUpdatePayload): Promise<ApiResponse<{ updatedCount: number }>> {
    const response = await api.patch<ApiResponse<{ updatedCount: number }>>('/v1/divisions/bulk-status', payload)
    return response.data
  },

  async bulkDelete(payload: BulkDeletePayload): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await api.delete<ApiResponse<{ deletedCount: number }>>('/v1/divisions/bulk', { data: payload })
    return response.data
  },

  async exportDivisions(params: { searchTerm?: string; status?: string }): Promise<Blob> {
    const response = await api.get('/v1/divisions/export', {
      params: {
        searchTerm: params.searchTerm || undefined,
        status: params.status || undefined,
      },
      responseType: 'blob',
    })
    return response.data
  },

  async getInstructors(): Promise<ApiResponse<InstructorOption[]>> {
    const response = await api.get<ApiResponse<InstructorOption[]>>('/v1/common/instructors')
    return response.data
  },
}
