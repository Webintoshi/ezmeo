"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, Heart, Award, Leaf, Sparkles, Pause } from "lucide-react";
import { MarqueeSettings, MarqueeIcon, MarqueeItem } from "@/lib/db/settings";

const ICON_MAP: Record<MarqueeIcon, React.ReactNode> = {
  leaf: <Leaf className="w-3 h-3" />,
  truck: <Truck className="w-3 h-3" />,
  shield: <ShieldCheck className="w-3 h-3" />,
  heart: <Heart className="w-3 h-3" />,
  award: <Award className="w-3 h-3" />,
  sparkle: <Sparkles className="w-3 h-3" />,
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

interface MarqueeItemComponentProps {
  item: MarqueeItem;
  showStars?: boolean;
}

function MarqueeItemComponent({ item, showStars }: MarqueeItemComponentProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {item.badge && (
        <span className="px-1.5 py-0.5 bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider rounded">
          {item.badge}
        </span>
      )}
      <div className="flex items-center gap-1.5 px-3 py-1">
        <span className="text-white/80">{item.icon && ICON_MAP[item.icon]}</span>
        <span className="text-white text-xs font-medium whitespace-nowrap">
          {item.text}
        </span>
        {showStars && <Star className="w-2 h-2 text-white/30" />}
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

  if (!isVisible) return null;

  const items = settings.items;

  return (
    <div 
      className="overflow-hidden py-2 relative"
      style={{ backgroundColor: '#7B1113' }}
      onMouseEnter={() => settings.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#7B1113_0%,transparent_5%,transparent_95%,#7B1113_100%)] z-10 pointer-events-none" />

      <div className="flex relative">
        <div 
          className={`flex animate-marquee ${isPaused ? 'pause-animation' : ''}`}
          style={{
            animationDuration: settings.speed === 'slow' ? '40s' : settings.speed === 'fast' ? '20s' : '30s',
          }}
        >
          {[...items, ...items, ...items, ...items].map((item, index) => (
            <MarqueeItemComponent
              key={`${item.id}-${index}`}
              item={item}
              showStars={settings.showStars}
            />
          ))}
        </div>
        
        <div 
          className={`flex animate-marquee ${isPaused ? 'pause-animation' : ''}`}
          style={{
            animationDuration: settings.speed === 'slow' ? '40s' : settings.speed === 'fast' ? '20s' : '30s',
          }}
          aria-hidden="true"
        >
          {[...items, ...items, ...items, ...items].map((item, index) => (
            <MarqueeItemComponent
              key={`dup-${item.id}-${index}`}
              item={item}
              showStars={settings.showStars}
            />
          ))}
        </div>
      </div>

      {isPaused && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-full">
            <Pause className="w-3 h-3 text-white" />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          animation: marquee linear infinite;
        }
        
        .pause-animation {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}
