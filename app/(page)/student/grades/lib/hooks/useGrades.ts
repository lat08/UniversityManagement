import { useState, useEffect, useCallback } from 'react'
import { gradesApi } from '../api/gradesApi'
import { CumulativeGradesData, SemesterGrade, GradesStatsData } from '../types/types'

interface CommonSemester {
  semesterId: string
  semesterName: string
  semesterType: string
  startDate: string
  endDate: string
  status: string
}

interface UseGradesReturn {
  cumulativeData: CumulativeGradesData | null
  statsData: GradesStatsData | null
  commonSemesters: CommonSemester[]
  selectedSemesterId: string | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  exportPdf: () => Promise<void>
  setSelectedSemester: (semesterId: string) => void
}

export const useGrades = (): UseGradesReturn => {
  const [cumulativeData, setCumulativeData] = useState<CumulativeGradesData | null>(null)
  const [statsData, setStatsData] = useState<GradesStatsData | null>(null)
  const [commonSemesters, setCommonSemesters] = useState<CommonSemester[]>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGrades = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch cumulative grades, stats, and common semesters in parallel
      const [cumulativeResponse, statsResponse, semestersResponse] = await Promise.all([
        gradesApi.getCumulativeGrades(),
        gradesApi.getGradesStats(),
        gradesApi.getCommonSemesters()
      ])
      
      if (cumulativeResponse.success) {
        setCumulativeData(cumulativeResponse.data)
      } else {
        setError(cumulativeResponse.message || 'Không thể tải dữ liệu điểm')
      }

      if (statsResponse.success) {
        setStatsData(statsResponse.data)
      } else {
        // Stats failure should not block the page, just log it
        console.warn('Failed to load stats:', statsResponse.message)
      }

      if (semestersResponse.success) {
        setCommonSemesters(semestersResponse.data)
      } else {
        console.warn('Failed to load common semesters:', semestersResponse)
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
    statsData,
    commonSemesters,
    selectedSemesterId,
    isLoading,
    error,
    refetch: fetchGrades,
    exportPdf,
    setSelectedSemester: setSelectedSemesterId,
  }
}
