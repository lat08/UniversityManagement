"use client";

import { toast as sonnerToast } from 'sonner';
import type { ToasterProps } from 'sonner';

type ToastOptions = {
  duration?: number;
  position?: ToasterProps["position"];
};

export const useToast = () => {
  return {
    toast: (message: string, options?: ToastOptions) => {
      sonnerToast(message, options);
    },
    success: (message: string, options?: ToastOptions) => {
      sonnerToast.success(message, options);
    },
    error: (message: string, options?: ToastOptions) => {
      sonnerToast.error(message, options);
    },
  };
};