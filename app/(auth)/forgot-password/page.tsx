'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { sendPasswordResetOtpApi, type ForgotPasswordDto } from '@/lib/api/auth';
import { useAuthFlow } from '@/lib/hooks/useAuthFlow';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { AuthInput } from '@/app/components/auth/AuthInput';
import { AuthButton } from '@/app/components/auth/AuthButton';
import toast from 'react-hot-toast';
import { TEXT } from './constants';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setEmail: setFlowEmail } = useAuthFlow();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const { mutate: sendOtp, isPending } = useMutation({
    mutationFn: sendPasswordResetOtpApi,
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(response.message || 'Mã OTP đã được gửi đến email của bạn!', {
          duration: 4000,
        });
        setFlowEmail(variables.email);
        router.push('/verify-otp');
      } else {
        toast.error('Gửi OTP thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: any) => {
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
          {...register('email')}
        />

        <AuthButton
          type="submit"
          disabled={!isValid || isPending}
          loading={isPending}
          loadingText="Đang gửi..."
        >
          {TEXT.submit}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}


