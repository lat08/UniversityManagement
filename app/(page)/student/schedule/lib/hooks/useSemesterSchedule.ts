import { useState, useEffect, useCallback } from "react"
import { semesterScheduleApi } from "../api/semesterScheduleApi"
import { 
  SemesterScheduleItem, 
  Semester, 
  Subject 
} from "../types/semesterTypes"
import toast from "react-hot-toast"

export const useSemesterSchedule = () => {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [scheduleData, setScheduleData] = useState<SemesterScheduleItem[]>([])
  const [viewType, setViewType] = useState<"personal" | "subject">("personal")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch danh sách học kỳ
  const fetchSemesters = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await semesterScheduleApi.getSemesters()
      
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

  // Fetch danh sách môn học
  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await semesterScheduleApi.getSubjects()
      
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

  // Fetch thời khóa biểu cá nhân
  const fetchPersonalSchedule = useCallback(async (semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await semesterScheduleApi.getPersonalSchedule(semesterId)
      
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
        setError("Lỗi khi tải thời khóa biểu cá nhân")
        setScheduleData([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch thời khóa biểu theo môn học
  const fetchSubjectSchedule = useCallback(async (subjectId: string, semesterId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await semesterScheduleApi.getScheduleBySubject(subjectId, semesterId)
      
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
        setError("Lỗi khi tải thời khóa biểu môn học")
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

  // Load schedule when semester changes
  useEffect(() => {
    if (selectedSemester) {
      if (viewType === "personal") {
        fetchPersonalSchedule(selectedSemester.semesterId)
      } else {
        fetchSubjects()
      }
    }
  }, [selectedSemester, viewType, fetchPersonalSchedule, fetchSubjects])

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
  }, [selectedSemester, scheduleData])

  return {
    semesters,
    selectedSemester,
    subjects,
    selectedSubject,
    scheduleData,
    viewType,
    isLoading,
    error,
    handleSemesterChange,
    handleViewTypeChange,
    handleSubjectChange,
    handleExportPDF,
  }
}
