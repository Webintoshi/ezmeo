"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CategoryInfo } from "@/types/product";
import { fetchCategories } from "@/lib/categories";
import { ArrowRight } from "lucide-react";

export default function ShopByCategory() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

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
      <section className="py-12 md:py-20 bg-white" id="shop-by-category">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
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
      className="py-10 md:py-20 bg-white" 
      id="shop-by-category"
      aria-labelledby="category-heading"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            Koleksiyonlar
          </span>
          <h2 id="category-heading" className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Kategoriye Göz At
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Doğal lezzetleri keşfedin
          </p>
        </motion.div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-6">
          {/* Mobile: Scrollable Container */}
          <div className="flex md:contents gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-4 md:mx-0 md:px-0 md:pb-0">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[85vw] md:w-auto snap-center md:snap-none"
              >
                <Link
                  href={`/koleksiyon/${cat.slug}`}
                  className="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 md:hover:-translate-y-1"
                  aria-label={`${cat.name} kategorisini incele`}
                >
                  {/* Image Container - Mobile: 16:9 | Desktop: 4:3 */}
                  <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden">
                    <Image
                      src={imageErrors[cat.id] ? "/placeholder.svg" : (cat.image || "/placeholder.svg")}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => handleImageError(cat.id)}
                      unoptimized
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Product Count Badge - Shows on hover desktop, always on mobile */}
                    {cat.productCount !== undefined && cat.productCount > 0 && (
                      <div className="absolute top-3 right-3 md:top-4 md:right-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-900 shadow-lg">
                          {cat.productCount} ürün
                        </span>
                      </div>
                    )}

                    {/* Mobile CTA Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 md:hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white drop-shadow-lg">
                          {cat.name}
                        </h3>
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 shadow-lg">
                          <ArrowRight size={18} />
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content - Desktop Only (Mobile content is in overlay) */}
                  <div className="hidden md:block p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        {cat.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0">
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
          {categories.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === 0 ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* View All Link - Mobile */}
        <div className="flex md:hidden justify-center mt-6">
          <Link
            href="/koleksiyon"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-900 font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Tüm Kategoriler
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
