"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
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
    const colors = [
      "from-amber-500/20 to-orange-600/20",
      "from-emerald-500/20 to-teal-600/20",
      "from-rose-500/20 to-pink-600/20"
    ];
    return colors[order - 1] || "from-[#7B1113]/20 to-[#5d0e0f]/20";
  };

  const getGradientBorder = (order: number): string => {
    const gradients = [
      "from-amber-400 via-orange-500 to-amber-400",
      "from-emerald-400 via-teal-500 to-emerald-400",
      "from-rose-400 via-pink-500 to-rose-400"
    ];
    return gradients[order - 1] || "from-[#7B1113] via-[#F3E0E1] to-[#7B1113]";
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
      color: "from-amber-500/20 to-orange-600/20"
    },
    {
      id: 2,
      image: "/Hero_banner_Bir.jpg",
      mobileImage: "/hero-banner-super-gidalar-mobile.jpg",
      title: "Süper Gıdalar",
      subtitle: "Yeni Geldi!",
      buttonText: "Keşfet",
      buttonLink: "/koleksiyon/yeni-urunler",
      order: 2,
      badge: "✨ Yeni",
      color: "from-emerald-500/20 to-teal-600/20"
    },
    {
      id: 3,
      image: "/Findik_Ezmeleri_Kategorisi.webp",
      mobileImage: "/Findik_Ezmeleri_Kategorisi.webp",
      title: "Saf Organik",
      subtitle: "Koleksiyon",
      buttonText: "Göz At",
      buttonLink: "/koleksiyon/kuruyemis",
      order: 3,
      badge: "🌿 Organik",
      color: "from-rose-500/20 to-pink-600/20"
    }
  ];

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // 9:16 kart genişliği + gap
      const cardWidth = isMobile ? 180 : 270;
      const gap = isMobile ? 12 : 20;
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
      const cardWidth = isMobile ? 180 : 270;
      const gap = isMobile ? 12 : 20;
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
      const cardWidth = isMobile ? 180 : 270;
      const gap = isMobile ? 12 : 20;
      
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
      <section className="py-16 md:py-24 bg-[#FFF5F5]" id="promotional-banners">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header Skeleton */}
          <div className="text-center mb-10 md:mb-14">
            <div className="h-6 w-32 bg-[#F3E0E1] rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-64 bg-[#F3E0E1] rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-5 w-80 bg-[#F3E0E1] rounded mx-auto animate-pulse" />
          </div>
          {/* Cards Skeleton */}
          <div className="flex gap-4 md:gap-5 justify-center">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[180px] md:w-[270px] aspect-[9/16] rounded-2xl md:rounded-3xl bg-[#F3E0E1] animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-16 md:py-24 bg-[#FFF5F5] overflow-hidden" 
      id="promotional-banners"
      aria-label="Promosyon Bannerları"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Modern Editorial Style */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          {/* Eyebrow Text */}
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7B1113]/10 text-[#7B1113] text-sm font-medium mb-4 border border-[#7B1113]/20"
          >
            <span className="w-2 h-2 rounded-full bg-[#7B1113] animate-pulse" />
            Özel Fırsatlar
          </motion.span>
          
          {/* Main Title */}
          <h2 className="text-3xl md:text-5xl font-bold text-[#7B1113] mb-4 tracking-tight">
            Keşfedilmeyi Bekleyen
            <span className="block mt-1 bg-gradient-to-r from-[#7B1113] via-[#7B1113]/80 to-[#7B1113] bg-clip-text text-transparent">
              Lezzetler
            </span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-[#6b4b4c] text-base md:text-lg max-w-lg mx-auto leading-relaxed">
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
            className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-xl border border-[#7B1113]/10 text-[#7B1113] hover:bg-[#7B1113] hover:text-white hover:shadow-2xl hover:scale-110 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none group"
            onClick={() => scroll("left")}
            aria-label="Önceki banner"
            disabled={currentIndex === 0}
            type="button"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button 
            className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-xl border border-[#7B1113]/10 text-[#7B1113] hover:bg-[#7B1113] hover:text-white hover:shadow-2xl hover:scale-110 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none group"
            onClick={() => scroll("right")}
            aria-label="Sonraki banner"
            disabled={currentIndex === sortedBanners.length - 1}
            type="button"
          >
            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Cards Track - Centered */}
          <div 
            ref={scrollRef}
            className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 justify-start md:justify-center"
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedBanners.map((banner, index) => (
              <motion.div 
                key={banner.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="group relative flex-shrink-0 snap-center"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute -inset-[2px] rounded-2xl md:rounded-3xl bg-gradient-to-r ${getGradientBorder(banner.order)} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                
                <Link 
                  href={banner.buttonLink}
                  className="block relative w-[180px] md:w-[270px] aspect-[9/16] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-[#7B1113]"
                >
                  {/* Background Image with 9:16 Container */}
                  <div className="absolute inset-0">
                    <Image
                      src={isMobile && banner.mobileImage ? banner.mobileImage : banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 180px, 270px"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                    />
                  </div>

                  {/* Gradient Overlay - Enhanced for 9:16 */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500`} />
                  
                  {/* Top Gradient for Badge Visibility */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

                  {/* Glassmorphism Badge */}
                  {banner.badge && (
                    <div className="absolute top-4 left-4 right-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-lg border border-white/30">
                        {banner.badge}
                      </span>
                    </div>
                  )}

                  {/* Content - Bottom Positioned for 9:16 */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                    <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                      {/* Subtitle with Glass Effect */}
                      <span className="inline-block px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-white/90 text-[10px] md:text-xs font-medium tracking-wider uppercase mb-2 border border-white/20">
                        {banner.subtitle}
                      </span>
                      
                      {/* Title - Larger for 9:16 impact */}
                      <h3 className="text-lg md:text-2xl font-bold text-white mb-3 leading-tight">
                        {banner.title}
                      </h3>
                      
                      {/* CTA Button - Glassmorphism Style */}
                      <div className="flex items-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-semibold border border-white/30 transform transition-all duration-300 group-hover:bg-white group-hover:text-[#7B1113] group-hover:gap-3">
                          {banner.buttonText}
                          <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Glow */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl border-2 border-white/0 group-hover:border-white/30 transition-colors duration-500 pointer-events-none" />
                  
                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Modern Progress Dots */}
          <div 
            className="flex items-center justify-center gap-2 mt-8"
            role="tablist"
            aria-label="Banner navigasyonu"
          >
            {sortedBanners.map((_, idx) => (
              <button
                key={idx}
                className={`relative h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-8 bg-[#7B1113]' 
                    : 'w-2 bg-[#7B1113]/30 hover:bg-[#7B1113]/50'
                }`}
                onClick={() => goToSlide(idx)}
                aria-label={`Banner ${idx + 1}'e git`}
                aria-selected={idx === currentIndex}
                role="tab"
                type="button"
              >
                {idx === currentIndex && (
                  <span className="absolute inset-0 rounded-full bg-[#7B1113] animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* View All Link - Optional */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link 
            href="/urunler" 
            className="inline-flex items-center gap-2 text-[#7B1113] font-medium hover:gap-3 transition-all duration-300 group"
          >
            <span className="border-b-2 border-[#7B1113]/30 group-hover:border-[#7B1113] transition-colors">
              Tüm Ürünleri Keşfet
            </span>
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
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
