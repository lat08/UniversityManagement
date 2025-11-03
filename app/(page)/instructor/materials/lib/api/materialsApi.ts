import { api } from "@/lib/api/client"
import { 
  ApiResponse,
  MaterialsData,
  DocumentType,
  GetMaterialsParams,
  UploadMaterialRequest,
  UploadMaterialResponse,
  UpdateMaterialRequest
} from "../type"
import { MATERIALS_API } from "../constants"

export const materialsApi = {
  // Lấy danh sách tài liệu giảng dạy
  getMaterials: async (params?: GetMaterialsParams): Promise<ApiResponse<MaterialsData>> => {
    const queryParams = new URLSearchParams()
    
    if (params?.keyword && params.keyword.trim()) {
      queryParams.append('Keyword', params.keyword.trim())
    }
    if (params?.documentType && params.documentType.trim()) {
      queryParams.append('DocumentType', params.documentType.trim())
    }
    if (params?.semesterId && params.semesterId.trim()) {
      queryParams.append('SemesterId', params.semesterId.trim())
    }
    if (params?.subjectId && params.subjectId.trim()) {
      queryParams.append('SubjectId', params.subjectId.trim())
    }
    if (params?.pageNumber && params.pageNumber > 0) {
      queryParams.append('PageNumber', params.pageNumber.toString())
    }
    if (params?.pageSize && params.pageSize > 0) {
      queryParams.append('PageSize', params.pageSize.toString())
    }

    const queryString = queryParams.toString()
    const url = `${MATERIALS_API.GET_MATERIALS}${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<ApiResponse<MaterialsData>>(url)
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
  }
}

