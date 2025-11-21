import { useState, useCallback } from 'react'
import { curriculumsApi } from '../api/curriculumsApi'
import type { CurriculumListItem, CurriculumListResponse, GetCurriculumsParams } from '../types/types'

export const useCurriculums = () => {
  const [curriculums, setCurriculums] = useState<CurriculumListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchCurriculums = useCallback(async (params: GetCurriculumsParams = {}) => {
    setLoading(true)
    try {
      const response = await curriculumsApi.getCurriculums({
        pageNumber: params.pageNumber ?? currentPage,
        pageSize: params.pageSize ?? 10,
        facultyId: params.facultyId,
        departmentId: params.departmentId,
        searchKeyword: params.searchKeyword,
      })

      if (response.success && response.data) {
        const data: CurriculumListResponse = response.data
        setCurriculums(data.curriculums)
        setTotalCount(data.totalCount)
        setTotalPages(data.totalPages)
        setCurrentPage(data.pageNumber)
      }
    } catch (error) {
      console.error('Failed to fetch curriculums:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  return {
    curriculums,
    loading,
    currentPage,
    totalCount,
    totalPages,
    fetchCurriculums,
    setCurrentPage,
  }
}
