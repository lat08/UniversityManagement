'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Star {
  top: string;
  left: string;
  delay: number;
  duration: number;
}

export const AuthLoading = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 90 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 0.5,
      duration: 0.5 + Math.random() * 0.5,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute h-1 w-1 rounded-full bg-white blur-[0.5px] animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      <div className="z-10 flex items-center gap-12 opacity-30">
        <div className="animate-logoFadeIn">
          <Image
            src="/logo-siu.webp"
            alt="SIU Logo"
            width={180}
            height={180}
            priority
            className="object-contain drop-shadow-2xl"
          />
        </div>

        <div className="relative">
          <div className="text-9xl font-black text-gray-800 opacity-30">SIU</div>
          <div className="animate-textFill absolute inset-0 overflow-hidden">
            <div className="bg-gradient-to-r from-[#FDB913] via-[#DC3545] to-[#0099FF] bg-clip-text text-9xl font-black text-transparent drop-shadow-lg">
              SIU
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 text-lg font-medium text-white animate-pulse">
        Đang xác thực...
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes logoFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textFill {
          0% {
            clip-path: inset(0 100% 0 0);
          }
          100% {
            clip-path: inset(0 0 0 0);
          }
        }

        .animate-twinkle {
          animation: twinkle infinite ease-in-out;
        }

        .animate-logoFadeIn {
          animation: logoFadeIn 0.4s ease-out forwards;
        }

        .animate-textFill {
          animation: textFill 0.3s ease-out forwards;
          clip-path: inset(0 100% 0 0);
        }
      `}</style>
    </div>
  );
};

export default AuthLoading;

