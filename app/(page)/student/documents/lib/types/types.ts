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
    total: number
    data: CourseGroup[]
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
  searchTerm?: string
  documentType?: string
  semesterId?: string
  subjectId?: string
  pageNumber?: number
  pageSize?: number
}

// Semester types
export interface Semester {
  semesterId: string
  semesterName: string
  semesterType: 'summer' | 'spring' | 'fall'
  startDate: string
  endDate: string
  status: 'active' | 'inactive'
}

export interface GetSemestersResponse {
  success: boolean
  data: Semester[]
  errors?: string[] | null
}

// Subject types
export interface Subject {
  subjectId: string
  subjectCode: string
  subjectName: string
  credits: number
  theoryHours: number
  practiceHours: number
  status: 'active' | 'inactive'
  departmentName: string
}

export interface GetSubjectsResponse {
  success: boolean
  data: Subject[]
  errors?: string[] | null
}
