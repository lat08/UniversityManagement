import { useState, useEffect } from "react"
import { getStudentProfile, changePassword } from "../api/profileApi"
import type { StudentProfile, ChangePasswordRequest } from "../types/types"

export function useProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getStudentProfile()
      if (response.success) {
        setProfile(response.data)
      } else {
        setError(response.message || "Không thể tải thông tin profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    try {
      const response = await changePassword(data)
      if (response.success) {
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message || "Đổi mật khẩu thất bại" }
      }
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : "Đã xảy ra lỗi khi đổi mật khẩu" 
      }
    }
  }

  return {
    profile,
    isLoading,
    error,
    handleChangePassword,
    refetch: fetchProfile,
  }
}

