'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Kiểm tra token và redirect phù hợp
    if (isAuthenticated) {
      router.replace('/student/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang kiểm tra xác thực...</p>
      </div>
    </div>
  );
}