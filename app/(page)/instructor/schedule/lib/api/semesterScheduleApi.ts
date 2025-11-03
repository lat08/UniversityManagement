import { api } from "@/lib/api/client"
import { 
  InstructorSemesterScheduleResponse,
  InstructorSemesterScheduleItem,
  InstructorSemesterScheduleApiItem,
  InstructorSemesterScheduleInfoDto,
} from "../types/semesterTypes"

// Helper function to transform API response to component format
// API returns data in format: { subjectCode, subjectName, courseGroup, credits, classCode, dayOfWeek, startPeriod, numberOfPeriods, roomCode, scheduleStartDate, scheduleEndDate, instructorName, courseType, note }
const transformScheduleData = (apiData: InstructorSemesterScheduleApiItem[]): InstructorSemesterScheduleItem[] => {
  return apiData.map(item => ({
    subjectId: item.subjectId || undefined,
    subjectCode: item.subjectCode || '',
    subjectName: item.subjectName || '',
    courseGroup: item.courseGroup || null,
    credits: item.credits || 0,
    classCode: item.classCode || null,
    dayOfWeek: typeof item.dayOfWeek === 'number' ? item.dayOfWeek : parseInt(item.dayOfWeek) || 2,
    startPeriod: item.startPeriod || 0,
    numberOfPeriods: item.numberOfPeriods || 1,
    roomCode: item.roomCode || '',
    roomName: item.roomName || undefined,
    courseType: item.courseType || undefined,
    scheduleStartDate: item.scheduleStartDate || '',
    scheduleEndDate: item.scheduleEndDate || '',
    note: item.note || undefined,
  }))
}

export const instructorSemesterScheduleApi = {
  getInstructorSchedule: async (semesterId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/semester-schedule?semesterId=${semesterId}`)
    const apiResponse: InstructorSemesterScheduleResponse = response.data
    
    let schedulesData: InstructorSemesterScheduleApiItem[] = []
    
    if (Array.isArray(apiResponse.data)) {
      schedulesData = apiResponse.data
    } else if (apiResponse.data && typeof apiResponse.data === 'object') {
      if ('schedules' in apiResponse.data) {
        const dataObj = apiResponse.data as { schedules: InstructorSemesterScheduleApiItem[] }
        schedulesData = dataObj.schedules || []
      } else if ('Schedules' in apiResponse.data) {
        const dataObj = apiResponse.data as InstructorSemesterScheduleInfoDto
        schedulesData = dataObj.Schedules || []
      }
    }
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(schedulesData),
      message: apiResponse.message
    }
  },

  getScheduleBySubject: async (semesterId: string, subjectId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/semester-schedule?SemesterId=${semesterId}&SubjectId=${subjectId}`)
    const apiResponse: InstructorSemesterScheduleResponse = response.data
    
    let schedulesData: InstructorSemesterScheduleApiItem[] = []
    
    if (Array.isArray(apiResponse.data)) {
      schedulesData = apiResponse.data
    } else if (apiResponse.data && typeof apiResponse.data === 'object') {
      if ('schedules' in apiResponse.data) {
        const dataObj = apiResponse.data as { schedules: InstructorSemesterScheduleApiItem[] }
        schedulesData = dataObj.schedules || []
      } else if ('Schedules' in apiResponse.data) {
        const dataObj = apiResponse.data as InstructorSemesterScheduleInfoDto
        schedulesData = dataObj.Schedules || []
      }
    }
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(schedulesData),
      message: apiResponse.message
    }
  },

}

