import { api } from "@/lib/api/client"
import { 
  InstructorSemesterScheduleResponse,
  InstructorSemesterScheduleItem,
  InstructorSemesterScheduleApiItem,
  SemestersResponse, 
  SubjectsResponse 
} from "../types/semesterTypes"

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
const transformScheduleData = (apiData: InstructorSemesterScheduleApiItem[]): InstructorSemesterScheduleItem[] => {
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
  }))
}

export const instructorSemesterScheduleApi = {
  // Lấy thời khóa biểu giảng viên theo học kỳ
  getInstructorSchedule: async (semesterId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/week-schedule?semesterId=${semesterId}`)
    const apiResponse: InstructorSemesterScheduleResponse = response.data
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(apiResponse.data),
      message: apiResponse.message
    }
  },

  // Lọc thời khóa biểu giảng viên theo môn học cụ thể
  getScheduleBySubject: async (semesterId: string, subjectId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/subject-week-schedule?semesterId=${semesterId}&subjectId=${subjectId}`)
    const apiResponse: InstructorSemesterScheduleResponse = response.data
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(apiResponse.data),
      message: apiResponse.message
    }
  },

  // Lấy danh sách học kỳ
  getSemesters: async (): Promise<SemestersResponse> => {
    const response = await api.get('/v1/common/semesters')
    return response.data
  },

  // Lấy danh sách môn học của giảng viên
  getSubjects: async (): Promise<SubjectsResponse> => {
    const response = await api.get('/v1/common/subjects')
    return response.data
  }
}

