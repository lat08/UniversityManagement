import { api } from "@/lib/api/client"
import { 
  InstructorSemesterScheduleResponse,
  InstructorSemesterScheduleItem,
  InstructorSemesterScheduleApiItem,
  InstructorSemesterScheduleInfoDto,
  SemestersResponse, 
  SubjectsResponse 
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
  // Lấy thời khóa biểu giảng viên theo học kỳ
  getInstructorSchedule: async (semesterId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/semester-schedule?semesterId=${semesterId}`)
    const apiResponse: InstructorSemesterScheduleResponse = response.data
    
    // API returns { success, data: { Semester, ScheduleType, Schedules: [...] } }
    // or { success, data: [...] } directly
    let schedulesData: InstructorSemesterScheduleApiItem[] = []
    
    if (Array.isArray(apiResponse.data)) {
      // If data is directly an array
      schedulesData = apiResponse.data
    } else if (apiResponse.data && typeof apiResponse.data === 'object' && 'Schedules' in apiResponse.data) {
      // If data is an object with Schedules property
      const dataObj = apiResponse.data as InstructorSemesterScheduleInfoDto
      schedulesData = dataObj.Schedules || []
    }
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(schedulesData),
      message: apiResponse.message
    }
  },

  // Lọc thời khóa biểu giảng viên theo môn học cụ thể
  getScheduleBySubject: async (semesterId: string, subjectId: string): Promise<{ success: boolean; data: InstructorSemesterScheduleItem[]; message?: string }> => {
    const response = await api.get(`/v1/instructor-schedule/subject-week-schedule?semesterId=${semesterId}&subjectId=${subjectId}`)
    const apiResponse: InstructorSemesterScheduleResponse = response.data
    
    // API returns { success, data: { Semester, ScheduleType, Schedules: [...] } }
    // or { success, data: [...] } directly
    let schedulesData: InstructorSemesterScheduleApiItem[] = []
    
    if (Array.isArray(apiResponse.data)) {
      // If data is directly an array
      schedulesData = apiResponse.data
    } else if (apiResponse.data && typeof apiResponse.data === 'object' && 'Schedules' in apiResponse.data) {
      // If data is an object with Schedules property
      const dataObj = apiResponse.data as InstructorSemesterScheduleInfoDto
      schedulesData = dataObj.Schedules || []
    }
    
    return {
      success: apiResponse.success,
      data: transformScheduleData(schedulesData),
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

