"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createBrowserClient } from "@/supabase/browser";
import { CategoryInfo } from "@/types/product";

const DEFAULT_IMAGES: Record<string, string> = {
  "fistik-ezmesi": "https://images.unsplash.com/photo-1612187715474-5e78a3728a1a?w=600&h=400&fit=crop",
  "findik-ezmesi": "https://images.unsplash.com/photo-1599599810769-bcde5a1645f7?w=600&h=400&fit=crop",
  "kuruyemis": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=400&fit=crop",
};

const COLORS = [
  "from-amber-600 to-orange-700",
  "from-amber-700 to-yellow-800",
  "from-amber-800 to-yellow-900",
  "from-green-600 to-emerald-700",
  "from-blue-600 to-cyan-700",
  "from-purple-600 to-pink-700",
];

export function CategoryShowcase() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createBrowserClient();
        
        const { data: categoriesData, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Failed to load categories:", error);
          return;
        }

        if (categoriesData) {
          // Get product counts for each category
          const { data: products } = await supabase
            .from("products")
            .select("category");

          const counts: Record<string, number> = {};
          products?.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
          });

          const categoriesWithCounts = categoriesData.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            image: cat.image || DEFAULT_IMAGES[cat.slug] || "",
            icon: cat.icon || "📦",
            productCount: counts[cat.slug] || 0,
          }));

          setCategories(categoriesWithCounts);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Kategoriler
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Lezzet Kategorileri
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[4/5] md:aspect-auto bg-gray-200 rounded-3xl animate-pulse" />
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
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Kategoriler
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Lezzet Kategorileri
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Size özel hazırlanmış doğal ezmelerimizi ve kuruyemişlerimizi keşfedin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/koleksiyon/${category.slug}`}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] md:aspect-auto"
            >
              <div className="absolute inset-0">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-6xl">{category.icon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className={`inline-block w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[index % COLORS.length]} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-white/80 mb-4">
                  {category.productCount} ürün
                </p>

                <div className="flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                  <span>Keşfet</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
