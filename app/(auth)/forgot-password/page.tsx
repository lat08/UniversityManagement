'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { sendPasswordResetOtpApi, type ForgotPasswordDto } from '@/lib/api/auth';
import { useAuthFlow } from '../lib/hooks/useAuthFlow';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import toast from 'react-hot-toast';
import { TEXT } from './lib/constants';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  usePageTitle('Quên mật khẩu');
  const router = useRouter();
  const { setEmail: setFlowEmail } = useAuthFlow();
  const [isSendSuccess, setIsSendSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { mutate: sendOtp, isPending } = useMutation({
    mutationFn: sendPasswordResetOtpApi,
    onSuccess: (response, variables) => {
      if (response.success) {
        setIsSendSuccess(true);
        
        toast.success(response.message || 'Mã OTP đã được gửi đến email của bạn!', {
          duration: 4000,
        });
        setFlowEmail(variables.email);
        router.push('/verify-otp');
      } else {
        toast.error('Gửi OTP thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Gửi OTP thất bại. Vui lòng thử lại!';
      toast.error(serverMessage, {
        duration: 4000,
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    const forgotPasswordData: ForgotPasswordDto = { email: data.email };
    sendOtp(forgotPasswordData);
  };

  return (
    <AuthLayout
      title={TEXT.title}
      illustration="/forgot_pass.png"
      showBackButton={true}
      backHref="/login"
      backText="Quay lại đăng nhập"
    >
      <p className="font-poppins text-[14px] text-[#666666] mb-8">
        {TEXT.description}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AuthInput
          label={TEXT.emailLabel}
          type="email"
          placeholder={TEXT.emailPlaceholder}
          error={errors.email?.message}
          {...register('email', {
            onChange: () => clearErrors('email')
          })}
        />

        <AuthButton
          type="submit"
          disabled={isPending || isSendSuccess}
          loading={isPending}
          loadingText="Đang gửi..."
        >
          {TEXT.submit}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}


