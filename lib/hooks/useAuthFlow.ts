import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setForgotPasswordEmail, 
  setPasswordResetToken,
  clearForgotPasswordFlow 
} from '../store/features/authSlice';

/**
 * Hook quản lý flow quên mật khẩu
 * Flow: forgot-password -> verify-otp -> reset-password
 */
export const useAuthFlow = () => {
  const dispatch = useAppDispatch();
  const { forgotPasswordFlow } = useAppSelector(state => state.auth);
  
  const setEmail = (email: string) => {
    dispatch(setForgotPasswordEmail(email));
  };
  
  const setResetToken = (token: string) => {
    dispatch(setPasswordResetToken(token));
  };
  
  const clearFlow = () => {
    dispatch(clearForgotPasswordFlow());
  };
  
  return { 
    forgotPasswordFlow, 
    setEmail, 
    setResetToken,
    clearFlow
  };
};

