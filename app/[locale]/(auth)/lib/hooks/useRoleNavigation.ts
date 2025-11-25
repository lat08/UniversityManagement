import { useRouter } from '@/i18n/routing';
import { useCallback } from 'react';
import { getDashboardRoute } from '@/lib/utils/navigation';

/**
 * Hook để quản lý navigation dựa trên role với locale support
 * Router từ next-intl đã tự động xử lý locale prefix
 */
export const useRoleNavigation = () => {
  const router = useRouter();

  /**
   * Navigate tới dashboard dựa trên role
   * Router sẽ tự động sử dụng locale hiện tại
   * @param role - Role của user
   * @param replace - Có sử dụng replace thay vì push không (default: true)
   */
  const navigateToDashboard = useCallback((role: string | undefined | null, replace: boolean = true) => {
    // Router từ next-intl sẽ tự động thêm locale prefix
    // Chúng ta chỉ cần truyền route không có locale prefix
    const dashboardRoute = getDashboardRoute(role);
    
    if (replace) {
      router.replace(dashboardRoute);
    } else {
      router.push(dashboardRoute);
    }
  }, [router]);

  /**
   * Navigate tới route cụ thể dựa trên role
   * @param role - Role của user
   * @param subPath - Sub path sau dashboard (vd: 'schedule', 'grades')
   * @param replace - Có sử dụng replace thay vì push không (default: false)
   */
  const navigateToRoleRoute = useCallback((
    role: string | undefined | null, 
    subPath: string, 
    replace: boolean = false
  ) => {
    let basePath = '/student'; // fallback
    
    if (role === 'Student') {
      basePath = '/student';
    } else if (role === 'Instructor') {
      basePath = '/instructor';
    } else if (role?.startsWith('Admin_')) {
      basePath = '/admin';
    }
    
    const fullPath = `${basePath}/${subPath}`;
    
    if (replace) {
      router.replace(fullPath);
    } else {
      router.push(fullPath);
    }
  }, [router]);

  return {
    navigateToDashboard,
    navigateToRoleRoute
  };
};

