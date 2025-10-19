import React from 'react';
import Link from 'next/link';
import { AuthLayoutProps, AuthIllustrationProps } from '../lib/types/types';

const AuthHeader = () => (
  <div className="absolute top-8 left-8 flex items-center gap-3 z-10 animate-fadeInDown">
    <div className="w-[45px] h-[45px] flex items-center justify-center">
      <img
        src="/logo-siu.webp"
        alt="SIU Logo"
        className="w-full h-full object-contain"
      />
    </div>
    <div className="flex flex-col">
      <h1 className="text-[#FFC700] font-inter font-semibold text-[16px] leading-tight">
        TRƯỜNG ĐẠI HỌC TƯ THỤC QUỐC TẾ SÀI GÒN
      </h1>
      <p className="text-white font-inter font-light text-[12px]">
        THE SAIGON INTERNATIONAL UNIVERSITY
      </p>
    </div>
  </div>
);

const AuthIllustration = ({ src, alt }: AuthIllustrationProps) => (
  <div className="absolute left-[12%] top-1/2 -translate-y-1/2 w-[650px] h-[650px] flex items-center justify-center">
    <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2">
      <div 
        className="w-[820px] h-[520px] rounded-[50%] opacity-70"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(78, 142, 225, 0.9) 0%, rgba(78, 142, 225, 0.7) 25%, rgba(78, 142, 225, 0.5) 45%, rgba(78, 142, 225, 0.2) 65%, rgba(78, 142, 225, 0) 80%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
    <img
      src={src}
      alt={alt}
      className="relative z-10 w-full h-full object-contain animate-float"
    />
  </div>
);

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  illustration,
  showBackButton = false,
  backHref = '/login',
  backText = 'Quay lại đăng nhập',
  formWidth = 'w-[400px]'
}) => {
  return (
    <div className="min-h-screen bg-[#1d2a5b] relative overflow-hidden">
      <AuthHeader />
      <AuthIllustration src={illustration} alt={title} />
      
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 animate-fadeInRight">
        <div className={`bg-white rounded-[32px] px-12 py-16 shadow-2xl ${formWidth} hover:shadow-3xl transition-all duration-300`}>
          {showBackButton && (
            <div className="mb-6">
              <Link 
                href={backHref}
                className="inline-flex items-center gap-2 text-[#666666] hover:text-[#4E8EE1] transition-colors font-poppins text-[14px]"
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
                {backText}
              </Link>
            </div>
          )}
          
          <h2 className="font-poppins font-bold text-[32px] text-[#000000] mb-8">
            {title}
          </h2>
          
          {children}
        </div>
      </div>
    </div>
  );
};

