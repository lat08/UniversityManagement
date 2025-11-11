import { api } from "@/lib/api/client"
import { 
  ApiResponse,
  MaterialsData,
  DocumentType,
  GetMaterialsParams,
  UploadMaterialRequest,
  UploadMaterialResponse,
  UpdateMaterialRequest,
  InstructorCourseClassDto
} from "../type"
import { MATERIALS_API } from "../constants"

export const materialsApi = {
  // Lấy danh sách tài liệu giảng dạy
  getMaterials: async (params?: GetMaterialsParams): Promise<ApiResponse<MaterialsData>> => {
    const queryParams = new URLSearchParams()
    
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
    if (params?.pageNumber !== undefined) {
      queryParams.append('PageNumber', Math.max(1, params.pageNumber).toString())
    }
    if (params?.pageSize !== undefined) {
      queryParams.append('PageSize', Math.max(1, Math.min(100, params.pageSize)).toString())
    }

    const queryString = queryParams.toString()
    const url = queryString ? `${MATERIALS_API.GET_MATERIALS}?${queryString}` : MATERIALS_API.GET_MATERIALS
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>(url)
    
    if (response.data.success && response.data.data) {
      const pagedResult = response.data.data
      const materialsData: MaterialsData = {
        items: pagedResult.items || pagedResult.Items || [],
        totalCount: pagedResult.totalCount || 0,
        pageNumber: pagedResult.pageNumber || pagedResult.PageNumber || 1,
        pageSize: pagedResult.pageSize || pagedResult.PageSize || 10,
        totalPages: pagedResult.totalPages || pagedResult.TotalPages || 0,
        hasPrevious: pagedResult.hasPrevious || pagedResult.HasPrevious || false,
        hasNext: pagedResult.hasNext || pagedResult.HasNext || false,
      }
      return {
        success: true,
        message: response.data.message || '',
        data: materialsData,
        errors: null,
      }
    }
    
    return response.data
  },

  // Lấy danh sách loại tài liệu
  getDocumentTypes: async (): Promise<ApiResponse<DocumentType[]>> => {
    const response = await api.get<ApiResponse<DocumentType[]>>('/v1/materials/student/document-types')
    return response.data
  },

  // Upload tài liệu mới
  uploadMaterial: async (data: UploadMaterialRequest): Promise<ApiResponse<UploadMaterialResponse>> => {
    const formData = new FormData()
    formData.append('CourseClassId', data.courseClassId)
    formData.append('DocumentType', data.documentType)
    formData.append('Title', data.title)
    formData.append('Description', data.description)
    formData.append('File', data.file)

    const response = await api.post<ApiResponse<UploadMaterialResponse>>(
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

  // Cập nhật tài liệu
  updateMaterial: async (documentId: string, data: UpdateMaterialRequest): Promise<ApiResponse<null>> => {
    if (data.file) {
      const formData = new FormData()
      formData.append('CourseClassId', data.courseClassId)
      formData.append('DocumentType', data.documentType)
      formData.append('Title', data.title)
      formData.append('Description', data.description)
      formData.append('File', data.file)

      const response = await api.put<ApiResponse<null>>(
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

    const response = await api.put<ApiResponse<null>>(
      `${MATERIALS_API.UPDATE_MATERIAL}/${documentId}`,
      data
    )
    return response.data
  },

  // Xóa tài liệu
  deleteMaterial: async (documentId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      `${MATERIALS_API.DELETE_MATERIAL}/${documentId}`
    )
    return response.data
  },

  // Lấy danh sách lớp học phần của giảng viên
  getInstructorCourseClasses: async (semesterId?: string): Promise<ApiResponse<InstructorCourseClassDto[]>> => {
    const params = semesterId ? { semesterId } : {}
    const response = await api.get<ApiResponse<InstructorCourseClassDto[]>>('/v1/instructor/course-classes', { params })
    return response.data
  }
}

