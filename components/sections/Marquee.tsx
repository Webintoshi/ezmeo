"use client";

import { useState } from "react";
import { Star, Truck, ShieldCheck, Heart } from "lucide-react";

export function Marquee() {
  const [isPaused, setIsPaused] = useState(false);

  const items = [
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4" /> },
    { text: "Hızlı & Garantili Kargo", icon: <Truck className="w-4 h-4" /> },
    { text: "Siparişe Özel Üretim Ezme", icon: <Heart className="w-4 h-4" /> },
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div 
      className="overflow-hidden py-4 relative"
      style={{ backgroundColor: '#7B1113' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={`flex gap-8 whitespace-nowrap ${isPaused ? 'pause-animation' : ''}`}
        style={{
          animation: 'marquee 15s linear infinite',
          WebkitAnimation: 'marquee 15s linear infinite',
        }}
      >
        {[...items, ...items, ...items].map((item, index) => (
          <span
            key={index}
            className="text-white text-sm font-semibold flex items-center gap-2 inline-flex"
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Star className="w-3 h-3 fill-white text-white" />
              {item.icon}
              <span>{item.text}</span>
            </div>
          </span>
        ))}
      </div>

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
