'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { resetPasswordApi, type ResetPasswordDto } from '@/lib/api/auth';
import { useAuthFlow } from '../lib/hooks/useAuthFlow';
import { RouteGuard } from '../components/RouteGuard';
import { AuthLayout } from '../components/AuthLayout';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const t = useTranslations('auth.resetPassword');
  const locale = useLocale();
  usePageTitle(t('title'));
  const router = useRouter();
  const { forgotPasswordFlow, clearFlow } = useAuthFlow();
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  
  const resetPasswordSchema = z.object({
    password: z
      .string()
      .min(6, t('validation.passwordMin'))
      .max(100, t('validation.passwordMax')),
    confirmPassword: z
      .string()
      .min(1, t('validation.confirmPasswordRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
  
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
        
        toast.success(response.message || t('success'), {
          duration: 4000,
        });
        clearFlow();
        router.push(`/${locale}/login`);
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

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!forgotPasswordFlow.passwordResetToken) {
      toast.error(t('invalidFlow'));
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
      title={t('title')}
      illustration="/change_pass.png"
      showBackButton={true}
      backHref="/verify-otp"
      formWidth="w-[420px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthInput
          label={t('newPasswordLabel')}
          type="password"
          placeholder={t('placeholder')}
          showPasswordToggle={true}
          error={errors.password?.message}
          {...register('password', {
            onChange: () => clearErrors('password')
          })}
        />

        <AuthInput
          label={t('confirmPasswordLabel')}
          type="password"
          placeholder={t('placeholder')}
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
          loadingText={t('loadingText')}
        >
          {t('submit')}
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

