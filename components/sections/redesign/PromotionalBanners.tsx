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
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
              image: "/hero banner fıstık ezmeleri.jpg",
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
    <section className="redesign-section redesign-section--alt" id="promotional-banners">
      <div className="redesign-container">
        <div 
          className="promo-banners__carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button 
            className="promo-banners__scroll-btn promo-banners__scroll-btn--left"
            onClick={() => scroll("left")}
            aria-label="Önceki banner"
          >
            <ChevronLeft size={24} />
          </button>

          <div 
            ref={scrollRef}
            className="promo-banners__track"
            onScroll={handleScroll}
          >
            {sortedBanners.map((banner, index) => (
              <div 
                key={banner.id} 
                className="promo-banners__card"
              >
                <div className="promo-banners__image-wrapper">
                  <Image
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    fill
                    className="promo-banners__image"
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 33vw, 25vw"
                    priority={index === 0}
                  />
                </div>
                <div className="promo-banners__overlay" />
                <div className="promo-banners__content">
                  <span className="promo-banners__subtitle">{banner.subtitle}</span>
                  <h3 className="promo-banners__title">{banner.title}</h3>
                  <Link href={banner.buttonLink} className="promo-banners__button">
                    {banner.buttonText}
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="promo-banners__scroll-btn promo-banners__scroll-btn--right"
            onClick={() => scroll("right")}
            aria-label="Sonraki banner"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="promo-banners__dots">
          {sortedBanners.map((_, idx) => (
            <button
              key={idx}
              className={`promo-banners__dot ${idx === currentIndex ? 'promo-banners__dot--active' : ''}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Banner ${idx + 1}'e git`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
