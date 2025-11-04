import { useState, useEffect, useCallback } from "react"
import { weeklyScheduleApi } from "../api/weeklyScheduleApi"
import { 
  WeeklyScheduleItem, 
  Week 
} from "../types/weeklyTypes"
import { Semester, Subject } from "@/lib/types"
import { useSemesters, useSubjects } from "@/lib/hooks"
import toast from "react-hot-toast"

export const useScheduleData = () => {
  const { data: semestersData, loading: semestersLoading } = useSemesters()
  const { data: subjectsData, loading: subjectsLoading } = useSubjects()
  
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

  useEffect(() => {
    if (semestersData.length > 0) {
      const sortedSemesters = [...semestersData].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      const currentDate = new Date()
      const currentSemester = sortedSemesters.find(semester => {
        const startDate = new Date(semester.startDate)
        const endDate = new Date(semester.endDate)
        return currentDate >= startDate && currentDate <= endDate
      })
      setSemesters(sortedSemesters)
      if (!selectedSemester) {
        setSelectedSemester(currentSemester || sortedSemesters[0])
      }
    }
  }, [semestersData])

  useEffect(() => {
    if (subjectsData.length > 0) {
      setSubjects(subjectsData)
      if (!selectedSubject) {
        setSelectedSubject(subjectsData[0])
      }
    }
  }, [subjectsData])

  const fetchWeeks = useCallback(async (semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await weeklyScheduleApi.getWeeks(semesterId)
      
      if (response.success) {
        const currentWeek = response.data.find((week: Week & { isCurrent?: boolean }) => week.isCurrent)
        
        setWeeks(response.data)
        setSelectedWeek(currentWeek || response.data[0])
      } else {
        setWeeks([])
        setSelectedWeek(null)
      }
    } catch {
      setError("Lỗi khi tải danh sách tuần")
      setWeeks([])
      setSelectedWeek(null)
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
        setError(response.message && !response.message.includes("Không tìm thấy thời khóa biểu") && !response.message.includes("không có dữ liệu") && !response.message.includes("không có thời khóa biểu") ? response.message : null)
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { success?: boolean; message?: string } } }
      if (err?.response?.data?.success === false) {
        const response = err.response.data
        setScheduleData([])
        setError(response.message && !response.message.includes("Không tìm thấy thời khóa biểu") && !response.message.includes("không có dữ liệu") && !response.message.includes("không có thời khóa biểu") ? response.message : null)
      } else {
        setError("Lỗi khi tải thời khóa biểu theo tuần")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchWeeklyScheduleBySubject = useCallback(async (semesterId: string, weekNumber: number, subjectId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await weeklyScheduleApi.getWeeklyScheduleBySubject(semesterId, weekNumber, subjectId)
      
      if (response.success) {
        setScheduleData(response.data)
      } else {
        setScheduleData([])
        setError(response.message && !response.message.includes("Không tìm thấy thời khóa biểu") && !response.message.includes("không có dữ liệu") && !response.message.includes("không có thời khóa biểu") ? response.message : null)
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { success?: boolean; message?: string } } }
      if (err?.response?.data?.success === false) {
        const response = err.response.data
        setScheduleData([])
        setError(response.message && !response.message.includes("Không tìm thấy thời khóa biểu") && !response.message.includes("không có dữ liệu") && !response.message.includes("không có thời khóa biểu") ? response.message : null)
      } else {
        setError("Lỗi khi tải thời khóa biểu theo tuần và môn học")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])


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
      }
    }
  }, [selectedSemester, selectedWeek, viewType, fetchWeeklySchedule, fetchWeeks])

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
    isLoading: isLoading || semestersLoading || subjectsLoading,
    error,
    handleSemesterChange,
    handleWeekChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  }
}
