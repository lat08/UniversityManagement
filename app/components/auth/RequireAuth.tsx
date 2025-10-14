'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { isAuthenticated, accessToken } = useAppSelector(s => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, accessToken, router, redirectTo]);

  if (!isAuthenticated || !accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireAuth;

