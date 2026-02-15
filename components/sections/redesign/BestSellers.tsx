"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { getAllProducts } from "@/lib/products";
import { ROUTES } from "@/lib/constants";
import { ProductCard } from "@/components/product/ProductCard";
import { Grid3X3, List, Loader2, Package, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 8;

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
      <section className="py-12 md:py-20 bg-gray-50/50" id="best-sellers">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="aspect-[4/5] sm:aspect-square bg-gray-100" />
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 sm:h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 sm:h-6 bg-gray-100 rounded w-16 sm:w-20" />
                    <div className="h-9 sm:h-11 w-9 sm:w-11 bg-gray-100 rounded-full" />
                  </div>
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
      <section className="py-12 md:py-20 bg-gray-50/50" id="best-sellers">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ürünler</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-100">
            <Package className="w-16 h-16 text-gray-200 mb-4" />
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
    <section className="py-10 md:py-20 bg-gray-50/50" id="best-sellers">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Öne Çıkanlar
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Ürünler
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-white rounded-xl p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-gray-100 text-primary shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                )}
                aria-label="Grid görünümü"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-gray-100 text-primary shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                )}
                aria-label="Liste görünümü"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Link 
              href={ROUTES.products} 
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              Tümünü Gör
              <span className="text-lg">→</span>
            </Link>
          </div>
        </motion.div>

        {/* Products Grid/List */}
        <div className={cn(
          viewMode === "list" 
            ? "flex flex-col gap-4" 
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        )}>
          {displayedProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-8 md:mt-10">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 sm:px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
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

        {!hasMore && products.length > 0 && (
          <p className="text-center text-gray-400 mt-8 text-sm">
            Tüm ürünler gösterildi ({products.length} ürün)
          </p>
        )}

        {/* Mobile: View All Button */}
        <div className="flex sm:hidden justify-center mt-6">
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Tüm Ürünleri Gör
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

import { cn } from "@/lib/utils";
