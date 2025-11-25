import { api } from "@/lib/api/client"
import { DAY_NAME_TO_NUMBER } from "@/lib/constants/schedule"
import { SemesterScheduleResponse, SemesterScheduleItem } from "../types/semesterTypes"

interface ApiSemesterScheduleItem {
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
  courseType?: string
  scheduleStartDate: string
  scheduleEndDate: string
  note?: string
}

const normalizeDayOfWeek = (day: string | number): number => {
  if (typeof day === 'number') {
    return day >= 2 && day <= 8 ? day : 2
  }
  return DAY_NAME_TO_NUMBER[day] || 2
}

const normalizeScheduleItem = (item: ApiSemesterScheduleItem): SemesterScheduleItem => {
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
    courseType: item.courseType,
    scheduleStartDate: item.scheduleStartDate,
    scheduleEndDate: item.scheduleEndDate,
    note: item.note
  }
}

export const semesterScheduleApi = {
  getPersonalSchedule: async (semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get<{ success: boolean; data: ApiSemesterScheduleItem[]; message?: string }>(
      `/v1/student-schedule/semester?semesterId=${semesterId}`
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

  getScheduleBySubject: async (subjectId: string, semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get<{ success: boolean; data: ApiSemesterScheduleItem[]; message?: string }>(
      `/v1/student-schedule/semester/subjects/${subjectId}?semesterId=${semesterId}`
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


  // Export PDF thời khóa biểu cá nhân
  exportPersonalSchedulePDF: async (semesterId: string): Promise<void> => {
    if (!semesterId) {
      throw new Error('Vui lòng chọn học kỳ')
    }
    
    const response = await api.get(`/v1/student-schedule/semester/export-pdf?semesterId=${semesterId}`, {
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
    let fileName = 'ThoiKhoaBieu.pdf'
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
