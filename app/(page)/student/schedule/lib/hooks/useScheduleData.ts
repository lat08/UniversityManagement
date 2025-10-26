import { useState, useEffect, useCallback } from "react"
import { weeklyScheduleApi } from "../api/weeklyScheduleApi"
import { 
  WeeklyScheduleItem, 
  Semester, 
  Subject,
  Week 
} from "../types/weeklyTypes"
import toast from "react-hot-toast"

export const useScheduleData = () => {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [scheduleData, setScheduleData] = useState<WeeklyScheduleItem[]>([])
  const [viewType, setViewType] = useState<"week" | "subject">("week")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch danh sách học kỳ
  const fetchSemesters = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await weeklyScheduleApi.getSemesters()
      
      if (response.success && response.data.length > 0) {
        // Sắp xếp học kỳ theo startDate (mới nhất trước)
        const sortedSemesters = response.data.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
        
        // Tìm học kỳ hiện tại dựa vào startDate và endDate
        const currentDate = new Date()
        const currentSemester = sortedSemesters.find(semester => {
          const startDate = new Date(semester.startDate)
          const endDate = new Date(semester.endDate)
          return currentDate >= startDate && currentDate <= endDate
        })
        
        setSemesters(sortedSemesters)
        setSelectedSemester(currentSemester || sortedSemesters[0])
      } else {
        setError("Không có dữ liệu học kỳ")
      }
    } catch {
      setError("Lỗi khi tải danh sách học kỳ")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Tạo danh sách tuần dựa trên học kỳ
  const fetchWeeks = useCallback(async (semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Tạm thời tạo danh sách tuần mẫu
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
      
      setWeeks(weeks)
      setSelectedWeek(weeks[0])
    } catch {
      setError("Lỗi khi tải danh sách tuần")
      setWeeks([])
      setSelectedWeek(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch danh sách môn học
  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await weeklyScheduleApi.getSubjects()
      
      if (response.success) {
        setSubjects(response.data)
        setSelectedSubject(response.data.length > 0 ? response.data[0] : null)
      } else {
        setSubjects([])
        setSelectedSubject(null)
      }
    } catch {
      setError("Lỗi khi tải danh sách môn học")
      setSubjects([])
      setSelectedSubject(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch thời khóa biểu theo tuần
  const fetchWeeklySchedule = useCallback(async (semesterId: string, weekNumber: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await weeklyScheduleApi.getWeeklySchedule(semesterId, weekNumber)
      
      if (response.success) {
        setScheduleData(response.data)
      } else {
        setScheduleData([])
        // Không hiển thị lỗi nếu chỉ là không có dữ liệu
        if (response.message && (
          response.message.includes("Không tìm thấy thời khóa biểu") ||
          response.message.includes("không có dữ liệu") ||
          response.message.includes("không có thời khóa biểu")
        )) {
          setError(null)
        } else {
          setError(response.message || "Không có dữ liệu thời khóa biểu")
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { success?: boolean; message?: string } } };
      // Kiểm tra nếu là response từ server với success: false
      if (err?.response?.data?.success === false) {
        const response = err.response.data
        setScheduleData([])
        // Không hiển thị lỗi nếu chỉ là không có dữ liệu
        if (response.message && (
          response.message.includes("Không tìm thấy thời khóa biểu") ||
          response.message.includes("không có dữ liệu") ||
          response.message.includes("không có thời khóa biểu")
        )) {
          setError(null)
        } else {
          setError(response.message || "Không có dữ liệu thời khóa biểu")
        }
      } else {
        setError("Lỗi khi tải thời khóa biểu theo tuần")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch thời khóa biểu theo tuần và môn học
  const fetchWeeklyScheduleBySubject = useCallback(async (semesterId: string, weekNumber: number, subjectId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await weeklyScheduleApi.getWeeklyScheduleBySubject(semesterId, weekNumber, subjectId)
      
      if (response.success) {
        setScheduleData(response.data)
      } else {
        setScheduleData([])
        // Không hiển thị lỗi nếu chỉ là không có dữ liệu
        if (response.message && (
          response.message.includes("Không tìm thấy thời khóa biểu") ||
          response.message.includes("không có dữ liệu") ||
          response.message.includes("không có thời khóa biểu")
        )) {
          setError(null)
        } else {
          setError(response.message || "Không có dữ liệu thời khóa biểu")
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { success?: boolean; message?: string } } };
      // Kiểm tra nếu là response từ server với success: false
      if (err?.response?.data?.success === false) {
        const response = err.response.data
        setScheduleData([])
        // Không hiển thị lỗi nếu chỉ là không có dữ liệu
        if (response.message && (
          response.message.includes("Không tìm thấy thời khóa biểu") ||
          response.message.includes("không có dữ liệu") ||
          response.message.includes("không có thời khóa biểu")
        )) {
          setError(null)
        } else {
          setError(response.message || "Không có dữ liệu thời khóa biểu")
        }
      } else {
        setError("Lỗi khi tải thời khóa biểu theo tuần và môn học")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    fetchSemesters()
  }, [fetchSemesters])

  // Load weeks when semester changes
  useEffect(() => {
    if (selectedSemester) {
      fetchWeeks(selectedSemester.semesterId)
    }
  }, [selectedSemester, fetchWeeks])

  // Load schedule when semester, week, or view type changes
  useEffect(() => {
    if (selectedSemester && selectedWeek) {
      if (viewType === "week") {
        fetchWeeklySchedule(selectedSemester.semesterId, selectedWeek.weekNumber)
      } else {
        fetchSubjects()
      }
    }
  }, [selectedSemester, selectedWeek, viewType, fetchWeeklySchedule, fetchSubjects])

  // Load subject schedule when subject changes
  useEffect(() => {
    if (viewType === "subject" && selectedSubject && selectedSemester && selectedWeek) {
      fetchWeeklyScheduleBySubject(selectedSemester.semesterId, selectedWeek.weekNumber, selectedSubject.subjectId)
    }
  }, [selectedSubject, selectedSemester, selectedWeek, viewType, fetchWeeklyScheduleBySubject])

  // Handle semester change
  const handleSemesterChange = useCallback((semesterId: string) => {
    const semester = semesters.find(s => s.semesterId === semesterId)
    if (semester) {
      setSelectedSemester(semester)
      setSelectedWeek(null)
      setSelectedSubject(null)
    }
  }, [semesters])

  // Handle week change
  const handleWeekChange = useCallback((weekNumber: number) => {
    const week = weeks.find(w => w.weekNumber === weekNumber)
    if (week) {
      setSelectedWeek(week)
    }
  }, [weeks])

  // Handle view type change
  const handleViewTypeChange = useCallback((type: "week" | "subject") => {
    setViewType(type)
    setScheduleData([])
    setError(null)
  }, [])

  // Handle subject change
  const handleSubjectChange = useCallback((subjectCode: string) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode)
    if (subject) {
      setSelectedSubject(subject)
    }
  }, [subjects])

  // Handle export PDF
  const handleExportPDF = useCallback(async () => {
    if (!selectedSemester) {
      toast.error('Vui lòng chọn học kỳ')
      return
    }
    
    if (!selectedWeek) {
      toast.error('Vui lòng chọn tuần học')
      return
    }
    
    if (viewType === 'subject' && !selectedSubject) {
      toast.error('Vui lòng chọn môn học')
      return
    }
    
    // Kiểm tra xem có dữ liệu thời khóa biểu không
    if (!scheduleData || scheduleData.length === 0) {
      toast.error('Không có dữ liệu thời khóa biểu để xuất file PDF')
      return
    }
    
    try {
      setIsLoading(true)
      if (viewType === 'week') {
        await weeklyScheduleApi.exportWeeklySchedulePDF(selectedSemester.semesterId, selectedWeek.weekNumber)
      } else if (viewType === 'subject' && selectedSubject) {
        await weeklyScheduleApi.exportSubjectSchedulePDF(selectedSemester.semesterId, selectedWeek.weekNumber, selectedSubject.subjectId)
      }
      toast.success('Tải file PDF thành công!')
    } catch (error: unknown) {
      console.error('Error exporting PDF:', error)
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
      
      // Xử lý lỗi 406 - thường là không có dữ liệu
      if (err?.response?.status === 406) {
        toast.error('Không có dữ liệu thời khóa biểu để xuất file PDF')
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi khi xuất file PDF'
        toast.error(errorMessage)
      }
      // Không set error state để tránh hiển thị lỗi trên web
    } finally {
      setIsLoading(false)
    }
  }, [selectedSemester, selectedWeek, viewType, selectedSubject, scheduleData])

  return {
    semesters,
    selectedSemester,
    weeks,
    selectedWeek,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading,
    error,
    handleSemesterChange,
    handleWeekChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  }
}
