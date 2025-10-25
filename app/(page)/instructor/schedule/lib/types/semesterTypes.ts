// API Response structure from backend
export interface InstructorSemesterScheduleApiItem {
  courseClassId: string
  dayOfWeek: string  // "Thứ 2", "Thứ 3", etc.
  date: string
  startPeriod: number
  endPeriod: number
  subjectName: string
  subjectCode: string
  className: string
  classCode: string
  roomName: string
  roomCode: string
  courseType: string
  note: string
  documents: string[]
}

// Transformed structure for component use
export interface InstructorSemesterScheduleItem {
  subjectId?: string
  subjectCode: string
  subjectName: string
  courseGroup: string | null
  credits: number
  classCode: string | null
  dayOfWeek: number  // Converted to number (2-8)
  startPeriod: number
  numberOfPeriods: number  // Calculated from endPeriod - startPeriod + 1
  roomCode: string
  roomName?: string
  courseType?: string
  scheduleStartDate: string
  scheduleEndDate: string
  note?: string
}

export interface Semester {
  semesterId: string
  semesterName: string
  semesterType: string
  startDate: string
  endDate: string
  status: string
}

export interface Subject {
  subjectId: string
  subjectCode: string
  subjectName: string
}

export interface InstructorSemesterScheduleResponse {
  success: boolean
  data: InstructorSemesterScheduleApiItem[]  // API returns ApiItem format
  message?: string
}

export interface SemestersResponse {
  success: boolean
  data: Semester[]
  message?: string
}

export interface SubjectsResponse {
  success: boolean
  data: Subject[]
  message?: string
}

