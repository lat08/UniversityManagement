import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState, useCallback } from "react"
import { weeklyScheduleApi } from "../api/weeklyScheduleApi"
import { WeeklyScheduleItem, Week } from "../types/weeklyTypes"
import { Semester, Subject } from "@/lib/types"
import { useSemesters, useSubjects } from "@/lib/hooks"
import { queryKeys } from "@/lib/api/queryKeys"
import toast from "react-hot-toast"

export const useScheduleData = () => {
  const queryClient = useQueryClient()
  const { data: semestersData = [], loading: semestersLoading } = useSemesters()
  const { data: subjectsData = [], loading: subjectsLoading } = useSubjects()

  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [viewType, setViewType] = useState<"week" | "subject">("week")
  const [isExporting, setIsExporting] = useState(false)

  const semesters = useMemo(() => {
    const sorted = [...semestersData].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    
    if (!selectedSemester && sorted.length > 0) {
      const currentDate = new Date()
      const current = sorted.find(s => {
        if (!s.registrationStartDate || !s.registrationEndDate) return false
        const start = new Date(s.registrationStartDate)
        const end = new Date(s.registrationEndDate)
        return currentDate >= start && currentDate <= end
      })
      setSelectedSemester(current || sorted[0])
    }
    
    return sorted
  }, [semestersData, selectedSemester])

  const subjects = useMemo(() => {
    if (!selectedSubject && subjectsData.length > 0) {
      setSelectedSubject(subjectsData[0])
    }
    return subjectsData
  }, [subjectsData, selectedSubject])

  const { data: weeksData, isLoading: weeksLoading } = useQuery({
    queryKey: queryKeys.schedule.weeks(selectedSemester?.semesterId || ''),
    queryFn: async () => {
      if (!selectedSemester) return { success: false, data: [], message: '' }
      return weeklyScheduleApi.getWeeks(selectedSemester.semesterId)
    },
    enabled: !!selectedSemester,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useMemo(() => {
    if (weeksData?.success && weeksData.data.length > 0) {
      const currentWeek = weeksData.data.find((w: Week & { isCurrent?: boolean }) => w.isCurrent)
      setSelectedWeek(currentWeek || weeksData.data[0])
    } else {
      setSelectedWeek(null)
    }
  }, [weeksData])

  const scheduleQueryKey = useMemo(() => {
    if (!selectedSemester || !selectedWeek) return null
    
    if (viewType === "week") {
      return queryKeys.schedule.weekly(selectedSemester.semesterId, selectedWeek.weekNumber)
    }
    
    if (viewType === "subject" && selectedSubject) {
      return queryKeys.schedule.weeklyBySubject(
        selectedSemester.semesterId,
        selectedWeek.weekNumber,
        selectedSubject.subjectId
      )
    }
    
    return null
  }, [selectedSemester, selectedWeek, viewType, selectedSubject])

  const { data: scheduleResponse, isLoading: scheduleLoading, error: scheduleError } = useQuery({
    queryKey: scheduleQueryKey || ['disabled'],
    queryFn: async () => {
      if (!selectedSemester || !selectedWeek) {
        return { success: false, data: [], message: '' }
      }
      
      if (viewType === "week") {
        return weeklyScheduleApi.getWeeklySchedule(selectedSemester.semesterId, selectedWeek.weekNumber)
      }
      
      if (viewType === "subject" && selectedSubject) {
        return weeklyScheduleApi.getWeeklyScheduleBySubject(
          selectedSemester.semesterId,
          selectedWeek.weekNumber,
          selectedSubject.subjectId
        )
      }
      
      return { success: false, data: [], message: '' }
    },
    enabled: !!scheduleQueryKey && !!selectedSemester && !!selectedWeek,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const scheduleData: WeeklyScheduleItem[] = useMemo(
    () => scheduleResponse?.data || [],
    [scheduleResponse]
  )

  const error = useMemo(() => {
    if (scheduleError) return "Lỗi khi tải thời khóa biểu"
    if (scheduleResponse && !scheduleResponse.success && scheduleResponse.message) {
      return scheduleResponse.message
    }
    return null
  }, [scheduleError, scheduleResponse])

  const handleSemesterChange = useCallback((semesterId: string) => {
    const semester = semesters.find(s => s.semesterId === semesterId)
    if (semester) {
      setSelectedSemester(semester)
      setSelectedWeek(null)
      setSelectedSubject(null)
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.schedule.weeks(semesterId),
        queryFn: () => weeklyScheduleApi.getWeeks(semesterId),
        staleTime: 30 * 60 * 1000,
      })
    }
  }, [semesters, queryClient])

  const handleWeekChange = useCallback((weekNumber: number) => {
    if (!weeksData?.data) return
    const week = weeksData.data.find((w: Week) => w.weekNumber === weekNumber)
    if (week) {
      setSelectedWeek(week)
      
      if (selectedSemester) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.schedule.weekly(selectedSemester.semesterId, weekNumber),
          queryFn: () => weeklyScheduleApi.getWeeklySchedule(selectedSemester.semesterId, weekNumber),
          staleTime: 5 * 60 * 1000,
        })
      }
    }
  }, [weeksData, selectedSemester, queryClient])

  const handleViewTypeChange = useCallback((type: "week" | "subject") => {
    setViewType(type)
  }, [])

  const handleSubjectChange = useCallback((subjectCode: string) => {
    const subject = subjects.find(s => s.subjectCode === subjectCode)
    if (subject) {
      setSelectedSubject(subject)
    }
  }, [subjects])

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
    
    if (!scheduleData || scheduleData.length === 0) {
      toast.error('Không có dữ liệu thời khóa biểu để xuất file PDF')
      return
    }
    
    try {
      setIsExporting(true)
      if (viewType === 'week') {
        await weeklyScheduleApi.exportWeeklySchedulePDF(selectedSemester.semesterId, selectedWeek.weekNumber)
      } else if (viewType === 'subject' && selectedSubject) {
        await weeklyScheduleApi.exportSubjectSchedulePDF(
          selectedSemester.semesterId,
          selectedWeek.weekNumber,
          selectedSubject.subjectId
        )
      }
      toast.success('Tải file PDF thành công!')
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
      
      if (err?.response?.status === 406) {
        toast.error('Không có dữ liệu thời khóa biểu để xuất file PDF')
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi khi xuất file PDF'
        toast.error(errorMessage)
      }
    } finally {
      setIsExporting(false)
    }
  }, [selectedSemester, selectedWeek, viewType, selectedSubject, scheduleData])

  return {
    semesters,
    selectedSemester,
    weeks: weeksData?.data || [],
    selectedWeek,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading: semestersLoading || subjectsLoading || weeksLoading || scheduleLoading,
    isExporting,
    error,
    handleSemesterChange,
    handleWeekChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  }
}
