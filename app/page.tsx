'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getDashboardRoute } from '@/lib/utils/navigation';
import Loading from './loading';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      // Redirect dựa trên role thực tế
      const dashboardRoute = getDashboardRoute(user.role);
      router.replace(dashboardRoute);
    } else {
      router.replace('/login');
    }
  }, [router, isAuthenticated, user?.role]);

  return <Loading />;
}