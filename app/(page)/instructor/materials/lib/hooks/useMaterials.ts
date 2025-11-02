import { useState, useEffect, useCallback } from "react"
import { materialsApi } from "../api/materialsApi"
import { 
  CourseClassMaterials,
  DocumentType,
  GetMaterialsParams,
  UploadMaterialRequest,
  UpdateMaterialRequest
} from "../type"
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from "../constants"
import toast from "react-hot-toast"

export const useMaterials = () => {
  const [materials, setMaterials] = useState<CourseClassMaterials[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch materials
  const fetchMaterials = useCallback(async (params?: GetMaterialsParams) => {
    try {
      setIsLoading(true)
      setError(null)

      const queryParams: GetMaterialsParams = {
        searchQuery: params?.searchQuery ?? searchQuery,
        pageNumber: params?.pageNumber ?? currentPage,
        pageSize: params?.pageSize ?? pageSize,
      }

      const response = await materialsApi.getMaterials(queryParams)
      
      if (response.success && response.data) {
        setMaterials(response.data.items)
        setTotalCount(response.data.totalCount)
        setTotalPages(response.data.totalPages)
        setHasNext(response.data.hasNext)
        setHasPrevious(response.data.hasPrevious)
        setCurrentPage(response.data.pageNumber)
      } else {
        setMaterials([])
        setError(response.message || "Không thể tải danh sách tài liệu")
      }
    } catch (err) {
      console.error("Error fetching materials:", err)
      setError("Lỗi khi tải danh sách tài liệu")
      setMaterials([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, currentPage, pageSize])

  // Fetch document types
  const fetchDocumentTypes = useCallback(async () => {
    try {
      const response = await materialsApi.getDocumentTypes()
      
      if (response.success && response.data) {
        setDocumentTypes(response.data)
      }
    } catch (err) {
      console.error("Error fetching document types:", err)
    }
  }, [])

  // Upload material
  const uploadMaterial = useCallback(async (data: UploadMaterialRequest) => {
    try {
      setIsLoading(true)
      const response = await materialsApi.uploadMaterial(data)
      
      if (response.success) {
        toast.success(response.message || "Tải lên tài liệu thành công!")
        // Refresh materials list
        await fetchMaterials()
        return true
      } else {
        toast.error(response.message || "Tải lên tài liệu thất bại")
        return false
      }
    } catch (err) {
      console.error("Error uploading material:", err)
      toast.error("Lỗi khi tải lên tài liệu")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchMaterials])

  // Update material
  const updateMaterial = useCallback(async (documentId: string, data: UpdateMaterialRequest) => {
    try {
      setIsLoading(true)
      const response = await materialsApi.updateMaterial(documentId, data)
      
      if (response.success) {
        toast.success(response.message || "Cập nhật tài liệu thành công!")
        // Refresh materials list
        await fetchMaterials()
        return true
      } else {
        toast.error(response.message || "Cập nhật tài liệu thất bại")
        return false
      }
    } catch (err) {
      console.error("Error updating material:", err)
      toast.error("Lỗi khi cập nhật tài liệu")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchMaterials])

  // Delete material
  const deleteMaterial = useCallback(async (documentId: string) => {
    try {
      setIsLoading(true)
      const response = await materialsApi.deleteMaterial(documentId)
      
      if (response.success) {
        toast.success(response.message || "Xóa tài liệu thành công!")
        // Refresh materials list
        await fetchMaterials()
        return true
      } else {
        toast.error(response.message || "Xóa tài liệu thất bại")
        return false
      }
    } catch (err) {
      console.error("Error deleting material:", err)
      toast.error("Lỗi khi xóa tài liệu")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchMaterials])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(DEFAULT_PAGE_NUMBER) // Reset to first page when searching
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Load initial data
  useEffect(() => {
    fetchMaterials()
    fetchDocumentTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Fetch materials when search or page changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMaterials()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentPage, fetchMaterials])

  return {
    materials,
    documentTypes,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrevious,
    searchQuery,
    fetchMaterials,
    uploadMaterial,
    updateMaterial,
    deleteMaterial,
    handleSearch,
    handlePageChange,
  }
}

