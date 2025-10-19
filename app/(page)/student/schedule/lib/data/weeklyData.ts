import { CourseSchedule } from '../types/weeklyTypes'

export const sampleSchedule: CourseSchedule[] = [
  {
    id: "1",
    name: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3)",
    code: "TV114",
    room: "D04-06",
    teacher: "Trần Thanh Tuyền",
    dayOfWeek: 4, // Thứ 4
    startPeriod: 1,
    periodsCount: 5,
    color: "blue",
  },
  {
    id: "2",
    name: "QUẢN LÝ DỰ ÁN CÔNG NGHỆ THÔNG TIN (3) (CS3545)",
    code: "TV114",
    room: "D04501-Audi",
    teacher: "Trần Thanh Tuyền",
    dayOfWeek: 5, // Thứ 5
    startPeriod: 6,
    periodsCount: 4,
    color: "red",
  },
]
