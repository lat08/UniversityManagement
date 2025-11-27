'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { RequireRoleAuthProps, UserRole } from '@/lib/types';
import { useAuthStore } from '@/lib/store/authStore';

import AuthErrorBoundary from './AuthErrorBoundary';
import AuthLoading from './AuthLoading';

type Locale = (typeof routing.locales)[number];
const SUPPORTED_LOCALES = new Set(routing.locales);

const getLocaleFromPathname = (pathname?: string | null): Locale => {
  if (!pathname) {
    return routing.defaultLocale as Locale;
  }
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

  const authState = useMemo(() => {
    const userRole = user?.role as UserRole;
    const hasValidToken = Boolean(isAuthenticated && accessToken && user);
    const isAuthorized = hasValidToken && userRole && allowedRoles.includes(userRole);
    return {
      isAuthenticated,
      accessToken,
      userRole,
      hasValidToken,
      isAuthorized,
    };
  }, [isAuthenticated, accessToken, user, allowedRoles]);

  const redirect = useCallback(() => {
    router.replace(redirectTo);
  }, [router, redirectTo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isChecking) {
      return;
    }
    if (!authState.hasValidToken || !authState.isAuthorized) {
      redirect();
    }
  }, [isChecking, authState.hasValidToken, authState.isAuthorized, redirect]);

  return { ...authState, isChecking };
};

export const RequireRoleAuth = ({ children, allowedRoles, redirectTo = '/login' }: RequireRoleAuthProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  const resolvedRedirect = useMemo(() => {
    if (!redirectTo) {
      return `/${locale}/login`;
    }
    if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
      return redirectTo;
    }
    if (redirectTo.startsWith(`/${locale}/`)) {
      return redirectTo;
    }
    if (routing.locales.some((lc) => redirectTo.startsWith(`/${lc}/`))) {
      return redirectTo;
    }
    if (redirectTo.startsWith('/')) {
      return `/${locale}${redirectTo}`;
    }
    return `/${locale}/${redirectTo}`;
  }, [redirectTo, locale]);

  const { isAuthorized, hasValidToken, isChecking } = useAuthGuard(allowedRoles, resolvedRedirect);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isChecking) {
    return <AuthLoading />;
  }

  if (!hasValidToken || !isAuthorized) {
    return <AuthLoading />;
  }

  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
};

export default RequireRoleAuth;

