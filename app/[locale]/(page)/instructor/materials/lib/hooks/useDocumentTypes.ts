import { useState, useEffect, useCallback } from 'react'
import { materialsApi } from '../api/materialsApi'
import { DocumentType } from '../type'
import { AxiosError } from 'axios'

interface UseDocumentTypesReturn {
  documentTypes: DocumentType[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useDocumentTypes = (): UseDocumentTypesReturn => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocumentTypes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await materialsApi.getDocumentTypes()
      
      if (response.success) {
        setDocumentTypes(response.data)
      } else {
        setError(response.message || 'Không thể tải danh sách loại tài liệu')
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      setError(
        axiosErr.response?.data?.message || 
        'Đã xảy ra lỗi khi tải loại tài liệu. Vui lòng thử lại sau.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDocumentTypes()
  }, [fetchDocumentTypes])

  const handleRefetch = useCallback(() => {
    void fetchDocumentTypes()
  }, [fetchDocumentTypes])

  return {
    documentTypes,
    loading,
    error,
    refetch: handleRefetch,
  }
}

