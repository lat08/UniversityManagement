import { api } from "@/lib/api/client"
import { 
  SemesterScheduleResponse, 
  SemestersResponse, 
  SubjectsResponse 
} from "../types/semesterTypes"

export const semesterScheduleApi = {
  // Lấy thời khóa biểu cá nhân của sinh viên
  getPersonalSchedule: async (semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get(`/v1/students/me/schedules?semesterId=${semesterId}`)
    return response.data
  },

  // Lấy thời khóa biểu theo môn học
  getScheduleBySubject: async (subjectId: string, semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get(`/v1/subjects/${subjectId}/schedules?semesterId=${semesterId}`)
    return response.data
  },

  // Lấy danh sách học kỳ
  getSemesters: async (): Promise<SemestersResponse> => {
    const response = await api.get('/v1/common/semesters')
    return response.data
  },

  // Lấy danh sách môn học
  getSubjects: async (): Promise<SubjectsResponse> => {
    const response = await api.get('/v1/common/subjects')
    return response.data
  }
}
