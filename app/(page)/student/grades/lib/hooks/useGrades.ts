import { useState, useEffect, useCallback } from 'react'
import { gradesApi } from '../api/gradesApi'
import { CumulativeGradesData } from '../types/types'
import { Semester } from '@/lib/types/common'

interface UseGradesReturn {
  cumulativeData: CumulativeGradesData | null
  commonSemesters: Semester[]
  isLoading: boolean
  error: string | null
  exportPdf: () => Promise<void>
}

export const useGrades = (): UseGradesReturn => {
  const [cumulativeData, setCumulativeData] = useState<CumulativeGradesData | null>(null)
  const [commonSemesters, setCommonSemesters] = useState<Semester[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGrades = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [cumulativeResponse, semestersResponse] = await Promise.all([
        gradesApi.getCumulativeGrades(),
        gradesApi.getCommonSemesters()
      ])
      
      if (cumulativeResponse.success) {
        setCumulativeData(cumulativeResponse.data)
      } else {
        setError(cumulativeResponse.message || 'Không thể tải dữ liệu điểm')
      }

      if (semestersResponse.success) {
        setCommonSemesters(semestersResponse.data)
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
    isLoading,
    error,
    exportPdf,
  }
}
