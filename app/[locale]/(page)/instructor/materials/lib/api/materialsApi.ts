import { api } from "@/lib/api/client"
import { 
  ApiResponse,
  PagedResult,
  MaterialViewDto,
  InstructorDocumentDto,
  DocumentTypeDto,
  GetMaterialsParams,
  UploadMaterialRequest,
  MaterialResponseDto,
  UpdateMaterialRequest,
  InstructorCourseClassDto
} from "../type"
import { MATERIALS_API } from "../constants"

// Normalize backend response casing (PascalCase -> camelCase)
const normalizePagedResult = <T>(data: PagedResult<T> | Record<string, unknown>): PagedResult<T> => {
  const normalized = data as Record<string, unknown>
  return {
    items: (normalized.items || normalized.Items) as T,
    totalCount: (normalized.totalCount || normalized.TotalCount || 0) as number,
    totalDocumentsCount: (normalized.totalDocumentsCount || normalized.TotalDocumentsCount) as number | undefined,
    pageNumber: (normalized.pageNumber || normalized.PageNumber || 1) as number,
    pageSize: (normalized.pageSize || normalized.PageSize || 10) as number,
    totalPages: (normalized.totalPages || normalized.TotalPages || 0) as number,
    hasPrevious: (normalized.hasPrevious || normalized.HasPrevious || false) as boolean,
    hasNext: (normalized.hasNext || normalized.HasNext || false) as boolean,
  }
}

export const materialsApi = {
  getMaterials: async (params?: GetMaterialsParams): Promise<ApiResponse<PagedResult<MaterialViewDto[]>>> => {
    const queryParams = new URLSearchParams()
    
    // Always include pagination params with defaults
    const pageNumber = params?.pageNumber && params.pageNumber > 0 ? params.pageNumber : 1
    const pageSize = params?.pageSize && params.pageSize > 0 ? Math.min(100, params.pageSize) : 10
    
    queryParams.append('PageNumber', pageNumber.toString())
    queryParams.append('PageSize', pageSize.toString())
    
    if (params?.keyword?.trim()) {
      queryParams.append('Keyword', params.keyword.trim())
    }
    if (params?.documentType?.trim()) {
      queryParams.append('DocumentType', params.documentType.trim())
    }
    if (params?.semesterId?.trim()) {
      queryParams.append('SemesterId', params.semesterId.trim())
    }
    if (params?.subjectId?.trim()) {
      queryParams.append('SubjectId', params.subjectId.trim())
    }

    const queryString = queryParams.toString()
    const url = `${MATERIALS_API.GET_MATERIALS}?${queryString}`
    
    try {
      const response = await api.get<ApiResponse<Record<string, unknown>>>(url)
      
      // Debug logging
      console.log('[getMaterials] Request URL:', url)
      console.log('[getMaterials] Response:', response.data)
      console.log('[getMaterials] Response data:', response.data.data)
      
      if (response.data.success && response.data.data) {
        const normalizedData = normalizePagedResult<MaterialViewDto[]>(response.data.data)
        console.log('[getMaterials] Normalized data:', normalizedData)
        return {
          success: true,
          message: response.data.message || '',
          data: normalizedData,
          errors: null,
        }
      }
      
      console.warn('[getMaterials] Response not successful:', response.data)
      return {
        success: false,
        message: response.data.message || 'Failed to fetch materials',
        data: {
          items: [],
          totalCount: 0,
          totalDocumentsCount: 0,
          pageNumber,
          pageSize,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
        },
        errors: response.data.errors,
      }
    } catch (error) {
      console.error('[getMaterials] Error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch materials',
        data: {
          items: [],
          totalCount: 0,
          totalDocumentsCount: 0,
          pageNumber,
          pageSize,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
        },
        errors: null,
      }
    }
  },

  getDocuments: async (params?: GetMaterialsParams): Promise<ApiResponse<PagedResult<InstructorDocumentDto[]>>> => {
    const queryParams = new URLSearchParams()
    
    // Always include pagination params with defaults
    const pageNumber = params?.pageNumber && params.pageNumber > 0 ? params.pageNumber : 1
    const pageSize = params?.pageSize && params.pageSize > 0 ? Math.min(100, params.pageSize) : 10
    
    queryParams.append('PageNumber', pageNumber.toString())
    queryParams.append('PageSize', pageSize.toString())
    
    if (params?.keyword?.trim()) {
      queryParams.append('Keyword', params.keyword.trim())
    }
    if (params?.documentType?.trim()) {
      queryParams.append('DocumentType', params.documentType.trim())
    }
    if (params?.semesterId?.trim()) {
      queryParams.append('SemesterId', params.semesterId.trim())
    }
    if (params?.subjectId?.trim()) {
      queryParams.append('SubjectId', params.subjectId.trim())
    }

    const queryString = queryParams.toString()
    const url = `${MATERIALS_API.GET_DOCUMENTS}?${queryString}`
    
    try {
      const response = await api.get<ApiResponse<Record<string, unknown>>>(url)
      
      if (response.data.success && response.data.data) {
        const normalizedData = normalizePagedResult<InstructorDocumentDto[]>(response.data.data)
        return {
          success: true,
          message: response.data.message || '',
          data: normalizedData,
          errors: null,
        }
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to fetch documents',
        data: {
          items: [],
          totalCount: 0,
          pageNumber,
          pageSize,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
        },
        errors: response.data.errors,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch documents',
        data: {
          items: [],
          totalCount: 0,
          pageNumber,
          pageSize,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
        },
        errors: null,
      }
    }
  },

  getDocumentTypes: async (): Promise<ApiResponse<DocumentTypeDto[]>> => {
    const response = await api.get<ApiResponse<DocumentTypeDto[]>>('/v1/materials/student/document-types')
    return response.data
  },

  uploadMaterial: async (data: UploadMaterialRequest): Promise<ApiResponse<MaterialResponseDto>> => {
    const formData = new FormData()
    formData.append('CourseClassId', data.courseClassId)
    formData.append('DocumentType', data.documentType)
    formData.append('Title', data.title)
    if (data.description?.trim()) {
      formData.append('Description', data.description.trim())
    }
    formData.append('File', data.file)

    const response = await api.post<ApiResponse<MaterialResponseDto>>(
      MATERIALS_API.UPLOAD_MATERIAL,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  updateMaterial: async (documentId: string, data: UpdateMaterialRequest): Promise<ApiResponse<string>> => {
    if (data.file) {
      const formData = new FormData()
      formData.append('CourseClassId', data.courseClassId)
      formData.append('DocumentType', data.documentType)
      formData.append('Title', data.title)
      formData.append('Description', data.description)
      formData.append('File', data.file)

      const response = await api.put<ApiResponse<string>>(
        `${MATERIALS_API.UPDATE_MATERIAL}/${documentId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    }

    const response = await api.put<ApiResponse<string>>(
      `${MATERIALS_API.UPDATE_MATERIAL}/${documentId}`,
      data
    )
    return response.data
  },

  deleteMaterial: async (documentId: string): Promise<ApiResponse<string>> => {
    const response = await api.delete<ApiResponse<string>>(
      `${MATERIALS_API.DELETE_MATERIAL}/${documentId}`
    )
    return response.data
  },

  getInstructorCourseClasses: async (semesterId?: string): Promise<ApiResponse<InstructorCourseClassDto[]>> => {
    const params = semesterId ? { semesterId } : {}
    const response = await api.get<ApiResponse<InstructorCourseClassDto[]>>('/v1/instructor/course-classes', { params })
    return response.data
  }
}

