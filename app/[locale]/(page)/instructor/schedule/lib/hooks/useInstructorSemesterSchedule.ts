import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState, useCallback } from "react"
import { instructorSemesterScheduleApi } from "../api/semesterScheduleApi"
import { InstructorSemesterScheduleItem } from "../types/semesterTypes"
import { Semester, Subject } from "@/lib/types"
import { useSemesters, useSubjects } from "@/lib/hooks"
import { queryKeys } from "@/lib/api/queryKeys"

interface UseInstructorSemesterScheduleParams {
  initialSemesterId?: string
}

export const useInstructorSemesterSchedule = (params?: UseInstructorSemesterScheduleParams) => {
  const queryClient = useQueryClient()
  const { data: semestersData = [], loading: semestersLoading } = useSemesters()
  const { data: subjectsData = [], loading: subjectsLoading } = useSubjects()

  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [viewType, setViewType] = useState<"personal" | "subject">("personal")

  const semesters = useMemo(() => {
    const sorted = [...semestersData].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    
    if (!selectedSemester && sorted.length > 0) {
      if (params?.initialSemesterId) {
        const target = sorted.find(s => s.semesterId === params.initialSemesterId)
        if (target) {
          setSelectedSemester(target)
          return sorted
        }
      }
      
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
  }, [semestersData, params?.initialSemesterId, selectedSemester])

  const subjects = useMemo(() => {
    if (!selectedSubject && subjectsData.length > 0) {
      setSelectedSubject(subjectsData[0])
    }
    return subjectsData
  }, [subjectsData, selectedSubject])

  const scheduleQueryKey = useMemo(() => {
    if (!selectedSemester) return null
    
    if (viewType === "personal") {
      return queryKeys.schedule.instructor.semester(selectedSemester.semesterId)
    }
    
    if (viewType === "subject" && selectedSubject) {
      return queryKeys.schedule.instructor.semesterBySubject(selectedSemester.semesterId, selectedSubject.subjectId)
    }
    
    return null
  }, [selectedSemester, viewType, selectedSubject])

  const { data: scheduleResponse, isLoading: scheduleLoading, error: scheduleError } = useQuery({
    queryKey: scheduleQueryKey || ['disabled'],
    queryFn: async () => {
      if (!selectedSemester) {
        return { success: false, data: [], message: '' }
      }
      
      if (viewType === "personal") {
        return instructorSemesterScheduleApi.getInstructorSchedule(selectedSemester.semesterId)
      }
      
      if (viewType === "subject" && selectedSubject) {
        return instructorSemesterScheduleApi.getScheduleBySubject(
          selectedSemester.semesterId,
          selectedSubject.subjectId
        )
      }
      
      return { success: false, data: [], message: '' }
    },
    enabled: !!scheduleQueryKey && !!selectedSemester,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
  })

  const scheduleData: InstructorSemesterScheduleItem[] = useMemo(
    () => scheduleResponse?.data || [],
    [scheduleResponse]
  )

  const error = useMemo(() => {
    if (scheduleError) return "Lỗi khi tải thời khóa biểu"
    if (scheduleResponse && !scheduleResponse.success && scheduleResponse.message) {
      const msg = scheduleResponse.message
      if (
        msg.includes("Không tìm thấy thời khóa biểu") ||
        msg.includes("không có dữ liệu") ||
        msg.includes("không có thời khóa biểu")
      ) {
        return null
      }
      return msg
    }
    return null
  }, [scheduleError, scheduleResponse])

  const handleSemesterChange = useCallback((semesterId: string) => {
    const semester = semesters.find(s => s.semesterId === semesterId)
    if (semester) {
      setSelectedSemester(semester)
      setSelectedSubject(null)
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.schedule.instructor.semester(semesterId),
        queryFn: () => instructorSemesterScheduleApi.getInstructorSchedule(semesterId),
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [semesters, queryClient])

  const handleViewTypeChange = useCallback((type: "personal" | "subject") => {
    setViewType(type)
  }, [])

  const handleSubjectChange = useCallback((subjectId: string) => {
    const subject = subjects.find(s => s.subjectId === subjectId)
    if (subject) {
      setSelectedSubject(subject)
    }
  }, [subjects])

  return {
    semesters,
    selectedSemester,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading: semestersLoading || subjectsLoading || scheduleLoading,
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
  }
}
