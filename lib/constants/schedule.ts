export type DayOfWeekKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export interface DayOfWeekConfig {
  value: number
  key: DayOfWeekKey
  label: string
}

export const DAYS_OF_WEEK: DayOfWeekConfig[] = [
  { label: "Thứ 2", key: "monday", value: 2 },
  { label: "Thứ 3", key: "tuesday", value: 3 },
  { label: "Thứ 4", key: "wednesday", value: 4 },
  { label: "Thứ 5", key: "thursday", value: 5 },
  { label: "Thứ 6", key: "friday", value: 6 },
  { label: "Thứ 7", key: "saturday", value: 7 },
  { label: "Chủ nhật", key: "sunday", value: 8 },
]

export const PERIODS = Array.from({ length: 13 }, (_, i) => i + 1)

export const PERIOD_TIMES = [
  { period: 1, time: "07:15" },
  { period: 2, time: "08:05" },
  { period: 3, time: "09:10" },
  { period: 4, time: "10:00" },
  { period: 5, time: "10:50" },
  { period: 6, time: "13:30" },
  { period: 7, time: "14:20" },
  { period: 8, time: "15:20" },
  { period: 9, time: "16:10" },
  { period: 10, time: "17:30" },
  { period: 11, time: "18:20" },
  { period: 12, time: "19:20" },
  { period: 13, time: "20:10" },
]

export const DAY_NAME_TO_NUMBER: Record<string, number> = {
  "Thứ 2": 2,
  "Thứ 3": 3,
  "Thứ 4": 4,
  "Thứ 5": 5,
  "Thứ 6": 6,
  "Thứ 7": 7,
  "Chủ Nhật": 8,
  "Chủ nhật": 8,
  "CN": 8,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
  Sunday: 8,
  Mon: 2,
  Tue: 3,
  Wed: 4,
  Thu: 5,
  Fri: 6,
  Sat: 7,
  Sun: 8,
}

