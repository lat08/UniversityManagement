import { api } from '@/lib/api/client'
import type {
  ApiResponse,
  CurriculumDetail,
  CurriculumListItem,
  CurriculumListResponse,
  DepartmentOption,
  FacultyOption,
  GetCurriculumsParams,
  CreateCurriculumPayload,
  UpdateCurriculumPayload,
  SetCurriculumSubjectsPayload,
  RemoveCurriculumSubjectsPayload,
} from '../types/types'

const DEBUG_CURRICULUM_API = false

const debugCurriculumApi = (...args: unknown[]) => {
  if (!DEBUG_CURRICULUM_API) return
  // eslint-disable-next-line no-console
  console.log('[curriculumsApi]', ...args)
}

export const curriculumsApi = {
  async getCurriculums(params: GetCurriculumsParams = {}): Promise<ApiResponse<CurriculumListResponse>> {
    debugCurriculumApi('getCurriculums: request params', params)
    const response = await api.get<ApiResponse<CurriculumListResponse>>('/v1/admin/curriculums', {
      params: {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
        facultyId: params.facultyId || undefined,
        departmentId: params.departmentId || undefined,
        searchKeyword: params.searchKeyword || undefined,
      },
    })

    debugCurriculumApi('getCurriculums: response', response.data)
    return response.data
  },

  async getCurriculumDetail(curriculumId: string): Promise<ApiResponse<CurriculumDetail>> {
    debugCurriculumApi('getCurriculumDetail: request', { curriculumId })
    const response = await api.get<ApiResponse<CurriculumDetail>>(`/v1/admin/curriculums/${curriculumId}`)
    debugCurriculumApi('getCurriculumDetail: response', response.data)
    return response.data
  },

  async createCurriculum(payload: CreateCurriculumPayload): Promise<ApiResponse<CurriculumListItem>> {
    debugCurriculumApi('createCurriculum: request', payload)
    const response = await api.post<ApiResponse<CurriculumListItem>>('/v1/admin/curriculums', payload)
    debugCurriculumApi('createCurriculum: response', response.data)
    return response.data
  },

  async updateCurriculum(curriculumId: string, payload: UpdateCurriculumPayload): Promise<ApiResponse<CurriculumDetail>> {
    debugCurriculumApi('updateCurriculum: request', { curriculumId, payload })
    const response = await api.put<ApiResponse<CurriculumDetail>>(`/v1/admin/curriculums/${curriculumId}`, payload)
    debugCurriculumApi('updateCurriculum: response', response.data)
    return response.data
  },

  async deleteCurriculum(curriculumId: string): Promise<ApiResponse<unknown>> {
    debugCurriculumApi('deleteCurriculum: request', { curriculumId })
    const response = await api.delete<ApiResponse<unknown>>(`/v1/admin/curriculums/${curriculumId}`)
    debugCurriculumApi('deleteCurriculum: response', response.data)
    return response.data
  },

  async bulkDeleteCurriculums(curriculumIds: string[]): Promise<ApiResponse<unknown>> {
    debugCurriculumApi('bulkDeleteCurriculums: request', { curriculumIds })
    const response = await api.post<ApiResponse<unknown>>('/v1/admin/curriculums/bulk-delete', {
      curriculumIds,
    })
    debugCurriculumApi('bulkDeleteCurriculums: response', response.data)
    return response.data
  },

  async bulkUpdateCurriculumStatus(
    curriculumIds: string[],
    isActive: boolean,
  ): Promise<ApiResponse<unknown>> {
    debugCurriculumApi('bulkUpdateCurriculumStatus: request', { curriculumIds, isActive })
    const response = await api.put<ApiResponse<unknown>>('/v1/admin/curriculums/bulk-status', {
      curriculumIds,
      isActive,
    })
    debugCurriculumApi('bulkUpdateCurriculumStatus: response', response.data)
    return response.data
  },

  async getFaculties(): Promise<ApiResponse<FacultyOption[]>> {
    debugCurriculumApi('getFaculties: request')
    const response = await api.get<ApiResponse<FacultyOption[]>>('/v1/common/faculties')
    debugCurriculumApi('getFaculties: response', response.data)
    return response.data
  },

  async getDepartments(facultyId?: string): Promise<ApiResponse<DepartmentOption[]>> {
    debugCurriculumApi('getDepartments: request', { facultyId })
    const response = await api.get<ApiResponse<DepartmentOption[]>>('/v1/common/departments', {
      params: {
        facultyId: facultyId || undefined,
      },
    })

    debugCurriculumApi('getDepartments: response', response.data)
    return response.data
  },

  async setSubjects(curriculumId: string, payload: SetCurriculumSubjectsPayload): Promise<ApiResponse<unknown>> {
    debugCurriculumApi('setSubjects: request', { curriculumId, payload })
    const response = await api.post<ApiResponse<unknown>>(
      `/v1/admin/curriculums/${curriculumId}/subjects`,
      payload,
    )
    debugCurriculumApi('setSubjects: response', response.data)
    return response.data
  },

  async removeSubjects(curriculumId: string, payload: RemoveCurriculumSubjectsPayload): Promise<ApiResponse<unknown>> {
    debugCurriculumApi('removeSubjects: request', { curriculumId, payload })
    const response = await api.delete<ApiResponse<unknown>>(
      `/v1/admin/curriculums/${curriculumId}/subjects`,
      { data: payload },
    )
    debugCurriculumApi('removeSubjects: response', response.data)
    return response.data
  },

  async exportCurriculum(curriculumId: string, forImport?: boolean): Promise<Blob> {
    debugCurriculumApi('exportCurriculum: request', { curriculumId, forImport })
    const response = await api.get(`/v1/admin/curriculums/export/${curriculumId}`, {
      params: {
        forImport: typeof forImport === 'boolean' ? forImport : undefined,
      },
      responseType: 'blob',
    })
    debugCurriculumApi('exportCurriculum: response', response)
    return response.data
  },

  async importCurriculum(payload: {
    file: File
    curriculumCode: string
    curriculumName: string
    departmentId: string
    appliedYear: number
  }): Promise<ApiResponse<CurriculumListItem>> {
    const formData = new FormData()
    formData.append('File', payload.file)
    formData.append('CurriculumCode', payload.curriculumCode)
    formData.append('CurriculumName', payload.curriculumName)
    formData.append('DepartmentId', payload.departmentId)
    formData.append('AppliedYear', String(payload.appliedYear))

    debugCurriculumApi('importCurriculum: request', {
      curriculumCode: payload.curriculumCode,
      curriculumName: payload.curriculumName,
      departmentId: payload.departmentId,
      appliedYear: payload.appliedYear,
      fileName: payload.file.name,
      fileSize: payload.file.size,
    })

    const response = await api.post<ApiResponse<CurriculumListItem>>('/v1/admin/curriculums/import', formData, {
      headers: {
        'Content-Type': undefined,
      },
    })

    debugCurriculumApi('importCurriculum: response', response.data)
    return response.data
  },
}
