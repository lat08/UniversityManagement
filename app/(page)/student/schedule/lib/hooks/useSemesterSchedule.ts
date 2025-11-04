import { useState, useEffect, useCallback } from "react"
import { semesterScheduleApi } from "../api/semesterScheduleApi"
import { SemesterScheduleItem } from "../types/semesterTypes"
import { Semester, Subject } from "@/lib/types"
import { useSemesters, useSubjects } from "@/lib/hooks"
import toast from "react-hot-toast"

export const useSemesterSchedule = () => {
  const { data: semestersData, loading: semestersLoading } = useSemesters()
  const { data: subjectsData, loading: subjectsLoading } = useSubjects()
  
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [scheduleData, setScheduleData] = useState<SemesterScheduleItem[]>([])
  const [viewType, setViewType] = useState<"personal" | "subject">("personal")
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

  const fetchPersonalSchedule = useCallback(async (semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await semesterScheduleApi.getPersonalSchedule(semesterId)
      
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
        setError("Lỗi khi tải thời khóa biểu cá nhân")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchSubjectSchedule = useCallback(async (subjectId: string, semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await semesterScheduleApi.getScheduleBySubject(subjectId, semesterId)
      
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
        setError("Lỗi khi tải thời khóa biểu môn học")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load schedule when semester changes
  useEffect(() => {
    if (selectedSemester) {
      if (viewType === "personal") {
        fetchPersonalSchedule(selectedSemester.semesterId)
      }
    }
  }, [selectedSemester, viewType, fetchPersonalSchedule])

  // Load subject schedule when subject changes
  useEffect(() => {
    if (viewType === "subject" && selectedSubject && selectedSemester) {
      fetchSubjectSchedule(selectedSubject.subjectId, selectedSemester.semesterId)
    }
  }, [selectedSubject, selectedSemester, viewType, fetchSubjectSchedule])

  // Handle semester change
  const handleSemesterChange = useCallback((semesterId: string) => {
    const semester = semesters.find(s => s.semesterId === semesterId)
    if (semester) {
      setSelectedSemester(semester)
      setSelectedSubject(null)
    }
  }, [semesters])

  // Handle view type change
  const handleViewTypeChange = useCallback((type: "personal" | "subject") => {
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
    
    // Kiểm tra xem có dữ liệu thời khóa biểu không
    if (!scheduleData || scheduleData.length === 0) {
      toast.error('Không có dữ liệu thời khóa biểu để xuất file PDF')
      return
    }
    
    try {
      setIsLoading(true)
      await semesterScheduleApi.exportPersonalSchedulePDF(selectedSemester.semesterId)
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
  }, [selectedSemester, scheduleData])

  return {
    semesters,
    selectedSemester,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading: isLoading || semestersLoading || subjectsLoading,
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  }
}
