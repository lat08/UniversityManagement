import { useState, useEffect, useCallback } from "react"
import { materialsApi } from "../api/materialsApi"
import { 
  CourseClassMaterials,
  GetMaterialsParams,
  UploadMaterialRequest,
  UpdateMaterialRequest
} from "../type"
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from "../constants"
import toast from "react-hot-toast"
import { AxiosError } from 'axios'

interface UseMaterialsReturn {
  materials: CourseClassMaterials[]
  loading: boolean
  error: string | null
  refetch: () => void
  totalCount: number
  uploadMaterial: (data: UploadMaterialRequest) => Promise<boolean>
  updateMaterial: (documentId: string, data: UpdateMaterialRequest) => Promise<boolean>
  deleteMaterial: (documentId: string) => Promise<boolean>
}

export const useMaterials = (params?: GetMaterialsParams): UseMaterialsReturn => {
  const [materials, setMaterials] = useState<CourseClassMaterials[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await materialsApi.getMaterials(params)
      
      if (response.success && response.data) {
        const items = response.data.items || []
        setMaterials(items)
        setTotalCount(response.data.totalCount || 0)
      } else {
        setError(response.message || "Không thể tải danh sách tài liệu")
        setMaterials([])
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; data?: { message?: string } }>
      const errorMessage = 
        axiosErr.response?.data?.message || 
        axiosErr.response?.data?.data?.message ||
        axiosErr.message ||
        'Đã xảy ra lỗi khi tải tài liệu. Vui lòng thử lại sau.'
      setError(errorMessage)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [
    params?.keyword,
    params?.documentType,
    params?.semesterId,
    params?.subjectId,
    params?.pageNumber,
    params?.pageSize
  ])

  const uploadMaterial = useCallback(async (data: UploadMaterialRequest) => {
    try {
      setLoading(true)
      const response = await materialsApi.uploadMaterial(data)
      
      if (response.success) {
        toast.success(response.message || "Tải lên tài liệu thành công!")
        await fetchMaterials()
        return true
      } else {
        toast.error(response.message || "Tải lên tài liệu thất bại")
        return false
      }
    } catch (err) {
      toast.error("Lỗi khi tải lên tài liệu")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchMaterials])

  const updateMaterial = useCallback(async (documentId: string, data: UpdateMaterialRequest) => {
    try {
      setLoading(true)
      const response = await materialsApi.updateMaterial(documentId, data)
      
      if (response.success) {
        toast.success(response.message || "Cập nhật tài liệu thành công!")
        await fetchMaterials()
        return true
      } else {
        toast.error(response.message || "Cập nhật tài liệu thất bại")
        return false
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật tài liệu")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchMaterials])

  const deleteMaterial = useCallback(async (documentId: string) => {
    try {
      setLoading(true)
      const response = await materialsApi.deleteMaterial(documentId)
      
      if (response.success) {
        toast.success(response.message || "Xóa tài liệu thành công!")
        await fetchMaterials()
        return true
      } else {
        toast.error(response.message || "Xóa tài liệu thất bại")
        return false
      }
    } catch (err) {
      toast.error("Lỗi khi xóa tài liệu")
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchMaterials])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  return {
    materials,
    loading,
    error,
    refetch: fetchMaterials,
    totalCount,
    uploadMaterial,
    updateMaterial,
    deleteMaterial,
  }
}
