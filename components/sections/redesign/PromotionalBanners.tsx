"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PromoBanner {
  id: number;
  image: string;
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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    }
  };

  const sortedBanners = banners.sort((a,b) => a.order - b.order);

  if (loading) {
      return <section className="redesign-section redesign-section--alt" id="promotional-banners"><div className="redesign-container"><div className="promo-banners__grid">Loading...</div></div></section>
  }

  return (
    <section className="redesign-section redesign-section--alt" id="promotional-banners">
      <div className="redesign-container">
        <div className="promo-banners__carousel">
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
            {sortedBanners.map((banner) => (
              <div key={banner.id} className="promo-banners__card">
                <Image
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  fill
                  className="promo-banners__image"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
                <div className="promo-banners__content">
                  <span className="promo-banners__subtitle">{banner.subtitle}</span>
                  <h3 className="promo-banners__title">{banner.title}</h3>
                  <Link href={banner.buttonLink} className="promo-banners__button">
                    {banner.buttonText}
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
              onClick={() => {
                if (scrollRef.current) {
                  const scrollAmount = scrollRef.current.offsetWidth;
                  scrollRef.current.scrollTo({
                    left: idx * scrollAmount,
                    behavior: 'smooth'
                  });
                }
              }}
              aria-label={`Banner ${idx + 1}'e git`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
