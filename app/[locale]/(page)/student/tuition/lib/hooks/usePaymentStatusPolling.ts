import { useEffect, useRef, useCallback } from 'react';
import { checkPaymentStatus } from '../api/financeApi';
import type { PaymentStatus } from '../types/types';

interface UsePaymentStatusPollingProps {
  paymentId: string | null;
  isOpen: boolean;
  onStatusChange: (status: PaymentStatus) => void;
}

const POLLING_INTERVAL = 2000;
const POLLING_TIMEOUT = 5 * 60 * 1000;

export const usePaymentStatusPolling = ({
  paymentId,
  isOpen,
  onStatusChange,
}: UsePaymentStatusPollingProps): void => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<PaymentStatus | null>(null);
  
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastStatusRef.current = null;
  }, []);
  
  useEffect(() => {
    if (!paymentId || !isOpen) {
      cleanup();
      return;
    }
    
    timeoutRef.current = setTimeout(() => {
      cleanup();
    }, POLLING_TIMEOUT);
    
    intervalRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        
        if (result.success && result.data) {
          const status = result.data.paymentStatus;
          
          if (status !== lastStatusRef.current) {
            lastStatusRef.current = status;
            onStatusChange(status);
          }
          
          if (status === 'completed' || status === 'failed') {
            cleanup();
          }
        }
      } catch {
        return;
      }
    }, POLLING_INTERVAL);
    
    return cleanup;
  }, [paymentId, isOpen, onStatusChange, cleanup]);
};

