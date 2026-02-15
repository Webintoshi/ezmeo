"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import { ShoppingCart, Heart, Star, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  variants: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    stock: number;
  }[];
  rating?: number;
  reviewCount?: number;
  new?: boolean;
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from("products")
          .select("id, name, slug, images, rating, review_count, new, variants:product_variants(id, name, price, original_price, stock)")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    const variant = product.variants?.[0];
    if (!variant) return;

    setAddingToCart(product.id);
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            variantName: variant.name,
            price: variant.price,
            quantity: 1,
          }],
        }),
      });

      if (response.ok) {
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Ürünlerimiz</h2>
            <p className="text-gray-500 mt-1">En taze ve doğal lezzetler</p>
          </div>
          <Link 
            href={ROUTES.products} 
            className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const variant = product.variants?.[0];
            const hasDiscount = variant?.originalPrice && variant.originalPrice > variant.price;
            const discountPercent = hasDiscount 
              ? Math.round(((variant.originalPrice! - variant.price) / variant.originalPrice!) * 100)
              : 0;

            return (
              <div 
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link href={ROUTES.product(product.slug)}>
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-4xl">🥜</span>
                      </div>
                    )}
                    
                    {product.new && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                        YENİ
                      </span>
                    )}
                    
                    {hasDiscount && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                        %{discountPercent}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={ROUTES.product(product.slug)}>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem] group-hover:text-red-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {product.rating && product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-400">({product.reviewCount || 0})</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(variant?.price || 0)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(variant?.originalPrice || 0)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id || !variant || variant.stock <= 0}
                      className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === product.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link 
            href={ROUTES.products} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
