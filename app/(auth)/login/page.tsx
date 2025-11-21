'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { loginApi } from '@/lib/api/auth';
import { useRoleNavigation } from '../lib/hooks/useRoleNavigation';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import toast from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';

// Zod schema cho login form
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  usePageTitle('Đăng nhập');
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
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response.success) {
        const userRole = response.data.userInfo.roleName;
        
        // Chặn admin đăng nhập qua trang này
        if (userRole === 'Admin' || userRole?.startsWith('Admin_')) {
          toast.error('Tài khoản Admin vui lòng đăng nhập tại trang quản trị!');
          return;
        }

        setIsLoginSuccess(true);
        
        // Lưu token và user info vào Zustand store
        loginSuccess({ 
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: response.data.expiresAt,
          user: {
            id: response.data.userInfo.userId,
            email: response.data.userInfo.email,
            name: response.data.userInfo.fullName || response.data.userInfo.username,
            role: userRole || 'user'
          }
        });
        
        // Hiển thị thông báo thành công
        toast.success(response.message || 'Đăng nhập thành công!', {
          duration: 3000,
        });
        
        // Điều hướng dựa trên role
        navigateToDashboard(userRole);
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      // Lấy thông báo lỗi từ server response
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Đăng nhập thất bại. Vui lòng thử lại!';
      
      // Reset Recaptcha if it's already shown
      if (showRecaptcha && recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaToken(null);
      }

      if (serverMessage.includes('CAPTCHA_REQUIRED')) {
        setShowRecaptcha(true);
        toast.error(serverMessage.replace('CAPTCHA_REQUIRED:', ''));
      } else {
        toast.error(serverMessage, {
          duration: 4000,
        });
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    if (showRecaptcha && !captchaToken) {
      toast.error('Vui lòng xác nhận bạn không phải là người máy!');
      return;
    }
    login({ ...data, recaptchaToken: captchaToken || undefined });
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      illustration="/login-character.png"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthInput
          label="Nhập địa chỉ Email"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register('email', {
            onChange: () => clearErrors('email')
          })}
        />

        <AuthInput
          label="Nhập mật khẩu"
          type="password"
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          showPasswordToggle={true}
          error={errors.password?.message}
          {...register('password', {
            onChange: () => clearErrors('password')
          })}
        />

        {/* Quên mật khẩu */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="font-poppins text-[12px] lg:text-[14px] text-[#000000] hover:text-[#4E8EE1] transition-colors cursor-pointer hover:underline"
          >
            Quên mật khẩu ?
          </Link>
        </div>

        {showRecaptcha && (
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
              onChange={setCaptchaToken}
            />
          </div>
        )}

        <AuthButton
          type="submit"
          disabled={isPending || isLoginSuccess}
          loading={isPending}
          loadingText="Đang đăng nhập..."
        >
          Đăng nhập
        </AuthButton>
      </form>
    </AuthLayout>
  );
}


