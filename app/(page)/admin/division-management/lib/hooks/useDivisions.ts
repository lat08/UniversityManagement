import { useState, useCallback } from 'react'
import { divisionsApi } from '../api/divisionsApi'
import type { DivisionListItem, DivisionListResponse, GetDivisionsParams } from '../types/types'

export const useDivisions = () => {
  const [divisions, setDivisions] = useState<DivisionListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchDivisions = useCallback(async (params: GetDivisionsParams = {}) => {
    setLoading(true)
    try {
      const response = await divisionsApi.getDivisions({
        pageNumber: params.pageNumber ?? currentPage,
        pageSize: params.pageSize ?? 10,
        searchTerm: params.searchTerm,
        status: params.status,
      })

      // Backend trả về "success" thay vì "isSuccess"
      const isSuccess = (response as { success?: boolean; isSuccess?: boolean }).success ?? response.isSuccess

      if (isSuccess && response.data) {
        const data: DivisionListResponse = response.data
        setDivisions(data.data)
        setTotalCount(data.pagination.totalCount)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(data.pagination.currentPage)
      } else {
        console.warn('API returned unsuccessful response:', response.message)
        setDivisions([])
      }
    } catch (error) {
      console.error('Failed to fetch divisions:', error)
      setDivisions([])
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  return {
    divisions,
    loading,
    currentPage,
    totalCount,
    totalPages,
    fetchDivisions,
    setCurrentPage,
  }
}
