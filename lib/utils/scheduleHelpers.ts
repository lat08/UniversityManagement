import type { ScheduleTranslationFn } from '@/lib/types'

export const getColorByCourseType = (courseType?: string): string => {
  if (!courseType) return 'blue'
  const lowerType = courseType.toLowerCase()
  if (lowerType.includes('lý thuyết') || lowerType.includes('ly thuyet')) {
    return 'blue'
  }
  if (lowerType.includes('thực hành') || lowerType.includes('thuc hanh')) {
    return 'red'
  }
  return 'blue'
}

interface FormatWeekDisplayOptions {
  translate?: ScheduleTranslationFn
  formatDate?: (date: Date) => string
  emptyLabel?: string
}

export const formatWeekDisplay = (
  week: { weekNumber: number; startDate: string; endDate: string } | null,
  options?: FormatWeekDisplayOptions
) => {
  if (!week) {
    if (options?.translate) {
      return options.translate('selectWeek') || (options?.emptyLabel ?? '')
    }
    return options?.emptyLabel ?? 'Chọn tuần'
  }
  const formatDate = options?.formatDate ?? ((date: Date) =>
    date.toLocaleDateString('vi-VN'))
  const start = formatDate(new Date(week.startDate))
  const end = formatDate(new Date(week.endDate))
  if (options?.translate) {
    return options.translate('weekLabel', { number: week.weekNumber, start, end })
  }
  return `Tuần ${week.weekNumber} [từ ngày ${start} đến ngày ${end}]`
}

export const generateWeekDates = (startDate: string): Date[] => {
  const start = new Date(startDate)
  const dates = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  
  return dates
}

