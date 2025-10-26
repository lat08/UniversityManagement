import { api } from "@/lib/api/client"
import { 
  WeeklyScheduleResponse, 
  SemestersResponse, 
  SubjectsResponse
} from "../types/weeklyTypes"

// Helper function to map day of week string to number
const mapDayOfWeekToNumber = (dayString: string): number => {
  const dayMap: { [key: string]: number } = {
    "Thứ 2": 2,
    "Thứ 3": 3,
    "Thứ 4": 4,
    "Thứ 5": 5,
    "Thứ 6": 6,
    "Thứ 7": 7,
    "Chủ Nhật": 8,
    "CN": 8
  }
  return dayMap[dayString] || 2
}

export const weeklyScheduleApi = {
  // Lấy thời khóa biểu theo tuần
  getWeeklySchedule: async (semesterId: string, weekNumber: number): Promise<WeeklyScheduleResponse> => {
    const response = await api.get(`/v1/schedules/weekly?semesterId=${semesterId}&weekNumber=${weekNumber}`)
    
    // Transform the API response to match expected format
    if (response.data.success && response.data.data) {
      const transformedData = response.data.data.map((item: {
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
      }) => ({
        subjectId: item.subjectId,
        subjectCode: item.subjectCode,
        subjectName: item.subjectName,
        courseGroup: item.courseGroup || null,
        credits: item.credits || 0,
        classCode: item.classCode || null,
        dayOfWeek: typeof item.dayOfWeek === 'string' ? mapDayOfWeekToNumber(item.dayOfWeek) : item.dayOfWeek,
        startPeriod: item.startPeriod,
        numberOfPeriods: item.endPeriod ? (item.endPeriod - item.startPeriod + 1) : (item.numberOfPeriods || 1),
        roomCode: item.roomCode,
        roomName: item.roomName,
        instructorName: item.instructorName,
        courseType: item.courseType,
        scheduleStartDate: item.scheduleStartDate || item.date,
        scheduleEndDate: item.scheduleEndDate || item.date,
        note: item.note,
        date: item.date
      }))
      
      return {
        success: true,
        data: transformedData,
        message: response.data.message
      }
    }
    
    return response.data
  },

  // Lấy thời khóa biểu theo tuần và môn học
  getWeeklyScheduleBySubject: async (semesterId: string, weekNumber: number, subjectId: string): Promise<WeeklyScheduleResponse> => {
    const response = await api.get(`/v1/schedules/subject-week-schedule?semesterId=${semesterId}&weekNumber=${weekNumber}&subjectId=${subjectId}`)
    
    // Transform the API response to match expected format
    if (response.data.success && response.data.data) {
      const transformedData = response.data.data.map((item: {
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
      }) => ({
        subjectId: item.subjectId,
        subjectCode: item.subjectCode,
        subjectName: item.subjectName,
        courseGroup: item.courseGroup || null,
        credits: item.credits || 0,
        classCode: item.classCode || null,
        dayOfWeek: typeof item.dayOfWeek === 'string' ? mapDayOfWeekToNumber(item.dayOfWeek) : item.dayOfWeek,
        startPeriod: item.startPeriod,
        numberOfPeriods: item.endPeriod ? (item.endPeriod - item.startPeriod + 1) : (item.numberOfPeriods || 1),
        roomCode: item.roomCode,
        roomName: item.roomName,
        instructorName: item.instructorName,
        courseType: item.courseType,
        scheduleStartDate: item.scheduleStartDate || item.date,
        scheduleEndDate: item.scheduleEndDate || item.date,
        note: item.note,
        date: item.date
      }))
      
      return {
        success: true,
        data: transformedData,
        message: response.data.message
      }
    }
    
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
  },

  // Export PDF thời khóa biểu theo tuần
  exportWeeklySchedulePDF: async (semesterId: string, weekNumber: number): Promise<void> => {
    if (!semesterId || !weekNumber) {
      throw new Error('Vui lòng chọn học kỳ và tuần học')
    }
    
    const response = await api.get(`/v1/schedules/export-pdf?semesterId=${semesterId}&weekNumber=${weekNumber}`, {
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
    
    const response = await api.get(`/v1/schedules/export-subject-pdf?semesterId=${semesterId}&weekNumber=${weekNumber}&subjectId=${subjectId}`, {
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
  }
}
