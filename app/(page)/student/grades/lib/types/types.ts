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
  finalGrade4: number | null
  gradeLetter: string | null
  status: string | null
}

export interface SemesterGrade {
  semesterId: string
  semesterName: string
  // Điểm tổng kết học kỳ
  semesterGPA10: number
  semesterGPA4: number
  semesterCredits: number
  // Điểm tích lũy đến học kỳ này
  cumulativeGPA10: number
  cumulativeGPA4: number
  cumulativeCredits: number
  cumulativeClassification: string
  grades: GradeItem[]
}

export interface CumulativeGradesData {
  cumulativeGPA10: number
  cumulativeGPA4: number
  totalCompletedCredits: number
  totalSubjects: number
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
  data: SemesterGrade
  errors: null | unknown
}

export interface GradesStatsData {
  averageGPA: number
  totalCredits: number
  totalSubjects: number
}

export interface GradesStatsResponse {
  success: boolean
  message: string
  data: GradesStatsData
  errors: null | unknown
}

export interface Course {
  code: string
  name: string
  credits: number
  finalGrade: number | null
  finalGrade10: number | null
  finalGrade4: number | null
  gradeLetter: string | null
  status: string | null
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