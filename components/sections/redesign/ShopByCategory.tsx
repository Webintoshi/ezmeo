
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
      // If no categories from DB, fallbacks (mimicking the design with available assets)
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
            image: "/hero banner fıstık ezmeleri.jpg", // Fallback
            description: "",
            icon: "",
            productCount: 0
          },
          // Add more duplicates to fill the grid if needed to match the visual of 6 items
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
    <section className="redesign-section" id="shop-by-category">
      <div className="redesign-container">
        <h2 className="redesign-title">Shop by Category</h2>
        <div className="shop-category__grid">
          {categories.map((cat) => (
            <Link href={`/koleksiyon/${cat.slug}`} key={cat.id} className="shop-category__card">
              <div className="shop-category__image-wrapper">
                <Image
                  src={cat.image || "/placeholder.jpg"}
                  alt={cat.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
              </div>
              <h3 className="shop-category__title">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
