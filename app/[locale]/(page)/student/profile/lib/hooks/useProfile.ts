import { useQuery, useMutation } from '@tanstack/react-query'
import { getStudentProfile, changePassword } from '../api/profileApi'
import type { StudentProfile, ChangePasswordRequest } from '../types/types'
import { queryKeys } from '@/lib/api/queryKeys'
import toast from 'react-hot-toast'

interface UseProfileReturn {
  profile: StudentProfile | null
  isLoading: boolean
  error: string | null
  handleChangePassword: (data: ChangePasswordRequest) => Promise<{ success: boolean; message: string }>
  refetch: () => Promise<void>
}

export const useProfile = (): UseProfileReturn => {
  const profileKey = queryKeys.profile.student()

  const {
    data: profile = null,
    isLoading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: profileKey,
    queryFn: async () => {
      const response = await getStudentProfile()
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải thông tin profile')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) return false
      }
      return failureCount < 2
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await changePassword(data)
      if (!response.success) {
        throw new Error(response.message || 'Đổi mật khẩu thất bại')
      }
      return response
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Đổi mật khẩu thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu')
    },
  })

  const handleChangePassword = async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await changePasswordMutation.mutateAsync(data)
      return { success: true, message: response.message || 'Đổi mật khẩu thành công!' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đổi mật khẩu',
      }
    }
  }

  const refetch = async () => {
    await refetchQuery()
  }

  return {
    profile,
    isLoading,
    error: queryError instanceof Error ? queryError.message : null,
    handleChangePassword,
    refetch,
  }
}
