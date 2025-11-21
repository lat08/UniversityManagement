'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { loginApi } from '@/lib/api/auth';
import { useRoleNavigation } from '../../lib/hooks/useRoleNavigation';
import toast from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
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
        
        if (userRole !== 'Admin' && userRole !== 'Admin_Principal') {
          toast.error('Chỉ Admin hoặc Hiệu trưởng (Admin_Principal) mới có quyền truy cập trang quản trị!');
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
      
      // Reset Recaptcha if it's already shown (user needs to verify again)
      if (showRecaptcha && recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaToken(null);
      }

      if (serverMessage.includes('CAPTCHA_REQUIRED')) {
        setShowRecaptcha(true);
        toast.error(serverMessage.replace('CAPTCHA_REQUIRED:', ''));
      } else {
        toast.error(serverMessage);
      }
    },
  });

  const onSubmit = (data: AdminLoginFormData) => {
    if (showRecaptcha && !captchaToken) {
      toast.error('Vui lòng xác nhận bạn không phải là người máy!');
      return;
    }
    login({ ...data, recaptchaToken: captchaToken || undefined });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop"
          alt="Admin Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-blue-900/20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 transition-transform duration-300 hover:scale-105">
              <Image
                src="/logo-siu.webp"
                alt="SIU Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Cổng Quản Trị</h1>
            <p className="text-gray-500 text-sm mt-2">Đăng nhập để truy cập hệ thống</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="username@gmail.com"
                {...register('email')}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                {...register('password')}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            {showRecaptcha && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Default test key or env
                  onChange={setCaptchaToken}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || isLoginSuccess}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>
        <div className="mt-6 text-center">
            <p className="text-gray-200 text-xs shadow-black drop-shadow-md">© 2025 Saigon International University</p>
        </div>
      </div>
    </div>
  );
}
