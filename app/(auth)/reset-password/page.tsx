'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordApi, type ResetPasswordDto } from '@/lib/api/auth';
import { useAuthFlow } from '@/lib/hooks/useAuthFlow';
import { RouteGuard } from '@/app/components/auth/RouteGuard';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { AuthInput } from '@/app/components/auth/AuthInput';
import { AuthButton } from '@/app/components/auth/AuthButton';
import toast from 'react-hot-toast';
import { TEXT } from './constants';

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { forgotPasswordFlow, clearFlow } = useAuthFlow();

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Đặt lại mật khẩu thành công!', {
          duration: 4000,
        });
        // Xóa forgot password flow và chuyển về trang login
        clearFlow();
        router.push('/login');
      } else {
        toast.error('Đặt lại mật khẩu thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: any) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Đặt lại mật khẩu thất bại. Vui lòng thử lại!';
      toast.error(serverMessage, {
        duration: 4000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu mới!');
      return;
    }

    if (!confirmPassword) {
      toast.error('Vui lòng xác nhận mật khẩu!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (!forgotPasswordFlow.passwordResetToken) {
      toast.error('Thông tin không hợp lệ. Vui lòng thử lại từ đầu.');
      return;
    }

    const resetPasswordData: ResetPasswordDto = {
      passwordResetToken: forgotPasswordFlow.passwordResetToken,
      newPassword: password,
    };
    
    resetPassword(resetPasswordData);
  };

  return (
    <AuthLayout
      title={TEXT.title}
      illustration="/change_pass.png"
      showBackButton={true}
      backHref="/verify-otp"
      backText="Quay lại"
      formWidth="w-[420px]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label={TEXT.newPasswordLabel}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={TEXT.placeholder}
          showPasswordToggle={true}
          required
        />

        <AuthInput
          label={TEXT.confirmPasswordLabel}
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder={TEXT.placeholder}
          showPasswordToggle={true}
          required
        />

        <AuthButton
          type="submit"
          loading={isPending}
          loadingText="Đang xử lý..."
        >
          {TEXT.submit}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <RouteGuard requireStep="reset">
      <ResetPasswordContent />
    </RouteGuard>
  );
}


