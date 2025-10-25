import { api } from './client';

export type LoginDto = { 
  email: string; 
  password: string; 
};

export type UserInfo = {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
  permissions: string[];
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    userInfo: UserInfo;
  };
  errors: null;
};

export const loginApi = async (dto: LoginDto): Promise<LoginResponse> => {
  const { data } = await api.post('/v1/sessions', dto);
  return data;
};

// Forgot Password Types
export type ForgotPasswordDto = {
  email: string;
};

export type VerifyOtpDto = {
  email: string;
  otpCode: string;
};

export type ResetPasswordDto = {
  passwordResetToken: string;
  newPassword: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: null;
};

// Forgot Password API Functions
export const sendPasswordResetOtpApi = async (dto: ForgotPasswordDto): Promise<ApiResponse<boolean>> => {
  const { data } = await api.post('/v1/passwords/reset-requests', dto);
  return data;
};

// Verify OTP và lấy PasswordResetToken
export const verifyOtpApi = async (dto: VerifyOtpDto): Promise<ApiResponse<{ passwordResetToken: string }>> => {
  const { data } = await api.post('/v1/passwords/reset-verifications', dto);
  return data;
};

export const resetPasswordApi = async (dto: ResetPasswordDto): Promise<ApiResponse<boolean>> => {
  const { data } = await api.put('/v1/passwords', dto);
  return data;
};

// Logout API function
export const logoutApi = async (): Promise<ApiResponse<boolean>> => {
  const { data } = await api.delete('/v1/sessions');
  return data;
};