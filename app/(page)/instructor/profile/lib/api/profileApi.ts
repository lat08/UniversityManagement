import { api } from '../../../../../../lib/api/client'
import { ApiResponse, InstructorProfile, UpdateProfilePayload, ChangePasswordPayload } from '../types/types'

export const profileApi = {
  /**
   * Lấy thông tin hồ sơ giảng viên
   */
  getProfile: async (): Promise<ApiResponse<InstructorProfile>> => {
    const response = await api.get('/v1/instructors/me')
    return response.data
  },

  /**
   * Cập nhật thông tin hồ sơ giảng viên
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<InstructorProfile>> => {
    const response = await api.put('/v1/instructors/me', payload)
    return response.data
  },

  /**
   * Cập nhật avatar giảng viên
   */
  updateAvatar: async (file: File): Promise<ApiResponse<{ profilePicture: string }>> => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await api.put('/v1/instructors/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Thay đổi mật khẩu của giảng viên
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/v1/instructors/me/change-password', payload)
      return response.data
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { 
          status?: number
          data?: { 
            message?: string
            errors?: Record<string, string[]>
          } 
        } 
      }
      
      if (axiosError.response?.status === 401) {
        throw new Error(axiosError.response?.data?.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      }
      
      if (axiosError.response?.status === 400) {
        // Xử lý validation errors từ API
        const errorData = axiosError.response?.data
        if (errorData?.errors) {
          // Lấy tất cả các lỗi validation và nối lại
          const validationErrors = Object.values(errorData.errors).flat()
          if (validationErrors.length > 0) {
            throw new Error(validationErrors.join('. '))
          }
        }
        // Nếu có message thì dùng message
        if (errorData?.message) {
          throw new Error(errorData.message)
        }
        throw new Error("Mật khẩu không hợp lệ")
      }
      
      throw new Error(axiosError.response?.data?.message || "Không thể đổi mật khẩu")
    }
  }
}

