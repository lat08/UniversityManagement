import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState, useCallback } from "react"
import { semesterScheduleApi } from "../api/semesterScheduleApi"
import { SemesterScheduleItem } from "../types/semesterTypes"
import { Semester, Subject } from "@/lib/types"
import { useSemesters, useSubjects } from "@/lib/hooks"
import { queryKeys } from "@/lib/api/queryKeys"
import toast from "react-hot-toast"

interface UseSemesterScheduleProps {
  initialSemesterId?: string
}

export const useSemesterSchedule = ({ initialSemesterId }: UseSemesterScheduleProps = {}) => {
  const queryClient = useQueryClient()
  const { data: semestersData = [], loading: semestersLoading } = useSemesters()
  const { data: subjectsData = [], loading: subjectsLoading } = useSubjects()

  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [viewType, setViewType] = useState<"personal" | "subject">("personal")
  const [isExporting, setIsExporting] = useState(false)

  const semesters = useMemo(() => {
    const sorted = [...semestersData].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
    
    if (!selectedSemester && sorted.length > 0) {
      if (initialSemesterId) {
        const target = sorted.find(s => s.semesterId === initialSemesterId)
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
  }, [semestersData, initialSemesterId, selectedSemester])

  const subjects = useMemo(() => {
    if (!selectedSubject && subjectsData.length > 0) {
      setSelectedSubject(subjectsData[0])
    }
    return subjectsData
  }, [subjectsData, selectedSubject])

  const scheduleQueryKey = useMemo(() => {
    if (!selectedSemester) return null
    
    if (viewType === "personal") {
      return queryKeys.schedule.semester(selectedSemester.semesterId)
    }
    
    if (viewType === "subject" && selectedSubject) {
      return queryKeys.schedule.semesterBySubject(selectedSemester.semesterId, selectedSubject.subjectId)
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
        return semesterScheduleApi.getPersonalSchedule(selectedSemester.semesterId)
      }
      
      if (viewType === "subject" && selectedSubject) {
        return semesterScheduleApi.getScheduleBySubject(
          selectedSubject.subjectId,
          selectedSemester.semesterId
        )
      }
      
      return { success: false, data: [], message: '' }
    },
    enabled: !!scheduleQueryKey && !!selectedSemester,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const scheduleData: SemesterScheduleItem[] = useMemo(
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
        queryKey: queryKeys.schedule.semester(semesterId),
        queryFn: () => semesterScheduleApi.getPersonalSchedule(semesterId),
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [semesters, queryClient])

  const handleViewTypeChange = useCallback((type: "personal" | "subject") => {
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
    
    if (!scheduleData || scheduleData.length === 0) {
      toast.error('Không có dữ liệu thời khóa biểu để xuất file PDF')
      return
    }
    
    try {
      setIsExporting(true)
      await semesterScheduleApi.exportPersonalSchedulePDF(selectedSemester.semesterId)
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
  }, [selectedSemester, scheduleData])

  return {
    semesters,
    selectedSemester,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading: semestersLoading || subjectsLoading || scheduleLoading,
    isExporting,
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  }
}
