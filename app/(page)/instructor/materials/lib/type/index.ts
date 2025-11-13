// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors: string[] | null
}

// Backend DTOs - Exact match with API contracts
export interface DocumentChildDto {
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

export interface MaterialViewDto {
  courseClassId: string
  courseName: string
  uploadedById: string
  uploadedByName: string
  documents: DocumentChildDto[]
}

// Flat document DTO (not grouped by course class)
export interface InstructorDocumentDto extends DocumentChildDto {
  courseClassId: string
  courseName: string
  uploadedById: string
  uploadedByName: string
}

export interface PagedResult<T> {
  items: T
  totalCount: number
  totalDocumentsCount?: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface DocumentTypeDto {
  documentType: string
}

// Form Data Types
export interface UploadMaterialRequest {
  courseClassId: string
  documentType: string
  title: string
  description: string
  file: File
}

export interface UpdateMaterialRequest {
  courseClassId: string
  documentType: string
  title: string
  description: string
  file?: File | null
}

export interface MaterialResponseDto {
  documentId: string
  fileName: string
  filePath: string
  message: string
}

// Query Params - Match backend filter DTO
export interface GetMaterialsParams {
  keyword?: string
  semesterId?: string
  subjectId?: string
  documentType?: string
  pageNumber?: number
  pageSize?: number
}

export interface InstructorCourseClassDto {
  courseClassId: string
  subjectId: string
  courseCode: string
  courseName: string
  className: string
  semesterName: string
  totalStudents: number
  studentsWithGrades: number
  status: string
  isDraftEditable: boolean
}

// Aliases for backward compatibility
export type MaterialDocument = DocumentChildDto
export type CourseClassMaterials = MaterialViewDto
export type MaterialsData = PagedResult<MaterialViewDto[]>
export type DocumentType = DocumentTypeDto
export type UploadMaterialResponse = MaterialResponseDto

