'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthFlow } from '../lib/hooks/useAuthFlow';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

type RouteGuardProps = {
  children: React.ReactNode;
  requireStep: 'otp' | 'reset';
};

/**
 * RouteGuard - Bảo vệ các route trong flow quên mật khẩu
 * - 'otp': yêu cầu có email và step = 'otp'
 * - 'reset': yêu cầu có passwordResetToken và step = 'reset'
 */
export const RouteGuard = ({ children, requireStep }: RouteGuardProps) => {
  const router = useRouter();
  const t = useTranslations('auth.routeGuard');
  const { forgotPasswordFlow } = useAuthFlow();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Chỉ check một lần khi mount để tránh check lại khi state thay đổi
    if (hasChecked.current) return;
    
    hasChecked.current = true;
    
    if (requireStep === 'otp') {
      // Cho phép truy cập nếu đang ở step otp HOẶC đã đến step reset (đang navigate)
      if (!forgotPasswordFlow.email || (forgotPasswordFlow.step !== 'otp' && forgotPasswordFlow.step !== 'reset')) {
        toast.error(t('otpRequired'));
        router.replace('/forgot-password');
      }
    } else if (requireStep === 'reset') {
      // Kiểm tra quyền truy cập trang reset-password
      if (!forgotPasswordFlow.passwordResetToken || forgotPasswordFlow.step !== 'reset') {
        toast.error(t('resetRequired'));
        router.replace('/forgot-password');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kiểm tra điều kiện trước khi render
  if (requireStep === 'otp') {
    // Cho phép render nếu có email (kể cả khi đang chuyển step)
    if (!forgotPasswordFlow.email) {
      return null;
    }
  } else if (requireStep === 'reset') {
    if (!forgotPasswordFlow.passwordResetToken || forgotPasswordFlow.step !== 'reset') {
      return null;
    }
  }

  return <>{children}</>;
};

