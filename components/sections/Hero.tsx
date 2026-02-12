"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface HeroSlide {
  id: number;
  desktop: string;
  mobile: string;
  alt: string;
  link?: string;
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
  },
  {
    id: 2,
    desktop: "/hero banner fıstık ezmeleri.jpg",
    mobile: "/Mobil_hero banner_fistik_ezmesi.jpg",
    alt: "Ezmeo - Fıstık Ezmeleri",
    link: "/urunler",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
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
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const duration = 8000;
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
  }, [isVisible, slides.length, currentSlide]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[850px] overflow-hidden bg-gray-900"
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
                    <div className="absolute inset-0">
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
                    </div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-4 sm:px-6">
              <div className="container mx-auto flex items-center justify-center">
                <div className="flex items-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        setProgress(0);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-white w-8 sm:w-12"
                          : "bg-white/40 w-2 hover:bg-white/70"
                      }`}
                      aria-label={`Slayt ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 h-0.5 bg-white/20 rounded-full overflow-hidden max-w-md mx-auto">
                <motion.div
                  className="h-full bg-white"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0 }}
                />
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      )}
    </section>
  );
}
