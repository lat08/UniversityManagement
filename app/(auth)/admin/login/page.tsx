'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { loginApi } from '@/lib/api/auth';
import { useRoleNavigation } from '../../lib/hooks/useRoleNavigation';
import { AuthInput } from '../../components/AuthInput';
import { AuthButton } from '../../components/AuthButton';
import toast from 'react-hot-toast';

// Schema cho admin login
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
    clearErrors,
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response.success) {
        // Kiểm tra role Admin
        if (response.data.userInfo.roleName !== 'Admin') {
          toast.error('Bạn không có quyền truy cập trang quản trị!');
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
            role: response.data.userInfo.roleName
          }
        });
        
        toast.success('Đăng nhập quản trị thành công!', {
          duration: 3000,
        });
        
        navigateToDashboard('Admin');
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Đăng nhập thất bại. Vui lòng thử lại!';
      toast.error(serverMessage, {
        duration: 4000,
      });
    },
  });

  const onSubmit = (data: AdminLoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-[90%] sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full mb-3 md:mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Quản trị hệ thống</h1>
          <p className="text-sm md:text-base text-white/80">Đăng nhập để truy cập bảng điều khiển</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AuthInput
              label="Email quản trị"
              type="email"
              placeholder="admin@university.edu"
              error={errors.email?.message}
              {...register('email', {
                onChange: () => clearErrors('email')
              })}
            />

            <AuthInput
              label="Mật khẩu quản trị"
              type="password"
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              showPasswordToggle={true}
              error={errors.password?.message}
              {...register('password', {
                onChange: () => clearErrors('password')
              })}
            />

            <AuthButton
              type="submit"
              disabled={isPending || isLoginSuccess}
              loading={isPending}
              loadingText="Đang đăng nhập..."
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-200"
            >
              Đăng nhập Quản trị
            </AuthButton>
          </form>

          {/* Back to main login */}
          <div className="mt-4 md:mt-6 text-center">
            <Link
              href="/login"
              className="text-white/70 hover:text-white transition-colors text-xs md:text-sm"
            >
              ← Quay lại đăng nhập thông thường
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 md:mt-8">
          <p className="text-white/60 text-xs md:text-sm">
            Hệ thống quản lý trường đại học
          </p>
        </div>
      </div>
    </div>
  );
}
