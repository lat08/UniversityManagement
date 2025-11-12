import { useState, useEffect, useCallback } from "react"
import { instructorSemesterScheduleApi } from "../api/semesterScheduleApi"
import { InstructorSemesterScheduleItem } from "../types/semesterTypes"
import { Semester, Subject } from "@/lib/types"
import { useSemesters, useSubjects } from "@/lib/hooks"

interface UseInstructorSemesterScheduleParams {
  initialSemesterId?: string;
}

export const useInstructorSemesterSchedule = (params?: UseInstructorSemesterScheduleParams) => {
  const { data: semestersData, loading: semestersLoading } = useSemesters()
  const { data: subjectsData, loading: subjectsLoading } = useSubjects()
  
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [scheduleData, setScheduleData] = useState<InstructorSemesterScheduleItem[]>([])
  const [viewType, setViewType] = useState<"personal" | "subject">("personal")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (semestersData.length > 0) {
      const sortedSemesters = [...semestersData].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      
      let semesterToSelect: Semester | null = null;
      
      if (params?.initialSemesterId) {
        semesterToSelect = sortedSemesters.find(s => s.semesterId === params.initialSemesterId) || null;
      }
      
      if (!semesterToSelect) {
        const currentDate = new Date()
        const currentSemester = sortedSemesters.find(semester => {
          if (!semester.registrationStartDate || !semester.registrationEndDate) return false;
          const startDate = new Date(semester.registrationStartDate)
          const endDate = new Date(semester.registrationEndDate)
          return currentDate >= startDate && currentDate <= endDate
        })
        semesterToSelect = currentSemester || sortedSemesters[0];
      }
      
      setSemesters(sortedSemesters)
      if (!selectedSemester) {
        setSelectedSemester(semesterToSelect)
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

  const fetchInstructorSchedule = useCallback(async (semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await instructorSemesterScheduleApi.getInstructorSchedule(semesterId)
      
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
        setError("Lỗi khi tải thời khóa biểu giảng viên")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchSubjectSchedule = useCallback(async (semesterId: string, subjectId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await instructorSemesterScheduleApi.getScheduleBySubject(semesterId, subjectId)
      
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

  // Load schedule when semester or view type changes
  useEffect(() => {
    if (!selectedSemester) return

    if (viewType === "personal") {
      fetchInstructorSchedule(selectedSemester.semesterId)
    } else if (viewType === "subject" && selectedSubject) {
      fetchSubjectSchedule(selectedSemester.semesterId, selectedSubject.subjectId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester, viewType, selectedSubject])

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
    const isTypeChanged = type !== viewType
    setViewType(type)
    setScheduleData([])
    setError(null)
    
    // Force reload nếu chọn lại cùng option
    if (!isTypeChanged && selectedSemester) {
      if (type === "personal") {
        fetchInstructorSchedule(selectedSemester.semesterId)
      } else if (type === "subject" && selectedSubject) {
        fetchSubjectSchedule(selectedSemester.semesterId, selectedSubject.subjectId)
      }
    }
  }, [viewType, selectedSemester, selectedSubject, fetchInstructorSchedule, fetchSubjectSchedule])

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
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading: isLoading || semestersLoading || subjectsLoading,
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
  }
}

