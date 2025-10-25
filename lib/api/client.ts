import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5001/edu/api',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
    ver: '1.0',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor để xử lý refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Kiểm tra nếu là lỗi 401 hoặc token expired
    const isTokenExpired = error?.response?.status === 401 || 
                          error?.response?.headers?.['token-expired'] === 'true';
    
    // Loại trừ các endpoint đăng nhập khỏi interceptor
    const isLoginEndpoint = originalRequest.url?.includes('/sessions') || 
                           originalRequest.url?.includes('/passwords/reset') ||
                           originalRequest.url?.includes('/tokens');
    
    if (isTokenExpired && !originalRequest._retry && !isLoginEndpoint) {
      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API refresh token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/edu/api'}/v1/tokens`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json',
              ver: '1.0',
            }
          }
        );

        const { accessToken, refreshToken: newRefreshToken, expiresAt } = response.data.data;
        
        // Cập nhật store với token mới
        useAuthStore.getState().refreshTokenSuccess({
          accessToken,
          refreshToken: newRefreshToken,
          expiresAt
        });

        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Nếu refresh thất bại, logout user
        useAuthStore.getState().logout();
        
        // Chỉ redirect về login nếu không phải đang ở trang login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);