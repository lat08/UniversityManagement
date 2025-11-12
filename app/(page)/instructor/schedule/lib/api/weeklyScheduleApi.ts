import { api } from "@/lib/api/client"
import { DAY_NAME_TO_NUMBER } from "@/lib/constants/schedule"
import { 
  InstructorWeeklyScheduleResponse,
  InstructorWeeklyScheduleItem,
  InstructorWeeklyScheduleApiItem,
  WeekResponse 
} from "../types/weeklyTypes"

const normalizeDayOfWeek = (day: string | number): number => {
  if (typeof day === 'number') {
    return day >= 2 && day <= 8 ? day : 2
  }
  return DAY_NAME_TO_NUMBER[day] || 2
}

const normalizeScheduleItem = (item: InstructorWeeklyScheduleApiItem): InstructorWeeklyScheduleItem => {
  const numberOfPeriods = item.endPeriod - item.startPeriod + 1
  
  return {
    courseClassId: item.courseClassId,
    subjectId: item.courseClassId,
    subjectCode: item.subjectCode,
    subjectName: item.subjectName,
    courseGroup: null,
    credits: 0,
    classCode: item.classCode || item.className || null,
    dayOfWeek: normalizeDayOfWeek(item.dayOfWeek),
    startPeriod: item.startPeriod,
    numberOfPeriods,
    roomCode: item.roomCode,
    roomName: item.roomName,
    courseType: item.courseType,
    scheduleStartDate: item.date,
    scheduleEndDate: item.date,
    note: item.note,
    date: item.date,
  }
}

export const instructorWeeklyScheduleApi = {
  getWeeklySchedule: async (
    semesterId: string, 
    weekNumber: number
  ): Promise<{ success: boolean; data: InstructorWeeklyScheduleItem[]; message?: string }> => {
    const response = await api.get<InstructorWeeklyScheduleResponse>(
      `/v1/instructor-schedule/week-schedule?semesterId=${semesterId}&weekNumber=${weekNumber}`
    )
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return {
        success: true,
        data: response.data.data.map(normalizeScheduleItem),
        message: response.data.message
      }
    }
    
    return { success: false, data: [], message: response.data.message }
  },

  getWeeklyScheduleBySubject: async (
    semesterId: string, 
    weekNumber: number, 
    subjectId: string
  ): Promise<{ success: boolean; data: InstructorWeeklyScheduleItem[]; message?: string }> => {
    const response = await api.get<InstructorWeeklyScheduleResponse>(
      `/v1/instructor-schedule/subject-week-schedule?semesterId=${semesterId}&weekNumber=${weekNumber}&subjectId=${subjectId}`
    )
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return {
        success: true,
        data: response.data.data.map(normalizeScheduleItem),
        message: response.data.message
      }
    }
    
    return { success: false, data: [], message: response.data.message }
  },

  getWeeks: async (semesterId: string): Promise<WeekResponse> => {
    const response = await api.get<WeekResponse>(`/v1/enrollments/semesters/${semesterId}/weeks`)
    return response.data
  },

  exportWeeklyPdf: async (semesterId: string, weekNumber: number): Promise<Blob> => {
    const response = await api.get(`/v1/instructor-schedule/export-pdf?semesterId=${semesterId}&weekNumber=${weekNumber}`, {
      responseType: 'blob'
    })
    return response.data
  }
}

