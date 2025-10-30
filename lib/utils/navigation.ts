/**
 * Utility functions for role-based navigation
 */

export type UserRole = 
  | 'Student' 
  | 'Instructor' 
  | 'Admin_Principal' 
  | 'Admin_Accountant' 
  | 'Admin_Facilities' 
  | 'Admin_HR' 
  | 'Admin_Academic';

/**
 * Kiểm tra xem role có phải là Admin role không
 */
export const isAdminRole = (role: string | undefined | null): boolean => {
  return role?.startsWith('Admin_') || false;
};

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
    case 'Admin_Principal':
    case 'Admin_Accountant':
    case 'Admin_Facilities':
    case 'Admin_HR':
    case 'Admin_Academic':
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
  const validRoles: UserRole[] = [
    'Student',
    'Instructor', 
    'Admin_Principal',
    'Admin_Accountant',
    'Admin_Facilities',
    'Admin_HR',
    'Admin_Academic'
  ];
  return validRoles.includes(role as UserRole);
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
    case 'Admin_Principal':
      return 'Hiệu trưởng';
    case 'Admin_Accountant':
      return 'Kế toán';
    case 'Admin_Facilities':
      return 'Quản lý cơ sở vật chất';
    case 'Admin_HR':
      return 'Nhân sự';
    case 'Admin_Academic':
      return 'Quản lý học vụ';
    default:
      return 'Người dùng';
  }
};
