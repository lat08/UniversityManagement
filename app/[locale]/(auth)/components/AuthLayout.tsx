'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AuthLayoutProps, AuthIllustrationProps } from '../lib/types/types';

const AuthHeader = () => (
  <div className="absolute top-4 left-4 lg:top-8 lg:left-8 flex items-center gap-2 lg:gap-3 z-10 animate-fadeInDown max-w-[calc(100%-2rem)]">
    <div className="w-[35px] h-[35px] lg:w-[45px] lg:h-[45px] flex items-center justify-center flex-shrink-0">
      <Image
        src="/logo-siu.webp"
        alt="SIU Logo"
        width={45}
        height={45}
        className="w-full h-full object-contain"
      />
    </div>
    <div className="flex flex-col min-w-0">
      <h1 className="text-[#FFC700] font-inter font-semibold text-[10px] sm:text-[12px] lg:text-[16px] leading-tight truncate">
        TRƯỜNG ĐẠI HỌC TƯ THỤC QUỐC TẾ SÀI GÒN
      </h1>
      <p className="text-white font-inter font-light text-[8px] sm:text-[10px] lg:text-[12px] truncate">
        THE SAIGON INTERNATIONAL UNIVERSITY
      </p>
    </div>
  </div>
);

const AuthIllustration = ({ src, alt }: AuthIllustrationProps) => {
  // Move style to CSS class to avoid hydration issues
  return (
    <div className="hidden lg:block absolute left-[8%] xl:left-[12%] top-1/2 -translate-y-1/2 w-[400px] xl:w-[650px] h-[400px] xl:h-[650px] flex items-center justify-center">
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2">
        <div 
          className="w-[500px] xl:w-[820px] h-[320px] xl:h-[520px] rounded-[50%] opacity-70"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(78, 142, 225, 0.9) 0%, rgba(78, 142, 225, 0.7) 25%, rgba(78, 142, 225, 0.5) 45%, rgba(78, 142, 225, 0.2) 65%, rgba(78, 142, 225, 0) 80%)',
            filter: 'blur(40px)',
          }}
          suppressHydrationWarning
        />
      </div>
      <Image
        src={src}
        alt={alt}
        width={650}
        height={650}
        className="relative z-10 w-full h-full object-contain animate-float"
        priority
      />
    </div>
  );
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  illustration,
  showBackButton = false,
  backHref = '/login',
  backText,
  formWidth = 'w-[400px]'
}) => {
  const t = useTranslations('auth.layout');
  const locale = useLocale();
  const defaultBackText = backText || t('backToLogin');

  const resolvedBackHref = useMemo(() => {
    if (!backHref) return `/${locale}/login`;
    if (backHref.startsWith('http')) return backHref;
    if (backHref.startsWith(`/${locale}/`) || backHref === `/${locale}`) {
      return backHref;
    }
    const normalized = backHref.startsWith('/') ? backHref : `/${backHref}`;
    return `/${locale}${normalized}`;
  }, [backHref, locale]);

  return (
    <div className="min-h-screen bg-[#1d2a5b] relative overflow-hidden" suppressHydrationWarning>
      <AuthHeader />
      <AuthIllustration src={illustration} alt={title} />
      
      <div className="flex items-center justify-center min-h-screen p-4 lg:block lg:p-0 lg:min-h-0">
        <div className="w-full max-w-[90%] sm:max-w-md lg:absolute lg:right-[10%] lg:top-1/2 lg:-translate-y-1/2 animate-fadeInRight z-20">
        <div className={`bg-white rounded-[20px] lg:rounded-[32px] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-16 shadow-2xl w-full ${formWidth.replace('w-', 'lg:w-')} hover:shadow-3xl transition-all duration-300`} suppressHydrationWarning>
          {showBackButton && (
            <div className="mb-4 lg:mb-6">
              <Link 
                href={resolvedBackHref}
                className="inline-flex items-center gap-2 text-[#666666] hover:text-[#4E8EE1] transition-colors font-poppins text-[12px] lg:text-[14px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
                {defaultBackText}
              </Link>
            </div>
          )}
          
          <h2 className="font-poppins font-bold text-[24px] sm:text-[28px] lg:text-[32px] text-[#000000] mb-6 lg:mb-8">
            {title}
          </h2>
          
          {children}
        </div>
        </div>
      </div>
    </div>
  );
};

