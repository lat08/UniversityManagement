import { api } from "@/lib/api/client"
import { 
  InstructorWeeklyScheduleResponse,
  InstructorWeeklyScheduleItem,
  InstructorWeeklyScheduleApiItem,
  WeekResponse 
} from "../types/weeklyTypes"

// Helper function to convert day name to number
const convertDayOfWeekToNumber = (dayName: string): number => {
  const dayMap: Record<string, number> = {
    "Thứ 2": 2,
    "Thứ 3": 3,
    "Thứ 4": 4,
    "Thứ 5": 5,
    "Thứ 6": 6,
    "Thứ 7": 7,
    "Chủ nhật": 8,
  }
  return dayMap[dayName] || 2
}

// Helper function to transform API response to component format
const transformScheduleData = (apiData: InstructorWeeklyScheduleApiItem[]): InstructorWeeklyScheduleItem[] => {
  return apiData.map(item => ({
    subjectId: item.courseClassId,
    subjectCode: item.subjectCode,
    subjectName: item.subjectName,
    courseGroup: null,
    credits: 0,
    classCode: item.classCode || item.className || null,
    dayOfWeek: convertDayOfWeekToNumber(item.dayOfWeek),
    startPeriod: item.startPeriod,
    numberOfPeriods: item.endPeriod - item.startPeriod + 1,
    roomCode: item.roomCode,
    roomName: item.roomName,
    courseType: item.courseType,
    scheduleStartDate: item.date,
    scheduleEndDate: item.date,
    note: item.note,
    date: item.date,
  }))
}

export const instructorWeeklyScheduleApi = {
  // Lấy thời khóa biểu giảng viên theo tuần
  getWeeklySchedule: async (semesterId: string, weekNumber: number): Promise<{ success: boolean; data: InstructorWeeklyScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/week-schedule?semesterId=${semesterId}&weekNumber=${weekNumber}`)
    const apiResponse: InstructorWeeklyScheduleResponse = response.data
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(apiResponse.data),
      message: apiResponse.message
    }
  },

  // Lọc thời khóa biểu giảng viên theo môn học cụ thể
  getWeeklyScheduleBySubject: async (semesterId: string, weekNumber: number, subjectId: string): Promise<{ success: boolean; data: InstructorWeeklyScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/subject-week-schedule?semesterId=${semesterId}&weekNumber=${weekNumber}&subjectId=${subjectId}`)
    const apiResponse: InstructorWeeklyScheduleResponse = response.data
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(apiResponse.data),
      message: apiResponse.message
    }
  },


  getWeeks: async (semesterId: string): Promise<WeekResponse> => {
    const response = await api.get(`/v1/enrollments/semesters/${semesterId}/weeks`)
    return response.data
  }
}

