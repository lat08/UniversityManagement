import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profileApi } from '../api/profileApi'
import { InstructorProfile, UpdateProfilePayload, ChangePasswordPayload } from '../types/types'
import { useAuthStore } from '@/lib/store/authStore'
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
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await profileApi.getProfile()
      
      if (response.success) {
        setProfile(response.data)
      } else {
        setError('Không thể tải thông tin hồ sơ')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  const updateProfileData = async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      setUpdating(true)
      setUpdateError(null)
      
      const response = await profileApi.updateProfile(payload)
      
      if (response.success) {
        setProfile(response.data)
        toast.success('Cập nhật hồ sơ thành công!')
        return true
      } else {
        const errorMsg = 'Không thể cập nhật hồ sơ'
        setUpdateError(errorMsg)
        toast.error(errorMsg)
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      setUpdateError(errorMsg)
      toast.error(errorMsg)
      return false
    } finally {
      setUpdating(false)
    }
  }

  const updateAvatarData = async (file: File): Promise<boolean> => {
    try {
      setUpdating(true)
      setUpdateError(null)
      
      const response = await profileApi.updateAvatar(file)
      
      if (response.success && profile) {
        setProfile({ ...profile, profilePicture: response.data.profilePicture })
        toast.success('Cập nhật ảnh đại diện thành công!')
        return true
      } else {
        const errorMsg = 'Không thể cập nhật ảnh đại diện'
        setUpdateError(errorMsg)
        toast.error(errorMsg)
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      setUpdateError(errorMsg)
      toast.error(errorMsg)
      return false
    } finally {
      setUpdating(false)
    }
  }

  const changePasswordData = async (payload: ChangePasswordPayload): Promise<boolean> => {
    try {
      setUpdating(true)
      setUpdateError(null)
      
      const response = await profileApi.changePassword(payload)
      
      if (response.success) {
        toast.success(response.message || 'Đổi mật khẩu thành công!')
        // Xóa tokens từ localStorage và logout sau 2 giây
        setTimeout(() => {
          // Xóa tokens từ localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
          // Logout và redirect về trang login
          logout()
          router.push("/login")
        }, 2000)
        return true
      } else {
        // Extract validation errors from response
        if (response.errors) {
          const errorMessages: string[] = []
          Object.values(response.errors).forEach((value) => {
            if (Array.isArray(value)) {
              errorMessages.push(...value)
            }
          })
          const errorMsg = errorMessages.join('. ') || 'Không thể thay đổi mật khẩu'
          setUpdateError(errorMsg)
          toast.error(errorMsg)
        } else {
          const errorMsg = response.message || 'Không thể thay đổi mật khẩu'
          setUpdateError(errorMsg)
          toast.error(errorMsg)
        }
        return false
      }
    } catch (err: unknown) {
      // Handle errors from API (đã được xử lý trong profileApi.changePassword)
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      setUpdateError(errorMsg)
      toast.error(errorMsg)
      return false
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    error,
    updating,
    updateError,
    refetch: fetchProfile,
    updateProfile: updateProfileData,
    updateAvatar: updateAvatarData,
    changePassword: changePasswordData
  }
}

