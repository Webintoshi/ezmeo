"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryInfo } from "@/types/product";
import { fetchCategories } from "@/lib/categories";

export default function ShopByCategory() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="redesign-section shop-by-category" id="shop-by-category">
        <div className="redesign-container">
          <header className="shop-by-category__header">
            <h2 className="shop-by-category__title">Kategoriye Göz At</h2>
            <p className="shop-by-category__subtitle">Doğal lezzetleri keşfedin</p>
          </header>
          <div className="shop-by-category__skeleton-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shop-by-category__skeleton-card">
                <div className="shop-by-category__skeleton-image" />
                <div className="shop-by-category__skeleton-text" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section 
      className="redesign-section shop-by-category" 
      id="shop-by-category"
      aria-labelledby="category-heading"
    >
      <div className="redesign-container">
        <header className="shop-by-category__header">
          <h2 id="category-heading" className="shop-by-category__title">
            Kategoriye Göz At
          </h2>
          <p className="shop-by-category__subtitle">
            Doğal lezzetleri keşfedin
          </p>
        </header>

        <div className="shop-by-category__carousel">
          <button 
            className="shop-by-category__scroll-btn shop-by-category__scroll-btn--left"
            onClick={() => scroll("left")}
            aria-label="Önceki kategoriler"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div 
            ref={scrollRef}
            className="shop-by-category__track"
            role="list"
            aria-label="Ürün kategorileri"
          >
            {categories.map((cat, index) => (
              <Link
                href={`/koleksiyon/${cat.slug}`}
                key={cat.id}
                role="listitem"
                className="shop-by-category__card"
                style={{ animationDelay: `${index * 100}ms` }}
                aria-label={`${cat.name} kategorisini incele`}
              >
                <div className="shop-by-category__image-container">
                  <div className="shop-by-category__image-wrapper">
                    <Image
                      src={cat.image || "/placeholder.jpg"}
                      alt=""
                      fill
                      className="shop-by-category__image"
                      sizes="80vw"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="shop-by-category__overlay" />
                </div>
                
                <div className="shop-by-category__content">
                  <h3 className="shop-by-category__name">
                    {cat.name}
                  </h3>
                  {cat.productCount !== undefined && cat.productCount > 0 && (
                    <span className="shop-by-category__count">
                      {cat.productCount} ürün
                    </span>
                  )}
                </div>
                
                <span className="shop-by-category__arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
            ))}
          </div>

          <button 
            className="shop-by-category__scroll-btn shop-by-category__scroll-btn--right"
            onClick={() => scroll("right")}
            aria-label="Sonraki kategoriler"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
