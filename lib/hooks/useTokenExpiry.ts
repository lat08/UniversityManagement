import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';

/**
 * Hook tự động kiểm tra token expiry và trigger refresh
 * Gọi API định kỳ để test auto-refresh khi token hết hạn
 */
export const useTokenExpiry = (enabled = true) => {
  const { accessToken, expiresAt, isAuthenticated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const testApiCalledRef = useRef(false);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !accessToken || !expiresAt) {
      return;
    }

    // Parse expiry time
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Log thông tin token
    console.log('[Token Expiry] Token info:', {
      expiresAt,
      timeUntilExpirySeconds: Math.floor(timeUntilExpiry / 1000),
      willExpireAt: new Date(expiryTime).toLocaleTimeString(),
    });

    // Nếu token sắp hết hạn trong 10s tới, gọi API test ngay
    if (timeUntilExpiry > 0 && timeUntilExpiry < 10000 && !testApiCalledRef.current) {
      testApiCalledRef.current = true;
      console.log('[Token Expiry] Token sắp hết hạn, gọi API test...');
      
      // Gọi một API đơn giản để trigger refresh
      api.get('/v1/Auth/test-token')
        .then(() => console.log('[Token Expiry] API test thành công'))
        .catch(() => console.log('[Token Expiry] API test thất bại hoặc token đã refresh'));
    }

    // Set interval để check định kỳ mỗi 5 giây
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const remainingTime = expiryTime - currentTime;
      const remainingSeconds = Math.floor(remainingTime / 1000);

      if (remainingSeconds > 0) {
        console.log(`[Token Expiry] Token còn ${remainingSeconds}s`);
        
        // Khi còn 3s, gọi API để trigger refresh
        if (remainingSeconds <= 3 && !testApiCalledRef.current) {
          testApiCalledRef.current = true;
          console.log('[Token Expiry] Token hết hạn, gọi API test...');
          
          api.get('/v1/Auth/test-token')
            .then(() => {
              console.log('[Token Expiry] API test thành công - token đã được refresh');
              testApiCalledRef.current = false; // Reset để có thể test lại
            })
            .catch(() => {
              console.log('[Token Expiry] API test thất bại - có thể refresh token cũng hết hạn');
            });
        }
      } else {
        console.log('[Token Expiry] Token đã hết hạn');
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      testApiCalledRef.current = false;
    };
  }, [accessToken, expiresAt, isAuthenticated, enabled]);
};



