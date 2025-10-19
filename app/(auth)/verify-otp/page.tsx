'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { sendPasswordResetOtpApi, verifyOtpApi, type ForgotPasswordDto, type VerifyOtpDto } from '@/lib/api/auth';
import { useAuthFlow } from '../lib/hooks/useAuthFlow';
import { RouteGuard } from '../components/RouteGuard';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import toast from 'react-hot-toast';
import { OTP_LENGTH, RESEND_SECONDS, TEXT } from './lib/constants';
import { useCountdown } from './lib/hooks/useCountdown';

function OtpVerifyContent() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const { seconds, reset, finished } = useCountdown(RESEND_SECONDS);
  const { forgotPasswordFlow, setResetToken } = useAuthFlow();

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: sendPasswordResetOtpApi,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Mã OTP mới đã được gửi đến email của bạn!', {
          duration: 3000,
        });
        reset(RESEND_SECONDS);
      } else {
        toast.error('Gửi lại OTP thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Gửi lại OTP thất bại. Vui lòng thử lại!';
      toast.error(serverMessage);
    },
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (response) => {
      if (response.success && response.data.passwordResetToken) {
        setIsVerifySuccess(true);
        
        toast.success('Xác thực OTP thành công!', {
          duration: 3000,
        });
        // Lưu passwordResetToken vào Redux store và chuyển đến trang reset password
        setResetToken(response.data.passwordResetToken);
        router.push('/reset-password');
      } else {
        toast.error('Xác thực OTP thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           'Xác thực OTP thất bại. Vui lòng thử lại!';
      toast.error(serverMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.replace(/\s/g, '');
    
    if (!normalized) {
      toast.error('Vui lòng nhập mã OTP!');
      return;
    }

    if (normalized.length !== 6) {
      toast.error('Mã OTP phải có 6 chữ số!');
      return;
    }

    if (!forgotPasswordFlow.email) {
      toast.error('Không tìm thấy email. Vui lòng thử lại từ đầu.');
      return;
    }

    // Gọi API verify OTP để lấy passwordResetToken
    const verifyOtpData: VerifyOtpDto = {
      email: forgotPasswordFlow.email,
      otpCode: normalized,
    };
    
    verifyOtp(verifyOtpData);
  };

  const handleResendOtp = () => {
    if (!forgotPasswordFlow.email) {
      toast.error('Không tìm thấy email. Vui lòng thử lại từ đầu.');
      return;
    }
    
    const forgotPasswordData: ForgotPasswordDto = { email: forgotPasswordFlow.email };
    resendOtp(forgotPasswordData);
  };

  const helperText = useMemo(() => {
    return finished ? (
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={isResending}
        className="text-[#4E8EE1] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isResending ? 'Đang gửi...' : TEXT.resendNow}
      </button>
    ) : (
      <span>
        Gửi lại sau <span className="font-medium">{seconds}s</span>.
      </span>
    );
  }, [finished, seconds, isResending, handleResendOtp]);

  return (
    <AuthLayout
      title={TEXT.title}
      illustration="/OTP.png"
      showBackButton={true}
      backHref="/forgot-password"
      backText="Quay lại"
    >
      <div className="mb-8">
        <p className="font-poppins text-[14px] text-[#666666] mb-2">
          Mã xác thực đã được gửi đến email của bạn
        </p>
        {forgotPasswordFlow.email && (
          <p className="font-poppins text-[16px] font-bold text-center text-[#1e40af]">
            {forgotPasswordFlow.email}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <AuthInput
            label={TEXT.label}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
            placeholder={TEXT.placeholder}
            required
            maxLength={OTP_LENGTH}
            inputMode="numeric"
            pattern={`\\d{${OTP_LENGTH}}`}
            title={`Vui lòng nhập đúng ${OTP_LENGTH} chữ số`}
            inputClassName="text-center font-bold tracking-widest"
          />
          <p className="mt-2 text-[13px] text-[#888888]">
            Bạn không nhận được mã? {helperText}
          </p>
        </div>

        <AuthButton 
          type="submit"
          disabled={isVerifying || isVerifySuccess}
          loading={isVerifying}
          loadingText="Đang xác thực..."
        >
          {TEXT.submit}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default function OtpVerifyPage() {
  return (
    <RouteGuard requireStep="otp">
      <OtpVerifyContent />
    </RouteGuard>
  );
}


