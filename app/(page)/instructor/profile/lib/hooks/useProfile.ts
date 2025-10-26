import { useState, useEffect } from 'react'
import { profileApi } from '../api/profileApi'
import { InstructorProfile, UpdateProfilePayload, ChangePasswordPayload } from '../types/types'
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
        toast.success('Đổi mật khẩu thành công!')
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
          const errorMsg = errorMessages.join(', ') || 'Không thể thay đổi mật khẩu'
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
      // Handle axios errors with validation messages
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { errors?: Record<string, string[]> | unknown } } }
        if (axiosError.response?.data?.errors && typeof axiosError.response.data.errors === 'object') {
          const errorMessages: string[] = []
          Object.values(axiosError.response.data.errors as Record<string, string[]>).forEach((value) => {
            if (Array.isArray(value)) {
              errorMessages.push(...value)
            }
          })
          const errorMsg = errorMessages.join(', ') || 'Dữ liệu không hợp lệ'
          setUpdateError(errorMsg)
          toast.error(errorMsg)
        } else {
          const errorMsg = 'Đã xảy ra lỗi không xác định'
          setUpdateError(errorMsg)
          toast.error(errorMsg)
        }
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
        setUpdateError(errorMsg)
        toast.error(errorMsg)
      }
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

