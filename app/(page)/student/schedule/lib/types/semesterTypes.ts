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

export interface SemesterScheduleResponse {
  success: boolean
  data: SemesterScheduleItem[]
  message?: string
}
