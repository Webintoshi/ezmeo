"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const slides = [
    {
      id: 1,
      desktop: "/Hero_banner_Bir.jpg",
      mobile: "/Mobil_Hero_banner_2_s.jpg",
      alt: "Ezmeo - Doğal Fıstık Ezmeleri",
    },
    {
      id: 2,
      desktop: "/hero banner fıstık ezmeleri.jpg",
      mobile: "/Mobil_hero banner_fistik_ezmesi.jpg",
      alt: "Ezmeo - Fıstık Ezmeleri",
    },
  ];

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isVisible, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section ref={sectionRef} className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {isVisible ? (
        <>
          {/* Slider Images */}
          <div className="absolute inset-0">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Desktop Image */}
                <Image
                  src={slide.desktop}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center hidden md:block"
                  priority={index === 0}
                />
                {/* Mobile Image */}
                <Image
                  src={slide.mobile}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center md:hidden"
                  priority={index === 0}
                />
                {/* Dark Overlay - Removed for cleaner look */}
              </div>
            ))}
          </div>



          {/* Slider Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
            aria-label="Önceki slayt"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
            aria-label="Sonraki slayt"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-8 md:w-10"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Slayt ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : (
        // Loading Skeleton
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse" />
      )}
    </section>
  );
}
