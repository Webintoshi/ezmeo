"use client";

import { useState } from "react";
import { Star, Truck, ShieldCheck, Heart } from "lucide-react";

export function Marquee() {
  const [isPaused, setIsPaused] = useState(false);

  const items = [
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Hızlı & Garantili Kargo", icon: <Truck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Siparişe Özel Üretim Ezme", icon: <Heart className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  return (
    <div 
      className="overflow-hidden py-5 relative"
      style={{ backgroundColor: '#7B1113' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* CSS Animation */}
      <div 
        className={`flex gap-8 whitespace-nowrap ${isPaused ? 'pause-animation' : ''}`}
        style={{
          animation: 'marquee 20s linear infinite',
          WebkitAnimation: 'marquee 20s linear infinite',
        }}
      >
        {[...items, ...items, ...items].map((item, index) => (
          <span
            key={index}
            className="text-white text-base md:text-lg font-semibold flex items-center gap-2 inline-flex"
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 md:w-4 md:h-4 fill-white text-white" />
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
