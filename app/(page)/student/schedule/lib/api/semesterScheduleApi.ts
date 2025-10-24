import { api } from "@/lib/api/client"
import { 
  SemesterScheduleResponse, 
  SemestersResponse, 
  SubjectsResponse 
} from "../types/semesterTypes"

export const semesterScheduleApi = {
  // Lấy thời khóa biểu cá nhân của sinh viên
  getPersonalSchedule: async (semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get(`/v1/schedules/student/personal?semesterId=${semesterId}`)
    return response.data
  },

  // Lấy thời khóa biểu theo môn học
  getScheduleBySubject: async (subjectId: string, semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get(`/v1/schedules/subject/${subjectId}?semesterId=${semesterId}`)
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
  }
}
