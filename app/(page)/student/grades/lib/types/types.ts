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
