'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OTP_LENGTH, RESEND_SECONDS, SUCCESS_CODE, TEXT } from './constants';
import type { VerifyOtpForm } from './types';
import { useCountdown } from './libs/useCountdown';

export default function OtpVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const { seconds, reset, finished } = useCountdown(RESEND_SECONDS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.replace(/\s/g, '');
    if (normalized === SUCCESS_CODE) {
      router.push('/reset-password');
      return;
    }
    alert('Mã xác thực không đúng. Vui lòng thử lại.');
  };

  const helperText = useMemo(() => {
    return finished ? (
      <button
        type="button"
        onClick={() => {
          console.log('Resend OTP');
          reset(RESEND_SECONDS);
        }}
        className="text-[#4E8EE1] hover:underline"
      >
        {TEXT.resendNow}
      </button>
    ) : (
      <span>
        Gửi lại sau <span className="font-medium">{seconds}s</span>.
      </span>
    );
  }, [finished, seconds, reset]);

  return (
    <div className="min-h-screen bg-[#1d2a5b] relative overflow-hidden">
      {/* Logo và tên trường - Góc trái trên */}
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
            TRƯỜỜNG ĐẠI HỌC TƯ THỤC QUỐC TẾ SÀI GÒN
          </h1>
          <p className="text-white font-inter font-light text-[12px]">
            THE SAIGON INTERNATIONAL UNIVERSITY
          </p>
        </div>
      </div>

      {/* Hình minh họa với bóng nền ellipse */}
      <div className="absolute left-[12%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] flex items-center justify-center">
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2">
          <div 
            className="w-[760px] h-[480px] rounded-[50%] opacity-70"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(78, 142, 225, 0.9) 0%, rgba(78, 142, 225, 0.7) 25%, rgba(78, 142, 225, 0.5) 45%, rgba(78, 142, 225, 0.2) 65%, rgba(78, 142, 225, 0) 80%)',
              filter: 'blur(40px)',
            }}
          />
        </div>
        <img
          src="/OTP.png"
          alt="OTP Illustration"
          className="relative z-10 w-full h-full object-contain animate-float"
        />
      </div>

      {/* Form xác thực - Bên phải */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 animate-fadeInRight">
        <div className="bg-white rounded-[32px] px-12 py-16 shadow-2xl w-[400px] hover:shadow-3xl transition-all duration-300">
          {/* Nút quay lại */}
          <div className="mb-6">
            <Link 
              href="/forgot-password"
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
              Quay lại
            </Link>
          </div>

          <h2 className="font-poppins font-bold text-[32px] text-[#000000] mb-2">{TEXT.title}</h2>
          
          <p className="font-poppins text-[14px] text-[#666666] mb-8">{TEXT.description}</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="otp"
                className="block font-poppins font-normal text-[14px] text-[#000000] mb-2"
              >
                {TEXT.label}
              </label>
              <input
                type="text"
                id="otp"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={TEXT.placeholder}
                className="w-full px-4 py-3 border-2 border-[#CCCCCC] rounded-[12px] font-poppins text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#4E8EE1] transition-colors bg-white"
                required
              />
              <p className="mt-2 text-[13px] text-[#888888]">
                Bạn không nhận được mã? {helperText}
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4E8EE1] text-white font-poppins font-medium text-[16px] py-3 rounded-[12px] hover:bg-[#3d7bc9] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            >
              {TEXT.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


