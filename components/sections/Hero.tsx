"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight } from "lucide-react";

interface HeroSlide {
  id: number;
  desktop: string;
  mobile: string;
  alt: string;
  link?: string;
  overlay?: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
}

interface HeroSettings {
  slides: HeroSlide[];
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    desktop: "/Hero_banner_Bir.jpg",
    mobile: "/Mobil_Hero_banner_2_s.jpg",
    alt: "Ezmeo - Doğal Fıstık Ezmeleri",
    link: "/urunler",
    overlay: {
      title: "Doğal Lezzetin",
      subtitle: "Tamamen organik, katkısız fıstık ezmeleri",
      ctaText: "Keşfet",
      ctaLink: "/urunler",
    },
  },
  {
    id: 2,
    desktop: "/hero banner fıstık ezmeleri.jpg",
    mobile: "/Mobil_hero banner_fistik_ezmesi.jpg",
    alt: "Ezmeo - Fıstık Ezmeleri",
    link: "/urunler",
    overlay: {
      title: "Sağlıklı Yaşam",
      subtitle: "Protein kaynağı, doğal enerji",
      ctaText: "İncele",
      ctaLink: "/urunler",
    },
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "hero_banners")
          .single();

        if (data?.value && (data.value as HeroSettings).slides?.length > 0) {
          setSlides((data.value as HeroSettings).slides);
        }
      } catch (error) {
        console.error("Error fetching hero settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const currentSection = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !autoPlay || isHovered) {
      setProgress(0);
      return;
    }

    const duration = 5000;
    const interval = 50;
    const step = 100 / (duration / interval);

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((current) => (current + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [isVisible, autoPlay, slides.length, currentSlide, isHovered]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const currentOverlay = slides[currentSlide]?.overlay;

  return (
    <section
      ref={sectionRef}
      className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[850px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isVisible || !loading ? (
        <>
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              {slides.map((slide, index) =>
                index === currentSlide ? (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 8, ease: "linear" }}
                    >
                      <Image
                        src={slide.desktop}
                        alt={slide.alt}
                        fill
                        className="object-cover object-center hidden md:block"
                        priority={index === 0}
                        sizes="100vw"
                        quality={90}
                      />
                      <Image
                        src={slide.mobile}
                        alt={slide.alt}
                        fill
                        className="object-cover object-center md:hidden"
                        priority={index === 0}
                        sizes="100vw"
                        quality={85}
                      />
                    </motion.div>

                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>

          {currentOverlay && (
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-2xl"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-white/90">Taze & Doğal</span>
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="block"
                      >
                        {currentOverlay.title}
                      </motion.span>
                    </h1>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-lg sm:text-xl md:text-2xl text-white/85 mb-8 sm:mb-10 max-w-xl leading-relaxed"
                    >
                      {currentOverlay.subtitle}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="flex flex-wrap gap-4"
                    >
                      <Link
                        href={currentOverlay.ctaLink}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-base hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      >
                        {currentOverlay.ctaText}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href="/urunler"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-semibold text-base hover:bg-white/20 transition-all duration-300"
                      >
                        Tüm Ürünler
                      </Link>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {slides.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                onClick={prevSlide}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-10 group"
                aria-label="Önceki slayt"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                onClick={nextSlide}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-10 group"
                aria-label="Sonraki slayt"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
              </motion.button>

              <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-4 sm:px-6">
                <div className="container mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? "bg-white w-8 sm:w-12"
                            : "bg-white/40 w-2 hover:bg-white/70"
                        }`}
                        aria-label={`Slayt ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors border border-white/20"
                    aria-label={autoPlay ? "Durdur" : "Oynat"}
                  >
                    {autoPlay ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-4 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0 }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      )}
    </section>
  );
}
