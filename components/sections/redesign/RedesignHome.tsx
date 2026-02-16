
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { HeroSection, Newsletter } from "./ExistingSections";
import ShopByCategory from "./ShopByCategory";
import BestSellers from "./BestSellers";
import PromotionalBanners from "./PromotionalBanners";
import ShopByLifestyle from "./ShopByLifestyle";

interface HeroSlide {
  id: number;
  desktop: string;
  mobile: string;
  alt: string;
  link?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function RedesignHome() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHero() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "hero_banners")
          .single();

        if (data?.value?.slides?.length > 0) {
          setSlides(data.value.slides);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHero();
  }, []);

  return (
    <main className="min-h-screen">
      <HeroSection slides={slides} />
      
      {/* Redesign Sections */}
      <ShopByCategory />
      <BestSellers />
      <PromotionalBanners />
      <ShopByLifestyle />

    </main>
  );
}
