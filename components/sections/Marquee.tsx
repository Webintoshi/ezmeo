"use client";

import { motion } from "framer-motion";
import { Star, Truck, ShieldCheck, Heart } from "lucide-react";

export function Marquee() {
  const items = [
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Hızlı & Garantili Kargo", icon: <Truck className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "Siparişe Özel Üretim Ezme", icon: <Heart className="w-4 h-4 md:w-5 md:h-5" /> },
    { text: "%100 Doğal & Tazelik Garantisi", icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  return (
    <div className="premium-gradient overflow-hidden py-5 relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-white/5"></div>

      <motion.div
        className="flex gap-8 whitespace-nowrap relative z-10"
        animate={{
          x: [0, -1200],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {[...items, ...items, ...items].map((item, index) => (
          <span
            key={index}
            className="text-primary-foreground text-base md:text-lg font-semibold flex items-center gap-2"
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary-foreground text-primary-foreground" />
              {item.icon}
              <span>{item.text}</span>
            </div>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
