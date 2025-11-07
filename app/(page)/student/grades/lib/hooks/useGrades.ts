import { useState, useEffect, useCallback, useMemo } from 'react'
import { gradesApi } from '../api/gradesApi'
import { CumulativeGradesData } from '../types/types'
import { useSemesters } from '@/lib/hooks/useCommonData'

interface UseGradesReturn {
  cumulativeData: CumulativeGradesData | null
  commonSemesters: ReturnType<typeof useSemesters>['data']
  isLoading: boolean
  error: string | null
  exportPdf: () => Promise<void>
}

export const useGrades = (): UseGradesReturn => {
  const [cumulativeData, setCumulativeData] = useState<CumulativeGradesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { data: allSemesters, loading: semestersLoading } = useSemesters()
  
  // Filter chỉ giữ lại các học kỳ có data điểm từ API
  const commonSemesters = useMemo(() => {
    if (!cumulativeData || !cumulativeData.semesters) return []
    
    const semesterIdsWithGrades = new Set(
      cumulativeData.semesters.map(s => s.semesterId)
    )
    
    return allSemesters.filter(semester => 
      semesterIdsWithGrades.has(semester.semesterId)
    )
  }, [cumulativeData, allSemesters])

  const fetchGrades = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const cumulativeResponse = await gradesApi.getCumulativeGrades()
      
      console.log('API Response - Cumulative Grades:', cumulativeResponse)
      
      if (cumulativeResponse.success) {
        setCumulativeData(cumulativeResponse.data)
      } else {
        setError(cumulativeResponse.message || 'Không thể tải dữ liệu điểm')
      }
    } catch (err) {
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
      const fileName = `BangDiem_${new Date().toISOString().split('T')[0].replaceAll('-', '')}.pdf`
      
      const { downloadFileBlob } = await import('@/lib/utils/fileDownload')
      downloadFileBlob(blob, fileName)
    } catch (err: unknown) {
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
    commonSemesters,
    isLoading: isLoading || semestersLoading,
    error,
    exportPdf,
  }
}
