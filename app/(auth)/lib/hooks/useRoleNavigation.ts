import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { getDashboardRoute, UserRole } from '@/lib/utils/navigation';

/**
 * Hook để quản lý navigation dựa trên role
 */
export const useRoleNavigation = () => {
  const router = useRouter();

  /**
   * Navigate tới dashboard dựa trên role
   * @param role - Role của user
   * @param replace - Có sử dụng replace thay vì push không (default: true)
   */
  const navigateToDashboard = useCallback((role: string | undefined | null, replace: boolean = true) => {
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
