export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors: unknown
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface Faculty {
  facultyId: string
  facultyName: string
  facultyCode: string
  divisionId: string
  divisionName: string
  divisionCode: string
  deanId: string
  deanName: string
  deanCode: string
  facultyStatus: "active" | "inactive"
  curriculumCodes: string[]
  departmentCount: number
  createdAt: string
  updatedAt: string | null
  isActive: boolean
}

export interface CreateFacultyDto {
  facultyCode: string
  facultyName: string
  divisionId: string
  deanId: string
  facultyStatus: "active" | "inactive"
}

export interface UpdateFacultyDto {
  facultyCode?: string
  facultyName?: string
  divisionId?: string
  deanId?: string
  facultyStatus?: "active" | "inactive"
}

export interface BulkEditFacultyDto {
  ids: string[]
  updates: {
    divisionId?: string
    deanId?: string
    facultyStatus?: "active" | "inactive"
  }
}

export interface FacultyStats {
  total: number
  active: number
  inactive: number
}

export interface Division {
  divisionId: string
  divisionName: string
  divisionCode: string
}

export interface Dean {
  instructorId: string
  fullName: string
  instructorCode: string
}
