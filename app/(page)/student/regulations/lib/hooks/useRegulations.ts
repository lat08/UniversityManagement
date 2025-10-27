import { useState, useEffect, useCallback } from 'react'
import { regulationsApi } from '../api/regulationsApi'
import { Regulation } from '../types/types'

interface UseRegulationsParams {
  pageIndex?: number
  pageSize?: number
  orderBy?: number
}

interface UseRegulationsReturn {
  regulations: Regulation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useRegulations = (params: UseRegulationsParams = {}): UseRegulationsReturn => {
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { pageIndex, pageSize, orderBy } = params

  const fetchRegulations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await regulationsApi.getRegulations({ pageIndex, pageSize, orderBy })
      
      if (response.isSuccess) {
        setRegulations(response.data.data)
      } else {
        setError('Không thể tải dữ liệu quy chế')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, orderBy])

  useEffect(() => {
    fetchRegulations()
  }, [fetchRegulations])

  return {
    regulations,
    loading,
    error,
    refetch: fetchRegulations
  }
}
