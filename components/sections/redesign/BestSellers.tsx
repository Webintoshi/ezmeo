"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { getAllProducts } from "@/lib/products";
import { ROUTES } from "@/lib/constants";
import { ProductCard } from "@/components/product/ProductCard";
import { Grid3X3, List, Loader2, Package } from "lucide-react";

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
        console.log("BestSellers - Products fetched:", data.length);
        console.log("BestSellers - First product:", data[0]);
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
      <section className="redesign-section" id="best-sellers">
        <div className="redesign-container">
          <div className="best-sellers__header">
            <h2 className="redesign-title">Ürünler</h2>
          </div>
          <div className="best-sellers__grid">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded w-full mt-4" />
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
      <section className="redesign-section" id="best-sellers">
        <div className="redesign-container">
          <div className="best-sellers__header">
            <h2 className="redesign-title">Ürünler</h2>
            <Link href={ROUTES.products} className="best-sellers__link">Tümünü Gör</Link>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Ürün Bulunamadı</h3>
            <p className="text-gray-500">Şu anda gösterilecek ürün bulunmuyor.</p>
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
    <section className="redesign-section" id="best-sellers">
      <div className="redesign-container">
        <div className="best-sellers__header">
          <h2 className="redesign-title">Ürünler</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Grid görünümü"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                aria-label="Liste görünümü"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Link href={ROUTES.products} className="best-sellers__link hidden sm:block">Tümünü Gör</Link>
          </div>
        </div>

        <div className={`best-sellers__grid ${viewMode === "list" ? "best-sellers__list" : ""}`}>
          {displayedProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              viewMode={viewMode}
            />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Daha Fazla Ürün Yükle"
              )}
            </button>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <p className="text-center text-gray-400 mt-8 text-sm">
            Tüm ürünler gösterildi ({products.length} ürün)
          </p>
        )}
      </div>
    </section>
  );
}
