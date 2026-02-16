"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { getAllProducts } from "@/lib/products";
import { ROUTES } from "@/lib/constants";
import { ProductCard } from "@/components/product/ProductCard";
import { Loader2, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 8;

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const displayedProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, products.length));
      setIsLoadingMore(false);
    }, 500);
  }, [hasMore, isLoadingMore, products.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        hasMore &&
        !isLoadingMore
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleLoadMore, hasMore, isLoadingMore]);

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-white" id="best-sellers">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-40 bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-stone-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse"
              >
                <div className="aspect-square bg-stone-100" />
                <div className="p-4 bg-stone-50 space-y-3">
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                  <div className="h-10 bg-stone-200 rounded w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 md:py-20 bg-white" id="best-sellers">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ürünler</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center bg-stone-50 rounded-3xl border border-stone-100">
            <Package className="w-16 h-16 text-stone-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-400">Şu anda gösterilecek ürün bulunmuyor.</p>
            <Link
              href={ROUTES.products}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-20 bg-white" id="best-sellers">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Ürünler
            </h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Doğal ve sağlıklı lezzetler
            </p>
          </div>
          
          {/* View All Link */}
          <Link 
            href={ROUTES.products} 
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Products Grid - Responsive Gap */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {displayedProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
            />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-10 md:mt-12">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-stone-100 text-gray-700 rounded-full font-medium hover:bg-stone-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Daha Fazla Ürün"
              )}
            </button>
          </div>
        )}



        {/* Mobile: View All Button */}
        <div className="flex sm:hidden justify-center mt-8">
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
