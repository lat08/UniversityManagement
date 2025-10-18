'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { loginApi } from '@/lib/api/auth';
import { useRoleNavigation } from '@/lib/hooks/useRoleNavigation';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { AuthInput } from '@/app/components/auth/AuthInput';
import { AuthButton } from '@/app/components/auth/AuthButton';
import toast from 'react-hot-toast';

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
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const router = useRouter();
  const { navigateToDashboard } = useRoleNavigation();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Validate khi user nhập
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response.success) {
        // Lưu token và user info vào Zustand store
        loginSuccess({ 
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: response.data.expiresAt,
          user: {
            id: response.data.userInfo.userId,
            email: response.data.userInfo.email,
            name: response.data.userInfo.fullName || response.data.userInfo.username,
            role: response.data.userInfo.roleName || 'user'
          }
        });
        
        // Hiển thị thông báo thành công
        toast.success(response.message || 'Đăng nhập thành công!', {
          duration: 3000,
        });
        
        // Điều hướng dựa trên role
        const userRole = response.data.userInfo.roleName;
        navigateToDashboard(userRole);
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: any) => {
      // Lấy thông báo lỗi từ server response
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Đăng nhập thất bại. Vui lòng thử lại!';
      toast.error(serverMessage, {
        duration: 4000,
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
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
          {...register('email')}
        />

        <AuthInput
          label="Nhập mật khẩu"
          type="password"
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          showPasswordToggle={true}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Quên mật khẩu */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="font-poppins text-[14px] text-[#000000] hover:text-[#4E8EE1] transition-colors cursor-pointer hover:underline"
          >
            Quên mật khẩu ?
          </Link>
        </div>

        <AuthButton
          type="submit"
          disabled={!isValid || isPending}
          loading={isPending}
          loadingText="Đang đăng nhập..."
        >
          Đăng nhập
        </AuthButton>
      </form>
    </AuthLayout>
  );
}


