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
    const response = await api.post('/v1/instructors/me/change-password', payload)
    return response.data
  }
}

