import { api } from "@/lib/api/client"
import { DAY_NAME_TO_NUMBER } from "@/lib/constants/schedule"
import { SemesterScheduleResponse } from "../types/semesterTypes"

const mapDayOfWeekToNumber = (dayString: string): number => {
  return DAY_NAME_TO_NUMBER[dayString] || 2
}

export const semesterScheduleApi = {
  // Lấy thời khóa biểu cá nhân của sinh viên
  getPersonalSchedule: async (semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get(`/v1/student-schedule/semester?semesterId=${semesterId}`)
    
    // Transform the API response to ensure consistent format
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
        scheduleStartDate: string
        scheduleEndDate: string
        note?: string
      }) => ({
        subjectId: item.subjectId,
        subjectCode: item.subjectCode,
        subjectName: item.subjectName,
        courseGroup: item.courseGroup || null,
        credits: item.credits || 0,
        classCode: item.classCode || null,
        dayOfWeek: typeof item.dayOfWeek === 'string' ? mapDayOfWeekToNumber(item.dayOfWeek) : item.dayOfWeek,
        startPeriod: item.startPeriod,
        numberOfPeriods: item.numberOfPeriods || 1,
        roomCode: item.roomCode,
        roomName: item.roomName,
        instructorName: item.instructorName,
        courseType: item.courseType,
        scheduleStartDate: item.scheduleStartDate,
        scheduleEndDate: item.scheduleEndDate,
        note: item.note
      }))
      
      return {
        success: true,
        data: transformedData,
        message: response.data.message
      }
    }
    
    return response.data
  },

  // Lấy thời khóa biểu theo môn học
  getScheduleBySubject: async (subjectId: string, semesterId: string): Promise<SemesterScheduleResponse> => {
    const response = await api.get(`/v1/student-schedule/semester/subjects/${subjectId}?semesterId=${semesterId}`)
    
    // Transform the API response to ensure consistent format
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
        scheduleStartDate: string
        scheduleEndDate: string
        note?: string
      }) => ({
        subjectId: item.subjectId,
        subjectCode: item.subjectCode,
        subjectName: item.subjectName,
        courseGroup: item.courseGroup || null,
        credits: item.credits || 0,
        classCode: item.classCode || null,
        dayOfWeek: typeof item.dayOfWeek === 'string' ? mapDayOfWeekToNumber(item.dayOfWeek) : item.dayOfWeek,
        startPeriod: item.startPeriod,
        numberOfPeriods: item.numberOfPeriods || 1,
        roomCode: item.roomCode,
        roomName: item.roomName,
        instructorName: item.instructorName,
        courseType: item.courseType,
        scheduleStartDate: item.scheduleStartDate,
        scheduleEndDate: item.scheduleEndDate,
        note: item.note
      }))
      
      return {
        success: true,
        data: transformedData,
        message: response.data.message
      }
    }
    
    return response.data
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
