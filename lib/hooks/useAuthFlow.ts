import { useAuthStore } from '../store/authStore';

/**
 * Hook quản lý flow quên mật khẩu
 * Flow: forgot-password -> verify-otp -> reset-password
 */
export const useAuthFlow = () => {
  const forgotPasswordFlow = useAuthStore((state) => state.forgotPasswordFlow);
  const setEmail = useAuthStore((state) => state.setForgotPasswordEmail);
  const setResetToken = useAuthStore((state) => state.setPasswordResetToken);
  const clearFlow = useAuthStore((state) => state.clearForgotPasswordFlow);
  
  return { 
    forgotPasswordFlow, 
    setEmail, 
    setResetToken,
    clearFlow
  };
};

