export interface CurriculumListItem {
  curriculumId: string
  curriculumCode: string
  curriculumName: string
  departmentId: string
  departmentName: string
  departmentCode: string
  facultyId?: string
  facultyName?: string
  appliedYear: number
  versionNumber: number
  totalSubjects: number
  totalCredits: number
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface CurriculumListResponse {
  curriculums: CurriculumListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CurriculumSubject {
  curriculumDetailId: string
  subjectId: string
  subjectCode: string
  subjectName: string
  credits: number
  theoryHours: number
  practiceHours: number
  isGeneral: boolean
  prerequisiteSubjectId: string | null
  prerequisiteSubjectCode: string | null
  prerequisiteSubjectName: string | null
}

export interface CurriculumSemester {
  semesterIndex: number
  semesterName: string
  subjects: CurriculumSubject[]
  totalCredits: number
  totalSubjects: number
}

export interface CurriculumAcademicYear {
  academicYearIndex: number
  academicYearName: string
  semesters: CurriculumSemester[]
  totalCredits: number
  totalSubjects: number
}

export interface CurriculumDetail {
  curriculumId: string
  curriculumCode: string
  curriculumName: string
  departmentId: string
  departmentName: string
  departmentCode: string
  appliedYear: number
  versionNumber: number
  academicYears: CurriculumAcademicYear[]
  totalCredits: number
  totalSubjects: number
  totalGeneralSubjects: number
  totalSpecializedSubjects: number
  createdAt: string
  updatedAt: string
}

export interface CreateCurriculumPayload {
  curriculumCode: string
  curriculumName: string
  departmentId: string
  appliedYear: number
  versionNumber: number
}

export interface UpdateCurriculumPayload {
  curriculumName?: string
  appliedYear?: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface FacultyOption {
  facultyId: string
  facultyName: string
}

export interface DepartmentOption {
  departmentId: string
  departmentName: string
}

export interface GetCurriculumsParams {
  pageNumber?: number
  pageSize?: number
  searchKeyword?: string
  facultyId?: string
  departmentId?: string
}

export interface CurriculumSubjectPosition {
  subjectId: string
  academicYearIndex: number
  semesterIndex: number
}

export interface SetCurriculumSubjectsPayload {
  subjects: CurriculumSubjectPosition[]
}

export interface RemoveCurriculumSubjectsPayload {
  curriculumDetailIds: string[]
}
