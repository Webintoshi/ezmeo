"use client";

import { useState } from "react";
import { Star, Truck, ShieldCheck, Heart, Award, Leaf } from "lucide-react";

export function Marquee() {
  const [isPaused, setIsPaused] = useState(false);

  const items = [
    { text: "Taze Fıstık Ezmesi", icon: <Leaf className="w-4 h-4" />, badge: "Taze" },
    { text: "Aynı Gün Kargo", icon: <Truck className="w-4 h-4" />, badge: "Hızlı" },
    { text: "Kalite Belgeli", icon: <Award className="w-4 h-4" />, badge: "Garanti" },
    { text: "Ev Yapımı Tarif", icon: <Heart className="w-4 h-4" />, badge: "Özel" },
  ];

  return (
    <div 
      className="overflow-hidden py-6 relative"
      style={{ backgroundColor: '#7B1113' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#7B1113_0%,transparent_10%,transparent_90%,#7B1113_100%)] z-10 pointer-events-none" />
      
      <div 
        className={`flex gap-6 ${isPaused ? 'pause-animation' : ''}`}
        style={{
          animation: 'marquee 25s linear infinite',
          WebkitAnimation: 'marquee 25s linear infinite',
        }}
      >
        {[...items, ...items, ...items, ...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-center gap-3"
          >
            <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
              {item.badge}
            </span>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/5">
              <span className="text-white/80">{item.icon}</span>
              <span className="text-white text-sm font-medium whitespace-nowrap">
                {item.text}
              </span>
              <Star className="w-3 h-3 text-white/40 fill-white/20" />
            </div>
          </div>
        ))}
      </div>

      <div 
        className={`flex gap-6 ${isPaused ? 'pause-animation' : ''}`}
        style={{
          animation: 'marquee 25s linear infinite',
          WebkitAnimation: 'marquee 25s linear infinite',
        }}
      >
        {[...items, ...items, ...items, ...items, ...items].map((item, index) => (
          <div
            key={`dup-${index}`}
            className="flex-shrink-0 flex items-center gap-3"
          >
            <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
              {item.badge}
            </span>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/5">
              <span className="text-white/80">{item.icon}</span>
              <span className="text-white text-sm font-medium whitespace-nowrap">
                {item.text}
              </span>
              <Star className="w-3 h-3 text-white/40 fill-white/20" />
            </div>
          </div>
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
