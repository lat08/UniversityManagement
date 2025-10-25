import { useState, useEffect } from 'react'
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
  pagination: {
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  } | null
  refetch: () => Promise<void>
}

export const useRegulations = (params: UseRegulationsParams = {}): UseRegulationsReturn => {
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseRegulationsReturn['pagination']>(null)

  const fetchRegulations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await regulationsApi.getRegulations(params)
      
      if (response.isSuccess) {
        setRegulations(response.data.data)
        setPagination({
          totalCount: response.data.totalCount,
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages,
          hasNextPage: response.data.hasNextPage,
          hasPreviousPage: response.data.hasPreviousPage
        })
      } else {
        setError('Không thể tải dữ liệu quy chế')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegulations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.pageIndex, params.pageSize, params.orderBy])

  return {
    regulations,
    loading,
    error,
    pagination,
    refetch: fetchRegulations
  }
}

