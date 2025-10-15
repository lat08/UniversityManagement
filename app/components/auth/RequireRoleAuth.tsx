'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import AuthErrorBoundary from './AuthErrorBoundary';

type UserRole = 'student' | 'admin' | 'instructor';

// Note: Database có thể lưu "Student", "Admin", "Instructor" (viết hoa)
// Component sẽ normalize về lowercase để so sánh

interface RequireRoleAuthProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

// Custom hook để tái sử dụng logic auth guard
const useAuthGuard = (allowedRoles: UserRole[], redirectTo: string = '/login') => {
  const { isAuthenticated, accessToken, user } = useAppSelector(s => s.auth);
  const router = useRouter();

  // Memoize auth state để tránh re-render không cần thiết
  const authState = useMemo(() => {
    // Normalize case để xử lý database có thể lưu "Student" hoặc "student"
    const normalizedUserRole = user?.role?.toLowerCase() as UserRole;
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    return {
      isAuthenticated,
      accessToken,
      userRole: normalizedUserRole,
      hasValidToken: isAuthenticated && accessToken,
      isAuthorized: isAuthenticated && accessToken && normalizedAllowedRoles.includes(normalizedUserRole)
    };
  }, [isAuthenticated, accessToken, user?.role, allowedRoles]);

  // Memoize redirect function
  const redirect = useCallback(() => {
    router.replace(redirectTo);
  }, [router, redirectTo]);

  // Effect để handle redirect logic
  useEffect(() => {
    if (!authState.hasValidToken) {
      redirect();
      return;
    }

    if (!authState.isAuthorized) {
      redirect();
    }
  }, [authState.hasValidToken, authState.isAuthorized, redirect]);

  return authState;
};

export function RequireRoleAuth({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: RequireRoleAuthProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthorized, hasValidToken } = useAuthGuard(allowedRoles, redirectTo);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Nếu không có auth hoặc không đủ quyền, trả về null
  // useEffect trong useAuthGuard sẽ tự động redirect
  if (!hasValidToken || !isAuthorized) {
    return null;
  }

  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  );
}

export default RequireRoleAuth;
