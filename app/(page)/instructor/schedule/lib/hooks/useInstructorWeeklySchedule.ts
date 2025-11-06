import { useState, useEffect, useCallback } from "react"
import { instructorWeeklyScheduleApi } from "../api/weeklyScheduleApi"
import { 
  InstructorWeeklyScheduleItem, 
  Week 
} from "../types/weeklyTypes"
import { Semester, Subject } from "@/lib/types"
import { useSemesters, useSubjects } from "@/lib/hooks"
import { getScheduleErrorMessage, handleScheduleError } from "@/lib/utils/scheduleErrorHandling"

export const useInstructorWeeklySchedule = () => {
  const { data: semestersData, loading: semestersLoading } = useSemesters()
  const { data: subjectsData, loading: subjectsLoading } = useSubjects()
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semestersData])

  useEffect(() => {
    if (subjectsData.length > 0) {
      setSubjects(subjectsData)
      if (!selectedSubject) {
        setSelectedSubject(subjectsData[0])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectsData])

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


  const fetchWeeklySchedule = useCallback(async (semesterId: string, weekNumber: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await instructorWeeklyScheduleApi.getWeeklySchedule(semesterId, weekNumber)
      
      if (response.success) {
        setScheduleData(response.data)
      } else {
        setScheduleData([])
        setError(getScheduleErrorMessage(response))
      }
    } catch (error: unknown) {
      setScheduleData([])
      setError(handleScheduleError(error) || "Lỗi khi tải thời khóa biểu theo tuần")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchWeeklyScheduleBySubject = useCallback(async (semesterId: string, weekNumber: number, subjectId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await instructorWeeklyScheduleApi.getWeeklyScheduleBySubject(semesterId, weekNumber, subjectId)
      
      if (response.success) {
        setScheduleData(response.data)
      } else {
        setScheduleData([])
        setError(getScheduleErrorMessage(response))
      }
    } catch (error: unknown) {
      setScheduleData([])
      setError(handleScheduleError(error) || "Lỗi khi tải thời khóa biểu theo tuần và môn học")
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
    if (!selectedSemester || !selectedWeek) return

    if (viewType === "week") {
      fetchWeeklySchedule(selectedSemester.semesterId, selectedWeek.weekNumber)
    } else if (viewType === "subject" && selectedSubject) {
      fetchWeeklyScheduleBySubject(selectedSemester.semesterId, selectedWeek.weekNumber, selectedSubject.subjectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester, selectedWeek, viewType, selectedSubject])

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
    const isTypeChanged = type !== viewType
    setViewType(type)
    setScheduleData([])
    setError(null)
    
    // Force reload nếu chọn lại cùng option
    if (!isTypeChanged && selectedSemester && selectedWeek) {
      if (type === "week") {
        fetchWeeklySchedule(selectedSemester.semesterId, selectedWeek.weekNumber)
      } else if (type === "subject" && selectedSubject) {
        fetchWeeklyScheduleBySubject(selectedSemester.semesterId, selectedWeek.weekNumber, selectedSubject.subjectId)
      }
    }
  }, [viewType, selectedSemester, selectedWeek, selectedSubject, fetchWeeklySchedule, fetchWeeklyScheduleBySubject])

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
    isLoading: isLoading || semestersLoading || subjectsLoading,
    error,
    handleSemesterChange,
    handleWeekChange,
    handleViewTypeChange,
    handleSubjectChange,
  }
}

