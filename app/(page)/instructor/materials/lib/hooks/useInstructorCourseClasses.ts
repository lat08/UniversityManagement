import { useState, useEffect, useCallback } from 'react'
import { materialsApi } from '../api/materialsApi'
import { InstructorCourseClassDto } from '../type'
import { AxiosError } from 'axios'

interface UseInstructorCourseClassesReturn {
  courseClasses: InstructorCourseClassDto[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useInstructorCourseClasses = (semesterId?: string): UseInstructorCourseClassesReturn => {
  const [courseClasses, setCourseClasses] = useState<InstructorCourseClassDto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourseClasses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await materialsApi.getInstructorCourseClasses(semesterId)
      
      if (response.success && response.data) {
        setCourseClasses(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.message || 'Không thể tải danh sách lớp học phần')
        setCourseClasses([])
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      const errorMessage = 
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Đã xảy ra lỗi khi tải danh sách lớp học phần.'
      setError(errorMessage)
      setCourseClasses([])
    } finally {
      setLoading(false)
    }
  }, [semesterId])

  useEffect(() => {
    void fetchCourseClasses()
  }, [fetchCourseClasses])

  const handleRefetch = useCallback(() => {
    void fetchCourseClasses()
  }, [fetchCourseClasses])

  return {
    courseClasses,
    loading,
    error,
    refetch: handleRefetch,
  }
}

