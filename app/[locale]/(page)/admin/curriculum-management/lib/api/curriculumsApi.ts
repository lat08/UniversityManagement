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

export const curriculumsApi = {
  async getCurriculums(params: GetCurriculumsParams = {}): Promise<ApiResponse<CurriculumListResponse>> {
    const response = await api.get<ApiResponse<CurriculumListResponse>>('/v1/admin/curriculums', {
      params: {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
        facultyId: params.facultyId || undefined,
        departmentId: params.departmentId || undefined,
        searchKeyword: params.searchKeyword || undefined,
      },
    })

    return response.data
  },

  async getCurriculumDetail(curriculumId: string): Promise<ApiResponse<CurriculumDetail>> {
    const response = await api.get<ApiResponse<CurriculumDetail>>(`/v1/admin/curriculums/${curriculumId}`)
    return response.data
  },

  async createCurriculum(payload: CreateCurriculumPayload): Promise<ApiResponse<CurriculumListItem>> {
    const response = await api.post<ApiResponse<CurriculumListItem>>('/v1/admin/curriculums', payload)
    return response.data
  },

  async updateCurriculum(curriculumId: string, payload: UpdateCurriculumPayload): Promise<ApiResponse<CurriculumDetail>> {
    const response = await api.put<ApiResponse<CurriculumDetail>>(`/v1/admin/curriculums/${curriculumId}`, payload)
    return response.data
  },

  async deleteCurriculum(curriculumId: string): Promise<ApiResponse<unknown>> {
    const response = await api.delete<ApiResponse<unknown>>(`/v1/admin/curriculums/${curriculumId}`)
    return response.data
  },

  async getFaculties(): Promise<ApiResponse<FacultyOption[]>> {
    const response = await api.get<ApiResponse<FacultyOption[]>>('/v1/common/faculties')
    return response.data
  },

  async getDepartments(facultyId?: string): Promise<ApiResponse<DepartmentOption[]>> {
    const response = await api.get<ApiResponse<DepartmentOption[]>>('/v1/common/departments', {
      params: {
        facultyId: facultyId || undefined,
      },
    })

    return response.data
  },

  async setSubjects(curriculumId: string, payload: SetCurriculumSubjectsPayload): Promise<ApiResponse<unknown>> {
    const response = await api.post<ApiResponse<unknown>>(
      `/v1/admin/curriculums/${curriculumId}/subjects`,
      payload,
    )
    return response.data
  },

  async removeSubjects(curriculumId: string, payload: RemoveCurriculumSubjectsPayload): Promise<ApiResponse<unknown>> {
    const response = await api.delete<ApiResponse<unknown>>(
      `/v1/admin/curriculums/${curriculumId}/subjects`,
      { data: payload },
    )
    return response.data
  },

  async exportCurriculum(curriculumId: string, forImport?: boolean): Promise<Blob> {
    const response = await api.get(`/v1/admin/curriculums/export/${curriculumId}`, {
      params: {
        forImport: typeof forImport === 'boolean' ? forImport : undefined,
      },
      responseType: 'blob',
    })
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

    const response = await api.post<ApiResponse<CurriculumListItem>>('/v1/admin/curriculums/import', formData, {
      headers: {
        'Content-Type': undefined,
      },
    })

    return response.data
  },
}
