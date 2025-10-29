"use client";

import toast from 'react-hot-toast';

type ToastOptions = {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
};

export const useToast = () => {
  return {
    toast: (message: string, options?: ToastOptions) => {
      toast(message, {
        duration: options?.duration || 3000,
        position: options?.position || 'bottom-right',
      });
    },
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, {
        duration: options?.duration || 3000,
        position: options?.position || 'bottom-right',
      });
    },
    error: (message: string, options?: ToastOptions) => {
      toast.error(message, {
        duration: options?.duration || 3000,
        position: options?.position || 'bottom-right',
      });
    },
  };
};