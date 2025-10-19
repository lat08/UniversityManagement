export const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 border-blue-300 text-blue-800",
    red: "bg-red-100 border-red-300 text-red-800", 
    green: "bg-green-100 border-green-300 text-green-800",
    yellow: "bg-yellow-100 border-yellow-300 text-yellow-800",
    purple: "bg-purple-100 border-purple-300 text-purple-800",
    pink: "bg-pink-100 border-pink-300 text-pink-800",
    indigo: "bg-indigo-100 border-indigo-300 text-indigo-800",
    orange: "bg-orange-100 border-orange-300 text-orange-800"
  }
  return colorMap[color] || "bg-gray-100 border-gray-300 text-gray-800"
}

export const getPeriodTime = (period: number): string => {
  const timeMap: Record<number, string> = {
    1: "7:00 - 8:30",
    2: "8:30 - 10:00", 
    3: "10:00 - 11:30",
    4: "11:30 - 13:00",
    5: "13:00 - 14:30",
    6: "14:30 - 16:00",
    7: "16:00 - 17:30",
    8: "17:30 - 19:00",
    9: "19:00 - 20:30",
    10: "20:30 - 22:00"
  }
  return timeMap[period] || "N/A"
}

export const getDayName = (dayOfWeek: number): string => {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
  return days[dayOfWeek - 2] || "N/A"
}

export const calculateGridPosition = (dayOfWeek: number, startPeriod: number, periodsCount: number) => {
  const gridRowStart = startPeriod
  const gridRowEnd = startPeriod + periodsCount
  const gridColumnStart = dayOfWeek - 1
  
  return {
    gridRowStart,
    gridRowEnd,
    gridColumnStart
  }
}
