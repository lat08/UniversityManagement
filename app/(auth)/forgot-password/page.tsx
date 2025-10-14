'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { sendPasswordResetOtpApi, type ForgotPasswordDto } from '@/lib/api/auth';
import { useAuthFlow } from '@/lib/hooks/useAuthFlow';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { AuthInput } from '@/app/components/auth/AuthInput';
import { AuthButton } from '@/app/components/auth/AuthButton';
import toast from 'react-hot-toast';
import { TEXT } from './constants';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { setEmail: setFlowEmail } = useAuthFlow();

  const { mutate: sendOtp, isPending } = useMutation({
    mutationFn: sendPasswordResetOtpApi,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Mã OTP đã được gửi đến email của bạn!', {
          duration: 4000,
        });
        // Lưu email vào Redux store và chuyển đến trang verify OTP
        setFlowEmail(email);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email!');
      return;
    }

    const forgotPasswordData: ForgotPasswordDto = { email };
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <AuthInput
          label={TEXT.emailLabel}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={TEXT.emailPlaceholder}
          required
        />

        <AuthButton
          type="submit"
          loading={isPending}
          loadingText="Đang gửi..."
        >
          {TEXT.submit}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}


