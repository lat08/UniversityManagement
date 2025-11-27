'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { resendPasswordResetOtpApi, verifyOtpApi, type ForgotPasswordDto, type VerifyOtpDto } from '@/lib/api/auth';
import { useAuthFlow } from '../lib/hooks/useAuthFlow';
import { RouteGuard } from '../components/RouteGuard';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useCountdown } from './lib/hooks/useCountdown';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function OtpVerifyContent() {
  const t = useTranslations('auth.verifyOtp');
  usePageTitle(t('title'));
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const { seconds, reset, finished } = useCountdown(RESEND_SECONDS);
  const { forgotPasswordFlow, setResetToken } = useAuthFlow();

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: resendPasswordResetOtpApi,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('resendSuccess'), {
          duration: 3000,
        });
        reset(RESEND_SECONDS);
      } else {
        toast.error(t('resendError'));
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           t('resendError');
      toast.error(serverMessage);
    },
  });

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (response) => {
      if (response.success && response.data.passwordResetToken) {
        setIsVerifySuccess(true);
        
        toast.success(t('success'), {
          duration: 3000,
        });
        // Lưu passwordResetToken vào store và chuyển đến trang reset password
        setResetToken(response.data.passwordResetToken);
        router.push('/reset-password');
      } else {
        toast.error(t('error'));
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           t('error');
      toast.error(serverMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.replace(/\s/g, '');
    
    if (!normalized) {
      toast.error(t('otpRequired'));
      return;
    }

    if (normalized.length !== OTP_LENGTH) {
      toast.error(t('otpInvalid'));
      return;
    }

    if (!forgotPasswordFlow.email) {
      toast.error(t('emailNotFound'));
      return;
    }

    // Gọi API verify OTP để lấy passwordResetToken
    const verifyOtpData: VerifyOtpDto = {
      email: forgotPasswordFlow.email,
      otpCode: normalized,
    };
    
    verifyOtp(verifyOtpData);
  };

  const handleResendOtp = useCallback(() => {
    if (!forgotPasswordFlow.email) {
      toast.error(t('emailNotFound'));
      return;
    }
    
    const forgotPasswordData: ForgotPasswordDto = { email: forgotPasswordFlow.email };
    resendOtp(forgotPasswordData);
  }, [forgotPasswordFlow.email, resendOtp, t]);

  const helperText = useMemo(() => {
    return finished ? (
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={isResending}
        className="text-[#4E8EE1] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-[11px] lg:text-[13px]"
      >
        {isResending ? t('resending') : t('resendNow')}
      </button>
    ) : (
      <span>
        {t('resendAfter', { seconds })}
      </span>
    );
  }, [finished, seconds, isResending, handleResendOtp, t]);

  return (
    <AuthLayout
      title={t('title')}
      illustration="/OTP.png"
      showBackButton={true}
      backHref="/forgot-password"
    >
      <div className="mb-6 lg:mb-8">
        <p className="font-poppins text-[12px] lg:text-[14px] text-[#666666] mb-2">
          {t('description')}
        </p>
        {forgotPasswordFlow.email && (
          <p className="font-poppins text-[14px] lg:text-[16px] font-bold text-center text-[#1e40af]">
            {forgotPasswordFlow.email}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <AuthInput
            label={t('label')}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
            placeholder={t('placeholder')}
            required
            maxLength={OTP_LENGTH}
            inputMode="numeric"
            pattern={`\\d{${OTP_LENGTH}}`}
            title={t('otpInvalid')}
            inputClassName="text-center font-bold tracking-widest"
          />
          <p className="mt-2 text-[11px] lg:text-[13px] text-[#888888]">
            {t('notReceived')} {helperText}
          </p>
        </div>

        <AuthButton 
          type="submit"
          disabled={isVerifying || isVerifySuccess}
          loading={isVerifying}
          loadingText={t('loadingText')}
        >
          {t('submit')}
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

