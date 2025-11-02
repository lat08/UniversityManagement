import { useState, useEffect, useCallback } from "react"
import { instructorWeeklyScheduleApi } from "../api/weeklyScheduleApi"
import { 
  InstructorWeeklyScheduleItem, 
  Semester, 
  Subject,
  Week 
} from "../types/weeklyTypes"

export const useInstructorWeeklySchedule = () => {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [scheduleData, setScheduleData] = useState<InstructorWeeklyScheduleItem[]>([])
  const [viewType, setViewType] = useState<"week" | "subject">("week")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch danh sách học kỳ
  const fetchSemesters = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await instructorWeeklyScheduleApi.getSemesters()
      
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

  const fetchWeeks = useCallback(async (semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await instructorWeeklyScheduleApi.getWeeks(semesterId)
      
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

  // Fetch danh sách môn học của giảng viên
  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await instructorWeeklyScheduleApi.getSubjects()
      
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
      const response = await instructorWeeklyScheduleApi.getWeeklySchedule(semesterId, weekNumber)
      
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
      const response = await instructorWeeklyScheduleApi.getWeeklyScheduleBySubject(semesterId, weekNumber, subjectId)
      
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
  const handleSubjectChange = useCallback((subjectId: string) => {
    const subject = subjects.find(s => s.subjectId === subjectId)
    if (subject) {
      setSelectedSubject(subject)
    }
  }, [subjects])

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
  }
}

