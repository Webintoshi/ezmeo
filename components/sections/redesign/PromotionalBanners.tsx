"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PromoBanner {
  id: number;
  image: string;
  mobileImage?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  badge?: string;
  color?: string;
}

export default function PromotionalBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "promo_banners")
          .single();

        if (data?.value?.banners) {
          // Merge with defaults for new fields
          const mergedBanners = data.value.banners.map((banner: PromoBanner) => ({
            ...banner,
            badge: banner.badge || getDefaultBadge(banner.order),
            color: banner.color || getDefaultColor(banner.order),
          }));
          setBanners(mergedBanners);
        } else {
          setBanners(getDefaultBanners());
        }
      } catch (err) {
        console.error(err);
        setBanners(getDefaultBanners());
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const getDefaultBadge = (order: number): string => {
    const badges = ["🔥 Çok Satan", "✨ Yeni", "🌿 Organik"];
    return badges[order - 1] || "✨ Özel";
  };

  const getDefaultColor = (order: number): string => {
    const colors = ["from-amber-500 to-orange-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600"];
    return colors[order - 1] || "from-primary to-primary/80";
  };

  const getDefaultBanners = (): PromoBanner[] => [
    {
      id: 1,
      image: "/hero-banner-fistik-ezmeleri.jpg",
      mobileImage: "/hero-banner-fistik-ezmeleri-mobile.jpg",
      title: "Doğal Fıstık Ezmesi",
      subtitle: "Her Gün Taze",
      buttonText: "İncele",
      buttonLink: "/koleksiyon/fistik-ezmesi",
      order: 1,
      badge: "🔥 Çok Satan",
      color: "from-amber-500 to-orange-600"
    },
    {
      id: 2,
      image: "/Hero_banner_Bir.jpg",
      mobileImage: "/Hero_banner_Bir-mobile.jpg",
      title: "Süper Gıdalar",
      subtitle: "Yeni Geldi!",
      buttonText: "Keşfet",
      buttonLink: "/koleksiyon/yeni-urunler",
      order: 2,
      badge: "✨ Yeni",
      color: "from-emerald-500 to-teal-600"
    },
    {
      id: 3,
      image: "/Findik_Ezmeleri_Kategorisi.webp",
      mobileImage: "/Findik_Ezmeleri_Kategorisi-mobile.webp",
      title: "Saf Organik",
      subtitle: "Koleksiyon",
      buttonText: "Göz At",
      buttonLink: "/koleksiyon/kuruyemis",
      order: 3,
      badge: "🌿 Organik",
      color: "from-rose-500 to-pink-600"
    }
  ];

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = isMobile ? container.offsetWidth * 0.85 : 380;
      const gap = isMobile ? 12 : 24;
      const scrollAmount = cardWidth + gap;
      
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  }, [isMobile]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = isMobile ? scrollRef.current.offsetWidth * 0.85 : 404;
      const gap = isMobile ? 12 : 24;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(newIndex, banners.length - 1));
    }
  }, [banners.length, isMobile]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < banners.length - 1) {
        scroll("right");
      } else if (diff < 0 && currentIndex > 0) {
        scroll("left");
      }
    }
  }, [scroll, currentIndex, banners.length]);

  const goToSlide = useCallback((index: number) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = isMobile ? container.offsetWidth * 0.85 : 380;
      const gap = isMobile ? 12 : 24;
      
      container.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth'
      });
    }
  }, [isMobile]);

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
  const autoPlayTimeout = 5000;

  useEffect(() => {
    if (!isPaused && sortedBanners.length > 1 && !loading) {
      autoPlayRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % sortedBanners.length;
        setCurrentIndex(nextIndex);
        goToSlide(nextIndex);
      }, autoPlayTimeout);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPaused, sortedBanners.length, loading, currentIndex, goToSlide]);

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50/50 to-white" id="promotional-banners">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[85vw] md:w-[380px] h-[280px] md:h-[480px] rounded-2xl md:rounded-3xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-12 md:py-20 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden" 
      id="promotional-banners"
      aria-label="Promosyon Bannerları"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Özel Fırsatlar
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            Keşfedilmeyi Bekleyen Lezzetler
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
            En sevilen ürünlerimiz ve yeni koleksiyonlarımız için özel seçkiler
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
        >
          {/* Navigation Buttons - Desktop Only */}
          <button 
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:text-primary hover:shadow-xl transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none"
            onClick={() => scroll("left")}
            aria-label="Önceki banner"
            disabled={currentIndex === 0}
            type="button"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:text-primary hover:shadow-xl transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none"
            onClick={() => scroll("right")}
            aria-label="Sonraki banner"
            disabled={currentIndex === sortedBanners.length - 1}
            type="button"
          >
            <ChevronRight size={24} />
          </button>

          {/* Cards Track */}
          <div 
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedBanners.map((banner, index) => (
              <motion.div 
                key={banner.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex-shrink-0 w-[85vw] md:w-[380px] lg:w-[420px] snap-center"
              >
                <Link 
                  href={banner.buttonLink}
                  className="block relative h-[280px] md:h-[480px] rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={isMobile && banner.mobileImage ? banner.mobileImage : banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 85vw, 400px"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Color Accent Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${banner.color || 'from-primary/40 to-transparent'} opacity-0 group-hover:opacity-60 transition-opacity duration-500 mix-blend-overlay`} />

                  {/* Badge */}
                  {banner.badge && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-900 shadow-lg">
                        {banner.badge}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                    <div className="transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                      {/* Subtitle */}
                      <span className="inline-block text-white/80 text-xs md:text-sm font-medium tracking-wider uppercase mb-2">
                        {banner.subtitle}
                      </span>
                      
                      {/* Title */}
                      <h3 className="text-xl md:text-3xl font-bold text-white mb-4 leading-tight">
                        {banner.title}
                      </h3>
                      
                      {/* CTA Button */}
                      <div className="flex items-center">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg transform transition-all duration-300 group-hover:gap-3 group-hover:bg-primary group-hover:text-white">
                          {banner.buttonText}
                          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl border-2 border-white/0 group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Progress Dots */}
          <div 
            className="flex items-center justify-center gap-2 mt-6"
            role="tablist"
            aria-label="Banner navigasyonu"
          >
            {sortedBanners.map((_, idx) => (
              <button
                key={idx}
                className={`relative h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => goToSlide(idx)}
                aria-label={`Banner ${idx + 1}'e git`}
                aria-selected={idx === currentIndex}
                role="tab"
                type="button"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles for Scrollbar Hide */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
