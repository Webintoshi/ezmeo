"use client";

import { Star, Truck, ShieldCheck, Heart } from "lucide-react";
import { useState } from "react";

export function Marquee() {
  const [isPaused, setIsPaused] = useState(false);

  const items = [
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Hızlı & Garantili Kargo", icon: <Truck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Siparişe Özel Üretim Ezme", icon: <Heart className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  return (
    <div className="premium-gradient overflow-hidden py-5 relative group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-white/5"></div>

      {/* Pause Button - Hover&apos;da görünür */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur-sm"
        aria-label={isPaused ? "Başlat" : "Durdur"}
      >
        {isPaused ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        )}
      </button>

      {/* CSS Animation - Daha performanslı */}
      <div 
        className={`flex gap-8 whitespace-nowrap relative z-10 ${isPaused ? 'pause-animation' : ''}`}
        style={{
          animation: 'marquee 20s linear infinite',
          WebkitAnimation: 'marquee 20s linear infinite',
        }}
      >
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="text-primary-foreground text-base md:text-lg font-semibold flex items-center gap-2 inline-flex"
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary-foreground text-primary-foreground" />
              {item.icon}
              <span>{item.text}</span>
            </div>
          </span>
        ))}
      </div>

      {/* Global CSS için style tag */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .pause-animation {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
