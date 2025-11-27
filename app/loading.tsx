'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Loading() {
  const [stars, setStars] = useState<Array<{ top: string; left: string; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate 90 random stars
    const generatedStars = Array.from({ length: 90 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 0.5,
      duration: 0.5 + Math.random() * 0.5,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Stars background */}
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle blur-[0.5px]"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Main content container */}
      <div className="flex items-center gap-12 z-10 opacity-30">
        {/* Logo - Fade in + Scale */}
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

        {/* Text SIU - Fill animation */}
        <div className="relative">
          {/* Background text (outline) */}
          <div className="text-9xl font-black text-gray-800 opacity-30">
            SIU
          </div>
          
          {/* Animated fill text */}
          <div className="absolute inset-0 overflow-hidden animate-textFill">
            <div className="text-9xl font-black bg-gradient-to-r from-[#FDB913] via-[#DC3545] to-[#0099FF] bg-clip-text text-transparent drop-shadow-lg">
              SIU
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
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
}
