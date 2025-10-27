import { api } from "@/lib/api/client"
import type { StudentProfileResponse, ChangePasswordRequest, ChangePasswordResponse } from "../types/types"

/**
 * Lấy thông tin profile của sinh viên đang đăng nhập
 */
export async function getStudentProfile(): Promise<StudentProfileResponse> {
  try {
    const response = await api.get<StudentProfileResponse>("/v1/students/me")
    return response.data
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
    if (axiosError.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    }
    throw new Error(axiosError.response?.data?.message || "Không thể tải thông tin profile")
  }
}

/**
 * Đổi mật khẩu sinh viên
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  try {
    const response = await api.post<ChangePasswordResponse>("/v1/auth/change-password", data)
    return response.data
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
    if (axiosError.response?.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    }
    if (axiosError.response?.status === 400) {
      throw new Error(axiosError.response?.data?.message || "Mật khẩu không hợp lệ")
    }
    throw new Error(axiosError.response?.data?.message || "Không thể đổi mật khẩu")
  }
}

