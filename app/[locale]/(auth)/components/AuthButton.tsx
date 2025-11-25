import React from 'react';
import { AuthButtonProps } from '../lib/types/types';

export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  loadingText = 'Đang xử lý...',
  className = ''
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full bg-[var(--button-primary)] text-[var(--primary-foreground)] font-poppins font-medium text-[14px] lg:text-[16px] py-2.5 lg:py-3 rounded-[12px] hover:bg-[var(--button-primary-hover)] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[13px] lg:text-[16px]">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

