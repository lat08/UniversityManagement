export interface DivisionListItem {
  divisionId: string
  divisionName: string
  divisionCode: string
  divisionStatus: 'active' | 'inactive'
  deanId: string | null
  deanName: string | null
  facultyCount: number
  subjectCount: number
  instructorCount: number
  createdAt: string
  updatedAt: string
}

export interface DivisionListResponse {
  data: DivisionListItem[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface DivisionBasicInfo {
  divisionId: string
  divisionName: string
  deanId: string | null
  deanName: string | null
  divisionStatus: 'active' | 'inactive'
}

export interface CreateDivisionPayload {
  divisionName: string
  deanId?: string
}

export interface UpdateDivisionPayload {
  divisionName: string
  divisionStatus: 'active' | 'inactive'
  deanId?: string
}

export interface BulkStatusUpdatePayload {
  divisionIds: string[]
  status: 'active' | 'inactive'
}

export interface BulkDeletePayload {
  divisionIds: string[]
}

export interface ApiResponse<T> {
  isSuccess?: boolean
  success?: boolean  // Backend trả về "success" thay vì "isSuccess"
  message: string
  data: T
}

export interface GetDivisionsParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  status?: 'active' | 'inactive' | ''
}

export interface InstructorOption {
  instructorId: string
  instructorName: string
}
