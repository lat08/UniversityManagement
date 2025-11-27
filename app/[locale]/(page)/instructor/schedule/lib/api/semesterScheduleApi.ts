import { api } from "@/lib/api/client"
import { DAY_NAME_TO_NUMBER } from "@/lib/constants/schedule"
import { 
  InstructorSemesterScheduleResponse,
  InstructorSemesterScheduleItem,
  InstructorSemesterScheduleApiItem,
  InstructorSemesterScheduleInfoDto,
} from "../types/semesterTypes"

const normalizeDayOfWeek = (day: string | number): number => {
  if (typeof day === 'number') {
    return day >= 2 && day <= 8 ? day : 2
  }
  return DAY_NAME_TO_NUMBER[day] || 2
}

const normalizeScheduleItem = (item: InstructorSemesterScheduleApiItem): InstructorSemesterScheduleItem => ({
  subjectId: item.subjectId,
  subjectCode: item.subjectCode || '',
  subjectName: item.subjectName || '',
  courseGroup: item.courseGroup ?? null,
  credits: item.credits ?? 0,
  classCode: item.classCode ?? null,
  dayOfWeek: normalizeDayOfWeek(item.dayOfWeek),
  startPeriod: item.startPeriod || 0,
  numberOfPeriods: item.numberOfPeriods || 1,
  roomCode: item.roomCode || '',
  roomName: item.roomName,
  courseType: item.courseType,
  scheduleStartDate: item.scheduleStartDate || '',
  scheduleEndDate: item.scheduleEndDate || '',
  note: item.note,
})

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
  data: extractSchedulesData(apiResponse).map(normalizeScheduleItem),
  message: apiResponse.message
})

export const instructorSemesterScheduleApi = {
  getInstructorSchedule: async (
    semesterId: string
  ): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get<InstructorSemesterScheduleResponse>(
      `/v1/instructor-schedule/semester-schedule?semesterId=${semesterId}`
    )
    return processScheduleResponse(response.data)
  },

  getScheduleBySubject: async (
    semesterId: string, 
    subjectId: string
  ): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get<InstructorSemesterScheduleResponse>(
      `/v1/instructor-schedule/semester-schedule?SemesterId=${semesterId}&SubjectId=${subjectId}`
    )
    return processScheduleResponse(response.data)
  },

  exportSemesterPdf: async (semesterId: string, subjectId?: string): Promise<Blob> => {
    const params = new URLSearchParams({ semesterId })
    if (subjectId) {
      params.append('subjectId', subjectId)
    }
    const response = await api.get(`/v1/instructor-schedule/export-semester-pdf?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  }
}

