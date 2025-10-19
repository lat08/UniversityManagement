'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import AuthErrorBoundary from './AuthErrorBoundary';
import AuthLoading from './AuthLoading';

import { UserRole, RequireRoleAuthProps } from '../lib/types/types';

// Note: Database lưu "Student", "Instructor", "Admin" (viết hoa)
// Component sẽ so sánh trực tiếp với case-sensitive

 

// Custom hook để tái sử dụng logic auth guard
const useAuthGuard = (allowedRoles: UserRole[], redirectTo: string = '/login') => {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const router = useRouter();

  // Memoize auth state để tránh re-render không cần thiết
  const authState = useMemo(() => {
    // So sánh trực tiếp với case-sensitive vì database lưu chính xác "Student", "Instructor", "Admin"
    const userRole = user?.role as UserRole;
    
    return {
      isAuthenticated,
      accessToken,
      userRole,
      hasValidToken: isAuthenticated && accessToken,
      isAuthorized: isAuthenticated && accessToken && allowedRoles.includes(userRole)
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
    return <AuthLoading />;
  }

  // Nếu không có auth hoặc không đủ quyền, hiển thị loading
  // useEffect trong useAuthGuard sẽ tự động redirect
  if (!hasValidToken || !isAuthorized) {
    return <AuthLoading />;
  }

  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  );
}

export default RequireRoleAuth;
