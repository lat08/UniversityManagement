import { api } from '@/lib/api/client';
import type { AdminDashboardResponse } from '@/lib/types/admin-dashboard';

/**
 * @api GET /v1/dashboard/me
 * @description Lấy dữ liệu dashboard cho người dùng hiện tại (admin, instructor, student). Dashboard admin dùng cho trang tổng quan quản trị.
 * @returns {Promise<AdminDashboardResponse>} Thông tin tổng quan dashboard cho admin.
 * @auth Required (Role: ADMIN)
 */
export const adminDashboardApi = {
  getDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await api.get<AdminDashboardResponse>('/v1/dashboard/me');
    return response.data;
  },
};







