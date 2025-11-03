export interface DocumentItem {
  documentId: string
  fileTitle: string
  fileType: string
  fileSize: number
  fileSizeMb: string
  description: string
  documentType: string
  filePath: string
  previewUrl: string
  downloadUrl: string
  created: string
}

export interface CourseGroup {
  courseClassId: string
  courseName: string
  uploadedById: string
  uploadedByName: string
  documents: DocumentItem[]
}

export interface MaterialsPagination {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface GetMaterialsResponse {
  success: boolean
  message: string
  data: {
    items: CourseGroup[]
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
    hasPrevious: boolean
    hasNext: boolean
  }
  errors?: string[] | null
}

export interface DocumentTypeItem {
  documentType: string
}

export interface GetDocumentTypesResponse {
  success: boolean
  message: string
  data: DocumentTypeItem[]
  errors: string[] | null
}

export interface GetMaterialsParams {
  keyword?: string
  documentType?: string
  semesterId?: string
  subjectId?: string
  pageNumber?: number
  pageSize?: number
}

