"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Truck, ShieldCheck, Heart, Award, Leaf, Sparkles, Pause, Play } from "lucide-react";
import { MarqueeSettings, MarqueeIcon, MarqueeItem } from "@/lib/db/settings";

const ICON_MAP: Record<MarqueeIcon, React.ReactNode> = {
  leaf: <Leaf className="w-4 h-4" />,
  truck: <Truck className="w-4 h-4" />,
  shield: <ShieldCheck className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  award: <Award className="w-4 h-4" />,
  sparkle: <Sparkles className="w-4 h-4" />,
};

const DEFAULT_SETTINGS: MarqueeSettings = {
  items: [
    { id: "1", text: "Taze Fıstık Ezmesi", icon: "leaf", badge: "Taze" },
    { id: "2", text: "Aynı Gün Kargo", icon: "truck", badge: "Hızlı" },
    { id: "3", text: "Kalite Belgeli", icon: "award", badge: "Garanti" },
    { id: "4", text: "Ev Yapımı Tarif", icon: "heart", badge: "Özel" },
  ],
  speed: "normal",
  direction: "left",
  pauseOnHover: true,
  showStars: true,
  animation: "marquee",
  enabled: true,
};

const SPEED_CONFIG = {
  slow: 40,
  normal: 25,
  fast: 15,
};

interface MarqueeItemComponentProps {
  item: MarqueeItem;
  showStars?: boolean;
}

function MarqueeItemComponent({ item, showStars }: MarqueeItemComponentProps) {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      {item.badge && (
        <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
          {item.badge}
        </span>
      )}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/5">
        <span className="text-white/80">{item.icon && ICON_MAP[item.icon]}</span>
        <span className="text-white text-sm font-medium whitespace-nowrap">
          {item.text}
        </span>
        {showStars && <Star className="w-3 h-3 text-white/40 fill-white/20" />}
      </div>
    </div>
  );
}

export function Marquee() {
  const [settings, setSettings] = useState<MarqueeSettings>(DEFAULT_SETTINGS);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings?type=marquee");
        const data = await response.json();

        if (data.success && data.marqueeSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.marqueeSettings });
        }
      } catch (error) {
        console.log("Using default marquee settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const isVisible = !loading && settings.enabled;
  const duration = SPEED_CONFIG[settings.speed || "normal"];

  if (!isVisible) return null;

  return (
    <div 
      className="overflow-hidden py-6 relative"
      style={{ backgroundColor: '#7B1113' }}
      onMouseEnter={() => settings.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#7B1113_0%,transparent_10%,transparent_90%,#7B1113_100%)] z-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        {settings.animation === "marquee" && (
          <motion.div
            className="flex gap-6"
            animate={{ x: isPaused ? 0 : settings.direction === "left" ? "-50%" : "50%" }}
            transition={{
              duration: duration,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            {[...settings.items, ...settings.items, ...settings.items].map((item, index) => (
              <MarqueeItemComponent
                key={`${item.id}-${index}`}
                item={item}
                showStars={settings.showStars}
              />
            ))}
          </motion.div>
        )}

        {settings.animation === "fade" && (
          <motion.div
            className="flex gap-6 justify-center items-center"
            animate={{ opacity: isPaused ? 1 : [0.3, 1, 0.3] }}
            transition={{
              duration: duration / 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            {settings.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isPaused ? 1 : 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MarqueeItemComponent
                  item={item}
                  showStars={settings.showStars}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {settings.animation === "slide" && (
          <div className="flex gap-6 justify-center items-center overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: isPaused ? 0 : settings.direction === "left" ? [0, -300] : [0, 300] }}
              transition={{
                duration: duration / 2,
                ease: [0.16, 1, 0.3, 1],
                repeat: Infinity,
              }}
            >
              {[...settings.items, ...settings.items].map((item, index) => (
                <MarqueeItemComponent
                  key={`${item.id}-${index}`}
                  item={item}
                  showStars={settings.showStars}
                />
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/10 z-20"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
            <Pause className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium">Durduruldu</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
