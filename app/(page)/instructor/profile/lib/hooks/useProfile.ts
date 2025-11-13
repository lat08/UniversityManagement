import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { profileApi } from '../api/profileApi'
import { InstructorProfile, UpdateProfilePayload, ChangePasswordPayload } from '../types/types'
import { useAuthStore } from '@/lib/store/authStore'
import { queryKeys } from '@/lib/api/queryKeys'
import toast from 'react-hot-toast'

interface UseProfileReturn {
  profile: InstructorProfile | null
  loading: boolean
  error: string | null
  updating: boolean
  updateError: string | null
  refetch: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>
  updateAvatar: (file: File) => Promise<boolean>
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>
}

export const useProfile = (): UseProfileReturn => {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()
  const profileKey = queryKeys.profile.instructor()

  const {
    data: profile = null,
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: profileKey,
    queryFn: async () => {
      const response = await profileApi.getProfile()
      if (!response.success) {
        throw new Error(response.message || 'Không thể tải thông tin hồ sơ')
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

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await profileApi.updateProfile(payload)
      if (!response.success) {
        throw new Error(response.message || 'Không thể cập nhật hồ sơ')
      }
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey, data)
      queryClient.invalidateQueries({ queryKey: profileKey })
      toast.success('Cập nhật hồ sơ thành công!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật hồ sơ')
    },
  })

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await profileApi.updateAvatar(file)
      if (!response.success) {
        throw new Error(response.message || 'Không thể cập nhật ảnh đại diện')
      }
      return response.data.profilePicture
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: profileKey })
      const previousProfile = queryClient.getQueryData<InstructorProfile>(profileKey)
      const temporaryUrl = URL.createObjectURL(file)

      if (previousProfile) {
        queryClient.setQueryData<InstructorProfile>(profileKey, {
          ...previousProfile,
          profilePicture: temporaryUrl,
        })
      }

      return { previousProfile, temporaryUrl }
    },
    onSuccess: (profilePicture, _variables, context) => {
      queryClient.setQueryData<InstructorProfile | undefined>(profileKey, (old) => {
        if (!old) return old
        return { ...old, profilePicture }
      })
      if (context?.temporaryUrl) {
        URL.revokeObjectURL(context.temporaryUrl)
      }
      toast.success('Cập nhật ảnh đại diện thành công!')
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKey, context.previousProfile)
      }
      if (context?.temporaryUrl) {
        URL.revokeObjectURL(context.temporaryUrl)
      }
      toast.error(error.message || 'Không thể cập nhật ảnh đại diện')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKey })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await profileApi.changePassword(payload)
      if (!response.success) {
        throw new Error(response.message || 'Không thể thay đổi mật khẩu')
      }
      return response
    },
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!')
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
        logout()
        router.push('/login')
      }, 2000)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể thay đổi mật khẩu')
    },
  })

  const refetch = async () => {
    await refetchQuery()
  }

  const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      await updateProfileMutation.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }

  const updateAvatar = async (file: File): Promise<boolean> => {
    try {
      await updateAvatarMutation.mutateAsync(file)
      return true
    } catch {
      return false
    }
  }

  const changePassword = async (payload: ChangePasswordPayload): Promise<boolean> => {
    try {
      await changePasswordMutation.mutateAsync(payload)
      return true
    } catch (error) {
      // Error đã được xử lý trong onError của mutation (toast + updateError state)
      return false
    }
  }

  return {
    profile,
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    updating: updateProfileMutation.isPending || updateAvatarMutation.isPending || changePasswordMutation.isPending,
    updateError: updateProfileMutation.error instanceof Error 
      ? updateProfileMutation.error.message 
      : updateAvatarMutation.error instanceof Error
      ? updateAvatarMutation.error.message
      : changePasswordMutation.error instanceof Error
      ? changePasswordMutation.error.message
      : null,
    refetch,
    updateProfile,
    updateAvatar,
    changePassword,
  }
}
