import { api } from './client';

export type LoginDto = { 
  email: string; 
  password: string; 
  recaptchaToken?: string;
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
  const { data } = await api.post('/v1/auth', dto);
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

// Resend OTP API
export const resendPasswordResetOtpApi = async (dto: ForgotPasswordDto): Promise<ApiResponse<boolean>> => {
  const { data } = await api.post('/v1/passwords/reset-requests/resend', dto);
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

// Change Password Types
export type ChangePasswordDto = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// Change Password API (cho user đã đăng nhập)
export const changePasswordApi = async (dto: ChangePasswordDto): Promise<ApiResponse<boolean>> => {
  const { data } = await api.put('/v1/users/me/password', dto);
  return data;
};

// Logout API function (cần truyền refreshToken)
export const logoutApi = async (refreshToken: string): Promise<ApiResponse<string>> => {
  const { data } = await api.delete('/v1/auth', {
    data: { refreshToken }
  });
  return data;
};