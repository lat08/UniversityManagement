import { useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

import { gradesApi } from '@/lib/api/grades'
import { CumulativeGradesData } from '../types/types'
import { useSemesters } from '@/lib/hooks/useCommonData'
import { queryKeys } from '@/lib/api/queryKeys'

interface UseGradesReturn {
  cumulativeData: CumulativeGradesData | null
  commonSemesters: ReturnType<typeof useSemesters>['data']
  isLoading: boolean
  error: string | null
  exportPdf: () => void
  isExporting: boolean
}

export const useGrades = (): UseGradesReturn => {
  const { data: allSemesters, loading: semestersLoading } = useSemesters()
  
  const { 
    data: cumulativeData = null, 
    isLoading: gradesLoading,
    error: gradesError,
  } = useQuery({
    queryKey: queryKeys.grades.cumulative(),
    queryFn: async () => {
      const response = await gradesApi.getCumulativeGrades()
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || 'Không thể tải dữ liệu điểm')
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
  
  const commonSemesters = useMemo(() => {
    if (!cumulativeData || !cumulativeData.semesters) return []
    
    const now = new Date()
    const semesterIdsWithGrades = new Set(
      cumulativeData.semesters.map(s => s.semesterId)
    )
    
    return allSemesters.filter(semester => {
      const hasGrades = semesterIdsWithGrades.has(semester.semesterId)
      const hasStarted = semester.startDate && new Date(semester.startDate) <= now
      return hasGrades && hasStarted
    })
  }, [cumulativeData, allSemesters])

  const { mutate: exportPdf, isPending: isExporting } = useMutation({
    mutationFn: async () => {
      const blob = await gradesApi.exportTranscriptPdf()
      const fileName = `BangDiem_${new Date().toISOString().split('T')[0].replaceAll('-', '')}.pdf`
      
      const { downloadFileBlob } = await import('@/lib/utils/fileDownload')
      downloadFileBlob(blob, fileName)
    },
    onError: () => {
      toast.error('Không thể xuất file PDF')
    },
  })

  const finalLoading = gradesLoading || semestersLoading
  const finalData = finalLoading ? null : cumulativeData

  return {
    cumulativeData: finalData,
    commonSemesters,
    isLoading: finalLoading,
    error: gradesError?.message ?? null,
    exportPdf,
    isExporting,
  }
}
