"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getFeaturedProducts } from "@/lib/products";
import { ROUTES } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";

export function FeaturedProducts() {
  const featuredProducts = getFeaturedProducts(3);
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
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/50 rounded-full blur-3xl"></div>
      </div>

      <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 scroll-slide ${isVisible ? "is-visible" : ""}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary">Müşteri Favorileri</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Çok Satanlar
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            En çok tercih edilen doğal ezmelerimizle tanışın. Binlerce mutlu müşterinin favorisi.
          </p>
        </div>

        {/* Products Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 scroll-slide ${isVisible ? "is-visible" : ""}`}>
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Mobile & Desktop View All Button */}
        <div className={`mt-12 text-center scroll-slide ${isVisible ? "is-visible" : ""}`}>
          <Link
            href={ROUTES.allProducts}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
