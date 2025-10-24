export interface SemesterScheduleItem {
  subjectId?: string
  subjectCode: string
  subjectName: string
  courseGroup: string | null
  credits: number
  classCode: string | null
  dayOfWeek: number
  startPeriod: number
  numberOfPeriods: number
  roomCode: string
  roomName?: string
  instructorName: string
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

export interface SemesterScheduleResponse {
  success: boolean
  data: SemesterScheduleItem[]
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
