
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryInfo } from "@/types/product";
import { fetchCategories } from "@/lib/categories";

export default function ShopByCategory() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const data = await fetchCategories();
      if (!data || data.length === 0) {
        setCategories([
          {
            id: "1",
            name: "Fıstık Ezmesi",
            slug: "fistik-ezmesi",
            image: "/fistik_ezmesi_kategori_gorsel.webp",
            description: "",
            icon: "",
            productCount: 0
          },
          {
            id: "2",
            name: "Fındık Ezmesi",
            slug: "findik-ezmesi",
            image: "/Findik_Ezmeleri_Kategorisi.webp",
            description: "",
            icon: "",
            productCount: 0
          },
          {
            id: "3",
            name: "Kuruyemiş",
            slug: "kuruyemis",
            image: "/hero banner fıstık ezmeleri.jpg",
            description: "",
            icon: "",
            productCount: 0
          },
          {
             id: "4",
             name: "Özel Paketler",
             slug: "ozel-paketler",
             image: "/Mobil_Hero_banner_2_s.jpg",
             description: "",
             icon: "",
             productCount: 0
          },
           {
             id: "5",
             name: "Yeni Ürünler",
             slug: "yeni-urunler",
             image: "/Hero_banner_Bir.jpg",
             description: "",
             icon: "",
             productCount: 0
          },
           {
             id: "6",
             name: "Avantajlı Setler",
             slug: "avantajli-setler",
             image: "/Findik_Ezmeleri_Kategorisi.webp",
             description: "",
             icon: "",
             productCount: 0
          }
        ]);
      } else {
        setCategories(data);
      }
    }
    loadCategories();
  }, []);

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
        
        <div 
          className="shop-by-category__grid" 
          role="list" 
          aria-label="Ürün kategorileri"
        >
          {categories.map((cat, index) => (
            <Link
              href={`/koleksiyon/${cat.slug}`}
              key={cat.id}
              role="listitem"
              className="shop-by-category__card"
              style={{ animationDelay: `${index * 80}ms` }}
              aria-label={`${cat.name} kategorisini incele`}
            >
              <div className="shop-by-category__image-container">
                <div className="shop-by-category__image-wrapper">
                  <Image
                    src={cat.image || "/placeholder.jpg"}
                    alt=""
                    fill
                    className="shop-by-category__image"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
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
      </div>
    </section>
  );
}
