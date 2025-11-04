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

const extractSchedulesData = (apiResponse: InstructorSemesterScheduleResponse): InstructorSemesterScheduleApiItem[] => {
  if (Array.isArray(apiResponse.data)) {
    return apiResponse.data
  }
  
  if (apiResponse.data && typeof apiResponse.data === 'object') {
    if ('schedules' in apiResponse.data) {
      const dataObj = apiResponse.data as { schedules: InstructorSemesterScheduleApiItem[] }
      return dataObj.schedules || []
    }
    if ('Schedules' in apiResponse.data) {
      const dataObj = apiResponse.data as InstructorSemesterScheduleInfoDto
      return dataObj.Schedules || []
    }
  }
  
  return []
}

const processScheduleResponse = (apiResponse: InstructorSemesterScheduleResponse) => ({
  success: apiResponse.success,
  data: transformScheduleData(extractSchedulesData(apiResponse)),
  message: apiResponse.message
})

export const instructorSemesterScheduleApi = {
  getInstructorSchedule: async (semesterId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/semester-schedule?semesterId=${semesterId}`)
    return processScheduleResponse(response.data)
  },

  getScheduleBySubject: async (semesterId: string, subjectId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/semester-schedule?SemesterId=${semesterId}&SubjectId=${subjectId}`)
    return processScheduleResponse(response.data)
  },

}

