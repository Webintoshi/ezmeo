"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";

// Kategori görselleri mapping
const categoryImages: Record<string, string> = {
  "fistik-ezmesi": "/fistik_ezmesi_kategori_gorsel.webp",
  "findik-ezmesi": "/Findik_Ezmeleri_Kategorisi.webp",
  "kuruyemis": "/KURUYEMIS_KATEGORISI_BANNER.svg",
};

export function Categories() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-secondary/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/50 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 scroll-slide ${isVisible ? "is-visible" : ""}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary">Koleksiyonlarımız</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Ürün Kategorileri
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Fıstık ezmeleri, fındık ezmeleri ve doğal kuruyemişlerimizle sağlıklı yaşamınıza katkı sağlayın.
          </p>
        </div>

        {/* Categories Grid */}
        <div ref={sectionRef} className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 scroll-slide ${isVisible ? "is-visible" : ""}`}>
          {CATEGORIES.map((category, index) => (
            <div key={category.id}>
              <Link
                href={ROUTES.category(category.slug)}
                className="group block"
              >
                <div className="premium-card-hover bg-white rounded-3xl overflow-hidden h-full shadow-lg border border-gray-100 relative">
                  {/* Kategori Görseli */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={categoryImages[category.slug] || "/placeholder.jpg"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                    {/* Kategori Adı - Görsel Üzerinde */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-bold text-2xl mb-1 drop-shadow-lg">
                        {category.name}
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow">
                        {category.productCount} ürün seçeneği
                      </p>
                    </div>
                  </div>

                  {/* İçerik Alanı */}
                  <div className="p-6 text-center">
                    {/* Description */}
                    <p className="text-sm text-muted/80 mb-4 leading-relaxed">
                      {category.name === "Fıstık Ezmeleri" && "Protein dolu, enerji verici doğal lezzet"}
                      {category.name === "Fındık Ezmeleri" && "Karadeniz'in en kaliteli fındıklarından"}
                      {category.name === "Kuruyemişler" && "Taze, doğal, sağlıklı atıştırmalık"}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className={`text-center mt-12 scroll-slide ${isVisible ? "is-visible" : ""}`}>
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Tüm Ürünleri Görüntüle
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
