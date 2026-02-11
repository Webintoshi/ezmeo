"use client";

import { useState } from "react";
import { Star, Truck, ShieldCheck, Heart, Zap, Leaf, RefreshCw } from "lucide-react";

export function Marquee() {
  const [isPaused, setIsPaused] = useState(false);

  const items = [
    { text: "₺500 ve Üzeri Kargo Bedava", icon: <Truck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Aynı Gün Kargo", icon: <Zap className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "%100 Doğal Ürünler", icon: <Leaf className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Güvenli Ödeme", icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "14 Gün İade", icon: <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Siparişe Özel Üretim", icon: <Heart className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  return (
    <div 
      className="relative overflow-hidden py-6 md:py-7 group"
      style={{
        background: 'linear-gradient(90deg, #7B1113 0%, #9D1B1F 50%, #7B1113 100%)',
        backgroundSize: '200% 100%',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        }}
      />

      {/* Pause Indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
          {isPaused ? (
            <>
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">DURAKLATILDI</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">YAYINDA</span>
            </>
          )}
        </div>
      </div>

      {/* Marquee Track */}
      <div 
        className={`flex gap-4 md:gap-8 whitespace-nowrap ${isPaused ? 'pause-animation' : ''}`}
        style={{
          animation: 'marquee 12s linear infinite',
          WebkitAnimation: 'marquee 12s linear infinite',
        }}
      >
        {[...items, ...items, ...items].map((item, index) => (
          <span
            key={index}
            className="inline-flex"
          >
            <div className="group/item relative flex items-center gap-2.5 md:gap-3 bg-white/15 backdrop-blur-md px-4 md:px-5 py-2.5 md:py-3 rounded-2xl border border-white/20 shadow-lg hover:bg-white/25 transition-all duration-300">
              
              {/* Icon with glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 blur-lg rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                <Star className="relative w-3.5 h-3.5 md:w-4 md:h-4 fill-white text-white" />
                {item.icon}
              </div>
              
              {/* Text */}
              <span className="text-white text-xs sm:text-sm md:text-base font-bold tracking-wide">
                {item.text}
              </span>
            </div>
          </span>
        ))}
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .pause-animation {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
