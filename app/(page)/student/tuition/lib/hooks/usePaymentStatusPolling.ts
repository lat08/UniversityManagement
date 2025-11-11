import { useEffect, useRef } from 'react';
import { checkPaymentStatus } from '../api/financeApi';

interface UsePaymentStatusPollingProps {
  paymentId: string | null;
  isOpen: boolean;
  onStatusChange: (status: 'pending' | 'completed' | 'failed') => void;
}

export function usePaymentStatusPolling({
  paymentId,
  isOpen,
  onStatusChange,
}: UsePaymentStatusPollingProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!paymentId || !isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }
    
    // Timeout sau 5 phút để tự động dừng polling
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 5 * 60 * 1000);
    
    // Polling mỗi 2 giây
    intervalRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        
        if (result.success && result.data) {
          const status = result.data.paymentStatus;
          
          // Gọi callback khi status thay đổi
          onStatusChange(status);
          
          // Dừng polling nếu thanh toán thành công hoặc thất bại
          if (status === 'completed' || status === 'failed') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 2000);
    
    // Cleanup khi component unmount hoặc dependencies thay đổi
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [paymentId, isOpen, onStatusChange]);
}

