export interface CourseSchedule {
  id: string
  name: string
  code: string
  room: string
  teacher: string
  dayOfWeek: number // 2-8 (Thứ 2 - Chủ nhật)
  startPeriod: number // 1-13
  periodsCount: number // Số tiết
  color: string // blue, red, green, etc.
}
