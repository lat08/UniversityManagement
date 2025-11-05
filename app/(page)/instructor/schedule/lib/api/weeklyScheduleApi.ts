import { api } from "@/lib/api/client"
import { DAY_NAME_TO_NUMBER } from "@/lib/constants/schedule"
import { 
  InstructorWeeklyScheduleResponse,
  InstructorWeeklyScheduleItem,
  InstructorWeeklyScheduleApiItem,
  WeekResponse 
} from "../types/weeklyTypes"

const convertDayOfWeekToNumber = (dayName: string): number => {
  return DAY_NAME_TO_NUMBER[dayName] || 2
}

// Helper function to transform API response to component format
const transformScheduleData = (apiData: InstructorWeeklyScheduleApiItem[]): InstructorWeeklyScheduleItem[] => {
  return apiData.map(item => ({
    courseClassId: item.courseClassId,
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

