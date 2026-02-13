"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";

const OFFER = {
  title: "İlk Siparişinizde %10 İndirim!",
  description: "Ezmeo'nun eşsiz lezzetlerini keşfetmek için hemen kampanyamıza katılın. İlk siparişinizde geçerli %10 indirim sizi bekliyor.",
  code: "ILK10",
  expiry: 7,
  bgImage: "https://images.unsplash.com/photo-1612187715474-5e78a3728a1a?w=1200&h=600&fit=crop"
};

function CountdownTimer({ days }: { days: number }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-3">
      {[
        { value: timeLeft.hours, label: "Saat" },
        { value: timeLeft.minutes, label: "Dk" },
        { value: timeLeft.seconds, label: "Sn" }
      ].map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-bold text-white">
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-white/70 mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SpecialOffer() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={OFFER.bgImage}
          alt="Special offer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Limited Offer</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {OFFER.title}
          </h2>

          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {OFFER.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <span className="text-sm text-white/70">İndirim Kodu:</span>
                <span className="ml-2 text-2xl font-bold text-white tracking-wider">{OFFER.code}</span>
              </div>
            </div>

            <CountdownTimer days={OFFER.expiry} />
          </div>

          <Link
            href="/urunler"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            <span>Alışverişe Başla</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
