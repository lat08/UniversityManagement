import { api } from "@/lib/api/client"
import { DAY_NAME_TO_NUMBER } from "@/lib/constants/schedule"
import { 
  WeeklyScheduleResponse,
  WeekResponse,
  WeeklyScheduleItem
} from "../types/weeklyTypes"

interface ApiWeeklyScheduleItem {
  subjectId?: string
  subjectCode: string
  subjectName: string
  courseGroup?: string | null
  credits?: number
  classCode?: string | null
  dayOfWeek: string | number
  startPeriod: number
  endPeriod?: number
  numberOfPeriods?: number
  roomCode: string
  roomName?: string
  instructorName: string
  courseType: string
  scheduleStartDate?: string
  scheduleEndDate?: string
  note?: string
  date?: string
}

const normalizeDayOfWeek = (day: string | number): number => {
  if (typeof day === 'number') {
    return day >= 2 && day <= 8 ? day : 2
  }
  return DAY_NAME_TO_NUMBER[day] || 2
}

const normalizeScheduleItem = (item: ApiWeeklyScheduleItem): WeeklyScheduleItem => {
  const numberOfPeriods = item.numberOfPeriods || 
    (item.endPeriod ? item.endPeriod - item.startPeriod + 1 : 1)
  
  return {
    subjectId: item.subjectId,
    subjectCode: item.subjectCode,
    subjectName: item.subjectName,
    courseGroup: item.courseGroup ?? null,
    credits: item.credits ?? 0,
    classCode: item.classCode ?? null,
    dayOfWeek: normalizeDayOfWeek(item.dayOfWeek),
    startPeriod: item.startPeriod,
    numberOfPeriods,
    roomCode: item.roomCode,
    roomName: item.roomName,
    instructorName: item.instructorName,
    courseType: item.courseType ?? '',
    scheduleStartDate: item.scheduleStartDate ?? item.date ?? '',
    scheduleEndDate: item.scheduleEndDate ?? item.date ?? '',
    note: item.note,
    date: item.date ?? ''
  }
}

export const weeklyScheduleApi = {
  getWeeklySchedule: async (semesterId: string, weekNumber: number): Promise<WeeklyScheduleResponse> => {
    const response = await api.get<{ success: boolean; data: ApiWeeklyScheduleItem[]; message?: string }>(
      `/v1/student-schedule/weekly?semesterId=${semesterId}&weekNumber=${weekNumber}`
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
  ): Promise<WeeklyScheduleResponse> => {
    const response = await api.get<{ success: boolean; data: ApiWeeklyScheduleItem[]; message?: string }>(
      `/v1/student-schedule/weekly/subject?semesterId=${semesterId}&weekNumber=${weekNumber}&subjectId=${subjectId}`
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


  // Export PDF thời khóa biểu theo tuần
  exportWeeklySchedulePDF: async (semesterId: string, weekNumber: number): Promise<void> => {
    if (!semesterId || !weekNumber) {
      throw new Error('Vui lòng chọn học kỳ và tuần học')
    }
    
    const response = await api.get(`/v1/student-schedule/weekly/export-pdf?semesterId=${semesterId}&weekNumber=${weekNumber}`, {
      responseType: 'blob',
      headers: {
        'Accept': '*/*',
      }
    })
    
    // Tạo URL từ blob và tải xuống
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Lấy tên file từ header hoặc đặt tên mặc định
    const contentDisposition = response.headers['content-disposition']
    let fileName = 'ThoiKhoaBieuTuan.pdf'
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '')
      }
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Export PDF thời khóa biểu theo môn học
  exportSubjectSchedulePDF: async (semesterId: string, weekNumber: number, subjectId: string): Promise<void> => {
    if (!semesterId || !weekNumber || !subjectId) {
      throw new Error('Vui lòng chọn học kỳ, tuần học và môn học')
    }
    
    const response = await api.get(`/v1/student-schedule/weekly/subject/export-pdf?semesterId=${semesterId}&weekNumber=${weekNumber}&subjectId=${subjectId}`, {
      responseType: 'blob',
      headers: {
        'Accept': '*/*',
      }
    })
    
    // Tạo URL từ blob và tải xuống
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Lấy tên file từ header hoặc đặt tên mặc định
    const contentDisposition = response.headers['content-disposition']
    let fileName = 'ThoiKhoaBieuMonHoc.pdf'
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '')
      }
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  getWeeks: async (semesterId: string): Promise<WeekResponse> => {
    const response = await api.get<WeekResponse>(`/v1/enrollments/semesters/${semesterId}/weeks`)
    return response.data
  }
}
