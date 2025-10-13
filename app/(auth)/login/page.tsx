'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login:', { email, password });
  };

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
            TRƯỜNG ĐẠI HỌC TƯ THỤC QUỐC TẾ SÀI GÒN
          </h1>
          <p className="text-white font-inter font-light text-[12px]">
            THE SAIGON INTERNATIONAL UNIVERSITY
          </p>
        </div>
      </div>

      {/* Phần hình minh họa với bóng nền ellipse */}
      <div className="absolute left-[12%] top-1/2 -translate-y-1/2 w-[550px] h-[550px] flex items-center justify-center">
        {/* Bóng nền ellipse với màu #4E8EE1 rõ ràng và lớn hơn */}
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2">
          <div 
            className="w-[700px] h-[450px] rounded-[50%] opacity-70"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(78, 142, 225, 0.9) 0%, rgba(78, 142, 225, 0.7) 25%, rgba(78, 142, 225, 0.5) 45%, rgba(78, 142, 225, 0.2) 65%, rgba(78, 142, 225, 0) 80%)',
              filter: 'blur(40px)',
            }}
          />
        </div>
        {/* Hình minh họa 3D */}
        <img
          src="/login-character.png"
          alt="Login Character"
          className="relative z-10 w-full h-full object-contain animate-float"
        />
      </div>

      {/* Form đăng nhập - Bên phải */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 animate-fadeInRight">
        <div className="bg-white rounded-[32px] p-12 shadow-2xl w-[400px] hover:shadow-3xl transition-all duration-300">
          <h2 className="font-poppins font-bold text-[32px] text-[#000000] mb-8">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block font-poppins font-normal text-[14px] text-[#000000] mb-2"
              >
                Nhập địa chỉ Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border-2 border-[#CCCCCC] rounded-[12px] font-poppins text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#4E8EE1] transition-colors bg-white"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block font-poppins font-normal text-[14px] text-[#000000] mb-2"
              >
                Nhập mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-3 border-2 border-[#CCCCCC] rounded-[12px] font-poppins text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:border-[#4E8EE1] transition-colors pr-12 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Quên mật khẩu */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="font-poppins text-[14px] text-[#000000] hover:text-[#4E8EE1] transition-colors cursor-pointer hover:underline"
              >
                Quên mật khẩu ?
              </Link>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="w-full bg-[#4E8EE1] text-white font-poppins font-medium text-[16px] py-3 rounded-[12px] hover:bg-[#3d7bc9] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


