"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

interface ProductVariant {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
}

export function HeroProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, slug, category, images, rating, review_count, variants(id, name, price, original_price, stock)")
          .eq("status", "active")
          .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, 4);
          setProducts(selected);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const variant = product.variants[0];
    if (variant && variant.stock > 0) {
      addToCart(product, variant, 1);
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Öne Çıkan Ürünler
          </h2>
          <p className="text-gray-500">
            Size özel seçilmiş ürünler
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const variant = product.variants[0];
            const isOutOfStock = !variant || variant.stock === 0;
            const originalPrice = variant?.originalPrice || variant?.price;
            const hasDiscount = variant?.originalPrice
              ? variant.originalPrice > variant.price
              : false;
            const discountPercent = hasDiscount
              ? Math.round(((originalPrice - variant.price) / originalPrice) * 100)
              : 0;

            return (
              <Link
                key={product.id}
                href={`/urun/${product.slug}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {product.category === "fistik-ezmesi" && "🥜"}
                      {product.category === "findik-ezmesi" && "🌰"}
                      {product.category === "kuruyemis" && "🥔"}
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-full">
                        Stok Tükendi
                      </span>
                    </div>
                  )}

                  {hasDiscount && !isOutOfStock && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      %{discountPercent} İndirim
                    </span>
                  )}

                  {!isOutOfStock && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="absolute bottom-2 left-2 right-2 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:shadow-xl"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="md:hidden">Ekle</span>
                      <span className="hidden md:inline">Sepete Ekle</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-1 capitalize font-medium">
                  {product.category.replace("-", " ")}
                </p>

                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(product.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    ({product.reviewCount || 0})
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-primary">
                    {formatPrice(variant?.price || 0)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Tüm Ürünleri Gör
          </Link>
        </div>
      </div>
    </div>
  );
}
