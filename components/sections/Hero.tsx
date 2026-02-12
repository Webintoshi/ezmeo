"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

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
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<NodeJS.Timeout>();

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

  // Auto-play with progress
  useEffect(() => {
    if (!isVisible || !autoPlay) {
      setProgress(0);
      return;
    }

    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
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
  }, [isVisible, autoPlay, slides.length, currentSlide]);

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
      className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-gray-100"
    >
      {isVisible || !loading ? (
        <>
          {/* Slider Images */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              {slides.map((slide, index) =>
                index === currentSlide ? (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {/* Desktop Image */}
                    <Image
                      src={slide.desktop}
                      alt={slide.alt}
                      fill
                      className="object-cover object-center hidden md:block"
                      priority={index === 0}
                      sizes="100vw"
                    />
                    {/* Mobile Image */}
                    <Image
                      src={slide.mobile}
                      alt={slide.alt}
                      fill
                      className="object-cover object-center md:hidden"
                      priority={index === 0}
                      sizes="100vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>

          {/* Overlay Content */}
          {currentOverlay && (
            <div className="absolute inset-0 flex items-end pb-20 sm:pb-24 md:pb-32">
              <div className="container mx-auto px-4 sm:px-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-2xl"
                  >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                      {currentOverlay.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-xl">
                      {currentOverlay.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      <Link
                        href={currentOverlay.ctaLink}
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-full font-semibold text-sm sm:text-base hover:scale-105 transition-transform shadow-xl"
                      >
                        {currentOverlay.ctaText}
                      </Link>
                      <Link
                        href="/urunler"
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-semibold text-sm sm:text-base hover:bg-white/20 transition-colors"
                      >
                        Tüm Ürünler
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Controls */}
          {slides.length > 1 && (
            <>
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                aria-label="Önceki slayt"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                aria-label="Sonraki slayt"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </button>

              {/* Bottom Bar */}
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 px-4 sm:px-6">
                <div className="container mx-auto flex items-center justify-between">
                  {/* Dots Navigation */}
                  <div className="flex items-center gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? "bg-white w-6 sm:w-8"
                            : "bg-white/50 w-2 hover:bg-white/80"
                        }`}
                        aria-label={`Slayt ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Auto-play Toggle */}
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                    aria-label={autoPlay ? "Durdur" : "Oynat"}
                  >
                    {autoPlay ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0 }}
                  />
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
    </section>
  );
}
