// API Response Types
export interface GradeItem {
  semesterId: string
  semesterName: string
  subjectId: string
  subjectCode: string
  subjectName: string
  credits: number
  midtermGrade: number | null
  finalGrade: number | null
  attendanceGrade: number | null
  finalGrade10: number | null
  finalGrade4: number
  gradeLetter: string
  status: string
}

export interface SemesterGrade {
  semesterId: string
  semesterName: string
  semesterGPA10: number
  semesterGPA4: number
  semesterClassification: string
  grades: GradeItem[]
}

export interface CumulativeGradesData {
  cumulativeGPA10: number
  cumulativeGPA4: number
  totalCompletedCredits: number
  semesters: SemesterGrade[]
}

export interface CumulativeGradesResponse {
  success: boolean
  message: string
  data: CumulativeGradesData
  errors: null | unknown
}

export interface SemesterGradeResponse {
  success: boolean
  message: string
  data: {
    semesterId: string
    semesterName: string
    semesterGPA10: number
    semesterGPA4: number
    semesterClassification: string
    grades: GradeItem[]
  }
  errors: null | unknown
}

// UI Display Types
export interface Course {
  code: string
  name: string
  credits: number
  score10: number | null
  status: string
}

export interface SemesterStats {
  semesterGPA10: string
  semesterGPA4: string
  totalCredits: number
  classification: string
}

export interface CourseComponent {
  stt: number
  name: string
  weight: number
  score: number
}

export interface CourseDetail {
  name: string
  components: CourseComponent[]
}

export interface SemesterData {
  id: string
  semester: string
  courses: Course[]
}