"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PromoBanner {
  id: number;
  image: string;
  mobileImage?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  order: number;
}

export default function PromotionalBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

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
          setBanners(data.value.banners);
        } else {
          setBanners([
            {
              id: 1,
              image: "/hero-banner-fistik-ezmeleri.jpg",
              title: "Doğal Fıstık Ezmesi",
              subtitle: "Her Gün Taze",
              buttonText: "İncele",
              buttonLink: "/koleksiyon/fistik-ezmesi",
              order: 1
            },
            {
              id: 2,
              image: "/Hero_banner_Bir.jpg",
              title: "Süper Gıdalar",
              subtitle: "Yeni Geldi!",
              buttonText: "Keşfet",
              buttonLink: "/koleksiyon/yeni-urunler",
              order: 2
            },
            {
              id: 3,
              image: "/Findik_Ezmeleri_Kategorisi.webp",
              title: "Saf Organik",
              subtitle: "Koleksiyon",
              buttonText: "Göz At",
              buttonLink: "/koleksiyon/kuruyemis",
              order: 3
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const card = scrollRef.current.children[currentIndex] as HTMLElement;
      if (card) {
        const scrollAmount = card.offsetWidth + 16;
        scrollRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth"
        });
      }
    }
  }, [currentIndex]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, banners.length - 1));
    }
  }, [banners.length]);

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
      if (diff > 0) {
        scroll("right");
      } else {
        scroll("left");
      }
    }
  }, [scroll]);

  const goToSlide = useCallback((index: number) => {
    if (scrollRef.current) {
      const card = scrollRef.current.children[index] as HTMLElement;
      if (card) {
        const scrollAmount = card.offsetWidth + 16;
        scrollRef.current.scrollTo({
          left: index * scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  const autoPlayTimeout = 5000;

  useEffect(() => {
    if (!isPaused && sortedBanners.length > 1 && !loading) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sortedBanners.length);
        goToSlide((currentIndex + 1) % sortedBanners.length);
      }, autoPlayTimeout);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPaused, sortedBanners.length, loading, currentIndex]);

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  if (loading) {
    return (
      <section className="redesign-section redesign-section--alt" id="promotional-banners">
        <div className="redesign-container">
          <div className="promo-banners__grid">
            <div className="promo-banners__card-skeleton" />
            <div className="promo-banners__card-skeleton" />
            <div className="promo-banners__card-skeleton" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="redesign-section redesign-section--alt" 
      id="promotional-banners"
      aria-label="Promosyon Bannerları"
    >
      <div className="redesign-container">
        <div 
          className="promo-banners__carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          role="region"
          aria-roledescription="carousel"
          aria-label="Promosyon Bannerları"
        >
          <button 
            className="promo-banners__scroll-btn promo-banners__scroll-btn--left"
            onClick={() => scroll("left")}
            aria-label="Önceki banner"
            disabled={currentIndex === 0}
            type="button"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>

          <div 
            ref={scrollRef}
            className="promo-banners__track"
            onScroll={handleScroll}
            role="group"
            aria-live="polite"
            aria-atomic="false"
          >
            {sortedBanners.map((banner, index) => (
              <div 
                key={banner.id} 
                className="promo-banners__card"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${sortedBanners.length}`}
              >
                <div className="promo-banners__image-wrapper">
                  <Image
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    fill
                    className="promo-banners__image"
                    sizes="(max-width: 600px) 90vw, (max-width: 1024px) 70vw, 33vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    priority={index === 0}
                  />
                </div>
                <div className="promo-banners__overlay" />
                <div className="promo-banners__content">
                  <span className="promo-banners__subtitle">{banner.subtitle}</span>
                  <h2 className="promo-banners__title">{banner.title}</h2>
                  <Link 
                    href={banner.buttonLink} 
                    className="promo-banners__button"
                    aria-label={`${banner.title} koleksiyonuna git`}
                  >
                    {banner.buttonText}
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="promo-banners__scroll-btn promo-banners__scroll-btn--right"
            onClick={() => scroll("right")}
            aria-label="Sonraki banner"
            disabled={currentIndex === sortedBanners.length - 1}
            type="button"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>

        <div 
          className="promo-banners__dots"
          role="tablist"
          aria-label="Banner navigasyonu"
        >
          {sortedBanners.map((_, idx) => (
            <button
              key={idx}
              className={`promo-banners__dot ${idx === currentIndex ? 'promo-banners__dot--active' : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Banner ${idx + 1}'e git`}
              aria-selected={idx === currentIndex}
              role="tab"
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
