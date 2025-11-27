import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import { materialsApi } from '../api/materialsApi'
import { queryKeys } from '@/lib/api/queryKeys'
import { 
  ApiResponse, 
  MaterialResponseDto, 
  UploadMaterialRequest, 
  UpdateMaterialRequest
} from '../type'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

interface ErrorResponse {
  message?: string
}

export const useUploadMaterialMutation = (): UseMutationResult<
  ApiResponse<MaterialResponseDto>,
  Error,
  UploadMaterialRequest,
  unknown
> => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UploadMaterialRequest) => materialsApi.uploadMaterial(data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.materials.lists() })
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<ErrorResponse>
      const errorMessage = axiosError.response?.data?.message || 'Lỗi khi tải lên tài liệu'
      toast.error(errorMessage)
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Tải lên tài liệu thành công!')
        void queryClient.invalidateQueries({ queryKey: queryKeys.materials.lists() })
      } else {
        toast.error(response.message || 'Tải lên tài liệu thất bại')
      }
    },
  })
}

export const useUpdateMaterialMutation = (): UseMutationResult<
  ApiResponse<string>,
  Error,
  { documentId: string; data: UpdateMaterialRequest },
  unknown
> => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: UpdateMaterialRequest }) => 
      materialsApi.updateMaterial(documentId, data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.materials.lists() })
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<ErrorResponse>
      const errorMessage = axiosError.response?.data?.message || 'Lỗi khi cập nhật tài liệu'
      toast.error(errorMessage)
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Cập nhật tài liệu thành công!')
        void queryClient.invalidateQueries({ queryKey: queryKeys.materials.lists() })
      } else {
        toast.error(response.message || 'Cập nhật tài liệu thất bại')
      }
    },
  })
}

export const useDeleteMaterialMutation = (): UseMutationResult<
  ApiResponse<string>,
  Error,
  string,
  unknown
> => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (documentId: string) => materialsApi.deleteMaterial(documentId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.materials.lists() })
    },
    onError: (error: Error) => {
      const axiosError = error as AxiosError<ErrorResponse>
      const errorMessage = axiosError.response?.data?.message || 'Lỗi khi xóa tài liệu'
      toast.error(errorMessage)
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Xóa tài liệu thành công!')
        void queryClient.invalidateQueries({ queryKey: queryKeys.materials.lists() })
      } else {
        toast.error(response.message || 'Xóa tài liệu thất bại')
      }
    },
  })
}

