/**
 * Utility functions for role-based navigation
 */

export type UserRole = 'Student' | 'Instructor' | 'Admin';

/**
 * Lấy route dashboard dựa trên role của user
 * @param role - Role của user
 * @returns Dashboard route tương ứng
 */
export const getDashboardRoute = (role: string | undefined | null): string => {
  if (!role) return '/student/dashboard'; // Default fallback
  
  switch (role) {
    case 'Student':
      return '/student/dashboard';
    case 'Instructor':
      return '/instructor/dashboard';
    case 'Admin':
      // Admin có trang login riêng, nhưng để fallback
      return '/admin/dashboard';
    default:
      // Fallback mặc định cho Student
      return '/student/dashboard';
  }
};

/**
 * Kiểm tra xem role có hợp lệ không
 * @param role - Role cần kiểm tra
 * @returns true nếu role hợp lệ
 */
export const isValidRole = (role: string | undefined | null): boolean => {
  return role === 'Student' || role === 'Instructor' || role === 'Admin';
};

/**
 * Lấy tên hiển thị của role
 * @param role - Role của user
 * @returns Tên hiển thị của role
 */
export const getRoleDisplayName = (role: string | undefined | null): string => {
  switch (role) {
    case 'Student':
      return 'Sinh viên';
    case 'Instructor':
      return 'Giảng viên';
    case 'Admin':
      return 'Quản trị viên';
    default:
      return 'Người dùng';
  }
};
