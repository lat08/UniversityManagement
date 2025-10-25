'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordApi, type ResetPasswordDto } from '@/lib/api/auth';
import { useAuthFlow } from '../lib/hooks/useAuthFlow';
import { RouteGuard } from '../components/RouteGuard';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import toast from 'react-hot-toast';
import { TEXT } from './lib/constants';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
  confirmPassword: z
    .string()
    .min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  usePageTitle('Đặt lại mật khẩu');
  const router = useRouter();
  const { forgotPasswordFlow, clearFlow } = useAuthFlow();
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (response) => {
      if (response.success) {
        setIsResetSuccess(true);
        
        toast.success(response.message || 'Đặt lại mật khẩu thành công!', {
          duration: 4000,
        });
        clearFlow();
        router.push('/login');
      } else {
        toast.error('Đặt lại mật khẩu thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Đặt lại mật khẩu thất bại. Vui lòng thử lại!';
      toast.error(serverMessage, {
        duration: 4000,
      });
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!forgotPasswordFlow.passwordResetToken) {
      toast.error('Thông tin không hợp lệ. Vui lòng thử lại từ đầu.');
      return;
    }

    const resetPasswordData: ResetPasswordDto = {
      passwordResetToken: forgotPasswordFlow.passwordResetToken,
      newPassword: data.password,
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthInput
          label={TEXT.newPasswordLabel}
          type="password"
          placeholder={TEXT.placeholder}
          showPasswordToggle={true}
          error={errors.password?.message}
          {...register('password', {
            onChange: () => clearErrors('password')
          })}
        />

        <AuthInput
          label={TEXT.confirmPasswordLabel}
          type="password"
          placeholder={TEXT.placeholder}
          showPasswordToggle={true}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            onChange: () => clearErrors('confirmPassword')
          })}
        />

        <AuthButton
          type="submit"
          disabled={isPending || isResetSuccess}
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


