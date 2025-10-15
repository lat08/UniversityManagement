'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { loginSuccess } from '@/lib/store/features/authSlice';
import { loginApi, type LoginDto } from '@/lib/api/auth';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useRoleNavigation } from '@/lib/hooks/useRoleNavigation';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { AuthInput } from '@/app/components/auth/AuthInput';
import { AuthButton } from '@/app/components/auth/AuthButton';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { navigateToDashboard } = useRoleNavigation();
  
  // Debounce email input để tránh validation liên tục
  const debouncedEmail = useDebounce(email, 300);

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response.success) {
        // Lưu token và user info vào Redux store
        dispatch(loginSuccess({ 
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: response.data.expiresAt,
          user: {
            id: response.data.userInfo.userId,
            email: response.data.userInfo.email,
            name: response.data.userInfo.fullName || response.data.userInfo.username,
            role: response.data.userInfo.roles[0] || 'user'
          }
        }));
        
        // Hiển thị thông báo thành công
        toast.success(response.message || 'Đăng nhập thành công!', {
          duration: 3000,
        });
        
        // Điều hướng dựa trên role
        const userRole = response.data.userInfo.roles[0];
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

  // Memoize validation logic
  const isFormValid = useMemo(() => {
    return debouncedEmail.length > 0 && password.length > 0;
  }, [debouncedEmail, password]);

  // Memoize submit handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const loginData: LoginDto = { email: debouncedEmail, password };
    login(loginData);
  }, [isFormValid, debouncedEmail, password, login]);

  return (
    <AuthLayout
      title="Đăng nhập"
      illustration="/login-character.png"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Nhập địa chỉ Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email"
          required
        />

        <AuthInput
          label="Nhập mật khẩu"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Mật khẩu"
          showPasswordToggle={true}
          required
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
          loading={isPending}
          loadingText="Đang đăng nhập..."
        >
          Đăng nhập
        </AuthButton>
      </form>
    </AuthLayout>
  );
}


