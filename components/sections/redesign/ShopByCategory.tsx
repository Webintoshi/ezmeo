"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryInfo } from "@/types/product";
import { fetchCategories } from "@/lib/categories";

export default function ShopByCategory() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <section className="redesign-section shop-by-category" id="shop-by-category">
        <div className="redesign-container">
          <header className="shop-by-category__header">
            <h2 className="shop-by-category__title">Kategoriye Göz At</h2>
            <p className="shop-by-category__subtitle">Doğal lezzetleri keşfedin</p>
          </header>
          <div className="shop-by-category__grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shop-by-category__skeleton-card-horizontal">
                <div className="shop-by-category__skeleton-image-horizontal" />
                <div className="shop-by-category__skeleton-content-horizontal">
                  <div className="shop-by-category__skeleton-text-horizontal" />
                  <div className="shop-by-category__skeleton-text-short" />
                </div>
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

        <div className="shop-by-category__grid">
          {categories.map((cat, index) => (
            <Link
              href={`/koleksiyon/${cat.slug}`}
              key={cat.id}
              className="shop-by-category__card-horizontal"
              style={{ animationDelay: `${index * 100}ms` }}
              aria-label={`${cat.name} kategorisini incele`}
            >
              <div className="shop-by-category__image-wrapper-horizontal">
                <Image
                  src={cat.image || "/placeholder.jpg"}
                  alt={cat.name}
                  fill
                  className="shop-by-category__image-horizontal"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              
              <div className="shop-by-category__content-horizontal">
                <h3 className="shop-by-category__name-horizontal">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="shop-by-category__description">
                    {cat.description}
                  </p>
                )}
                {cat.productCount !== undefined && cat.productCount > 0 && (
                  <span className="shop-by-category__count-horizontal">
                    {cat.productCount} ürün
                  </span>
                )}
                <span className="shop-by-category__arrow-horizontal" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Keşfet</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
