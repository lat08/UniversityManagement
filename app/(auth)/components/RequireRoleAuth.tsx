'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import AuthErrorBoundary from './AuthErrorBoundary';
import AuthLoading from './AuthLoading';
import { routing } from '@/i18n/routing';
import { UserRole, RequireRoleAuthProps } from '../lib/types/types';

// Note: Database lưu "Student", "Instructor", "Admin" (viết hoa)
// Component sẽ so sánh trực tiếp với case-sensitive

 

// Custom hook để tái sử dụng logic auth guard
type Locale = (typeof routing.locales)[number];
const SUPPORTED_LOCALES = new Set(routing.locales);

const getLocaleFromPathname = (pathname?: string | null): Locale => {
  if (!pathname) return routing.defaultLocale as Locale;
  const [, potentialLocale] = pathname.split('/');
  if (potentialLocale && SUPPORTED_LOCALES.has(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }
  return routing.defaultLocale as Locale;
};

const useAuthGuard = (allowedRoles: UserRole[], redirectTo: string) => {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Memoize auth state để tránh re-render không cần thiết
  const authState = useMemo(() => {
    // So sánh trực tiếp với case-sensitive vì database lưu chính xác "Student", "Instructor", "Admin"
    const userRole = user?.role as UserRole;
    
    // Ensure we have all required data
    const hasValidToken = !!(isAuthenticated && accessToken && user);
    const isAuthorized = hasValidToken && userRole && allowedRoles.includes(userRole);
    
    return {
      isAuthenticated,
      accessToken,
      userRole,
      hasValidToken,
      isAuthorized
    };
  }, [isAuthenticated, accessToken, user, allowedRoles]);

  // Memoize redirect function
  const redirect = useCallback(() => {
    router.replace(redirectTo);
  }, [router, redirectTo]);

  // Effect để handle redirect logic
  useEffect(() => {
    // Give zustand time to rehydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isChecking) return;

    if (!authState.hasValidToken) {
      redirect();
      return;
    }

    if (!authState.isAuthorized) {
      redirect();
    }
  }, [isChecking, authState.hasValidToken, authState.isAuthorized, redirect]);

  return { ...authState, isChecking };
};

export function RequireRoleAuth({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: RequireRoleAuthProps) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);
  const resolvedRedirect = redirectTo === '/login' ? `/${locale}/login` : redirectTo;
  const { isAuthorized, hasValidToken, isChecking } = useAuthGuard(allowedRoles, resolvedRedirect);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading while checking or not mounted
  if (!isMounted || isChecking) {
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
