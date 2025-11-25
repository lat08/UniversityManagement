import type React from 'react';

export interface AuthButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

export interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder: string;
  showPasswordToggle?: boolean;
  className?: string;
  inputClassName?: string;
  error?: string;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  illustration: string;
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  formWidth?: string;
}

export type UserRole =
  | 'Student'
  | 'Instructor'
  | 'Admin_Principal'
  | 'Admin_Accountant'
  | 'Admin_Facilities'
  | 'Admin_HR'
  | 'Admin_Academic'
  | 'Admin';

export interface RequireRoleAuthProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export interface AuthIllustrationProps {
  src: string;
  alt: string;
}

