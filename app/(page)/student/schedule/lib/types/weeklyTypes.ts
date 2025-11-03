export interface WeeklyScheduleItem {
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
  date: string
}

export interface Week {
  weekNumber: number
  startDate: string
  endDate: string
}

export interface WeeklyScheduleResponse {
  success: boolean
  data: WeeklyScheduleItem[]
  message?: string
}

export interface WeekResponse {
  success: boolean
  data: Week[]
  message?: string
}
