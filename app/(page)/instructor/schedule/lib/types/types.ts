export interface InstructorSemesterCourse {
  id: string
  courseCode: string
  courseName: string
  classGroup: string
  credits: number
  classCode: string
  dayOfWeek: number
  startPeriod: number
  periodCount: number
  room: string
  timeSlot: string
}

export interface InstructorSchedule {
  id: string
  name: string
  code: string
  room: string
  class: string // Lớp học
  dayOfWeek: number // 2-8 (Thứ 2 - Chủ nhật)
  startPeriod: number // 1-13
  periodsCount: number // Số tiết
  color: string // blue, red, green, etc.
  documents?: string[] // Tài liệu đã gắn
}
