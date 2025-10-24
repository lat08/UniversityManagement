import { api } from "@/lib/api/client"
import { 
  WeeklyScheduleResponse, 
  SemestersResponse, 
  SubjectsResponse,
  WeekResponse 
} from "../types/weeklyTypes"

export const weeklyScheduleApi = {
  // Lấy thời khóa biểu theo tuần
  getWeeklySchedule: async (semesterId: string, weekNumber: number): Promise<WeeklyScheduleResponse> => {
    const response = await api.get(`/v1/week-schedule/week-schedule?semesterId=${semesterId}&weekNumber=${weekNumber}`)
    return response.data
  },

  // Lấy thời khóa biểu theo tuần và môn học
  getWeeklyScheduleBySubject: async (semesterId: string, weekNumber: number, subjectId: string): Promise<WeeklyScheduleResponse> => {
    const response = await api.get(`/v1/week-schedule/subject-week-schedule?semesterId=${semesterId}&weekNumber=${weekNumber}&subjectId=${subjectId}`)
    return response.data
  },

  // Lấy danh sách học kỳ
  getSemesters: async (): Promise<SemestersResponse> => {
    const response = await api.get('/v1/Common/semesters')
    return response.data
  },

  // Lấy danh sách môn học
  getSubjects: async (): Promise<SubjectsResponse> => {
    const response = await api.get('/v1/Common/subjects')
    return response.data
  },

  // Tạo danh sách tuần dựa trên học kỳ (tạm thời sử dụng logic frontend)
  getWeeks: async (semesterId: string): Promise<WeekResponse> => {
    // Tạm thời trả về danh sách tuần mẫu
    // TODO: Implement API endpoint để lấy danh sách tuần từ backend
    const weeks = [
      { weekNumber: 1, startDate: "2025-09-01", endDate: "2025-09-07" },
      { weekNumber: 2, startDate: "2025-09-08", endDate: "2025-09-14" },
      { weekNumber: 3, startDate: "2025-09-15", endDate: "2025-09-21" },
      { weekNumber: 4, startDate: "2025-09-22", endDate: "2025-09-28" },
      { weekNumber: 5, startDate: "2025-09-29", endDate: "2025-10-05" },
      { weekNumber: 6, startDate: "2025-10-06", endDate: "2025-10-12" },
      { weekNumber: 7, startDate: "2025-10-13", endDate: "2025-10-19" },
      { weekNumber: 8, startDate: "2025-10-20", endDate: "2025-10-26" },
      { weekNumber: 9, startDate: "2025-10-27", endDate: "2025-11-02" },
      { weekNumber: 10, startDate: "2025-11-03", endDate: "2025-11-09" },
      { weekNumber: 11, startDate: "2025-11-10", endDate: "2025-11-16" },
      { weekNumber: 12, startDate: "2025-11-17", endDate: "2025-11-23" },
      { weekNumber: 13, startDate: "2025-11-24", endDate: "2025-11-30" },
      { weekNumber: 14, startDate: "2025-12-01", endDate: "2025-12-07" },
      { weekNumber: 15, startDate: "2025-12-08", endDate: "2025-12-14" },
      { weekNumber: 16, startDate: "2025-12-15", endDate: "2025-12-21" },
    ]
    
    return {
      success: true,
      data: weeks,
      message: "Danh sách tuần học"
    }
  }
}
