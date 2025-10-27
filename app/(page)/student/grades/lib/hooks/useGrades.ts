import { useState, useEffect, useCallback } from 'react'
import { gradesApi } from '../api/gradesApi'
import { CumulativeGradesData, SemesterGrade } from '../types/types'

interface UseGradesReturn {
  cumulativeData: CumulativeGradesData | null
  selectedSemesterId: string | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  exportPdf: () => Promise<void>
  setSelectedSemester: (semesterId: string) => void
}

export const useGrades = (): UseGradesReturn => {
  const [cumulativeData, setCumulativeData] = useState<CumulativeGradesData | null>(null)
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGrades = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await gradesApi.getCumulativeGrades()
      
      if (response.success) {
        setCumulativeData(response.data)
      } else {
        setError(response.message || 'Không thể tải dữ liệu điểm')
      }
    } catch (err) {
      console.error('Error fetching grades:', err)
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const exportPdf = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const blob = await gradesApi.exportTranscriptPdf()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `BangDiem_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting PDF:', err)
      setError('Không thể xuất file PDF')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGrades()
  }, [fetchGrades])

  return {
    cumulativeData,
    selectedSemesterId,
    isLoading,
    error,
    refetch: fetchGrades,
    exportPdf,
    setSelectedSemester: setSelectedSemesterId,
  }
}
