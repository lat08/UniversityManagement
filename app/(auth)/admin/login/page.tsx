'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { loginApi } from '@/lib/api/auth';
import { useRoleNavigation } from '../../lib/hooks/useRoleNavigation';
import toast from 'react-hot-toast';

const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const { navigateToDashboard } = useRoleNavigation();
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response.success) {
        const userRole = response.data.userInfo.roleName;
        
        if (userRole !== 'Admin_Principal') {
          toast.error('Chỉ Hiệu trưởng (Admin_Principal) mới có quyền truy cập trang quản trị!');
          return;
        }

        setIsLoginSuccess(true);
        
        loginSuccess({ 
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: response.data.expiresAt,
          user: {
            id: response.data.userInfo.userId,
            email: response.data.userInfo.email,
            name: response.data.userInfo.fullName || response.data.userInfo.username,
            role: userRole
          }
        });
        
        toast.success('Đăng nhập quản trị thành công!');
        navigateToDashboard(userRole);
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           'Đăng nhập thất bại. Vui lòng thử lại!';
      toast.error(serverMessage);
    },
  });

  const onSubmit = (data: AdminLoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-blue-500/40 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              <Image
                src="/logo-siu.webp"
                alt="SIU Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="username@gmail.com"
                {...register('email')}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {errors.email && (
                <p className="text-red-200 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                {...register('password')}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {errors.password && (
                <p className="text-red-200 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || isLoginSuccess}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
