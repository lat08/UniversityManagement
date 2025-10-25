// API Response structure from backend
export interface InstructorWeeklyScheduleApiItem {
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
export interface InstructorWeeklyScheduleItem {
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
  date: string
}

export interface Week {
  weekNumber: number
  startDate: string
  endDate: string
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

export interface InstructorWeeklyScheduleResponse {
  success: boolean
  data: InstructorWeeklyScheduleApiItem[]  // API returns ApiItem format
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

export interface WeekResponse {
  success: boolean
  data: Week[]
  message?: string
}

