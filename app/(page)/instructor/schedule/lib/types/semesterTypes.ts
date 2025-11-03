// API Response structure from backend
export interface InstructorSemesterScheduleApiItem {
  courseClassId?: string
  dayOfWeek: string | number  // "Thứ 2", "Thứ 3", etc. or number
  date?: string
  startPeriod: number
  endPeriod?: number
  numberOfPeriods?: number
  subjectName: string
  subjectCode: string
  className?: string
  classCode?: string
  roomName?: string
  roomCode: string
  courseType?: string
  note?: string
  documents?: string[]
  courseGroup?: string
  credits?: number
  scheduleStartDate?: string
  scheduleEndDate?: string
  instructorName?: string
  subjectId?: string
}

// API Response wrapper structure
export interface InstructorSemesterScheduleInfoDto {
  Semester?: {
    SemesterId: string
    SemesterName: string
    SemesterType: string
    StartDate: string
    EndDate: string
    Status: string
    AcademicYearName: string
  }
  ScheduleType?: string
  Schedules?: InstructorSemesterScheduleApiItem[]
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

export interface InstructorSemesterScheduleResponse {
  success: boolean
  data: InstructorSemesterScheduleInfoDto | InstructorSemesterScheduleApiItem[]
  message?: string
}

