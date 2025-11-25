'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { sendPasswordResetOtpApi, type ForgotPasswordDto } from '@/lib/api/auth';
import { useAuthFlow } from '../lib/hooks/useAuthFlow';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  usePageTitle(t('title'));
  const router = useRouter();
  const { setEmail: setFlowEmail } = useAuthFlow();
  const [isSendSuccess, setIsSendSuccess] = useState(false);
  
  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
  
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
        
        toast.success(response.message || t('success'), {
          duration: 4000,
        });
        setFlowEmail(variables.email);
        router.push('/verify-otp');
      } else {
        toast.error(t('error'));
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string, errors?: string[] } } }) => {
      const serverMessage = error?.response?.data?.message || 
                           error?.response?.data?.errors?.join(', ') ||
                           error?.message || 
                           t('error');
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
      title={t('title')}
      illustration="/forgot_pass.png"
      showBackButton={true}
      backHref="/login"
    >
      <p className="font-poppins text-[12px] lg:text-[14px] text-[#666666] mb-6 lg:mb-8">
        {t('description')}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AuthInput
          label={t('emailLabel')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email?.message}
          {...register('email', {
            onChange: () => clearErrors('email')
          })}
        />

        <AuthButton
          type="submit"
          disabled={isPending || isSendSuccess}
          loading={isPending}
          loadingText={t('loadingText')}
        >
          {t('submit')}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

