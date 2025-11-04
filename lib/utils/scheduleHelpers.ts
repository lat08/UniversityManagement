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

export const formatWeekDisplay = (week: { weekNumber: number; startDate: string; endDate: string } | null) => {
  if (!week) return "Chọn tuần"
  const start = new Date(week.startDate).toLocaleDateString('vi-VN')
  const end = new Date(week.endDate).toLocaleDateString('vi-VN')
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

