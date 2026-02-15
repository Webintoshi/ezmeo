"use client";

import Link from "next/link";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, index = 0, onQuickView, viewMode = "grid" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const displayVariant = product.variants[0];
  const isOutOfStock = displayVariant?.stock === 0;
  const originalPrice = displayVariant?.originalPrice || displayVariant?.price;
  const hasDiscount = displayVariant?.originalPrice
    ? displayVariant.originalPrice > displayVariant.price
    : false;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - displayVariant.price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, displayVariant, 1);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (viewMode === "list") {
    return (
      <Link
        href={ROUTES.product(product.slug)}
        className="group block"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="relative bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 hover:border-primary/30">
          <div className="flex">
            <div className="relative w-48 h-48 flex-shrink-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
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
            </div>

            <div className="flex-1 p-5 flex flex-col bg-white/50 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1 capitalize font-medium">
                    {product.category.replace("-", " ")}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.shortDescription || product.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={handleWishlist}
                    className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-auto flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(displayVariant.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {displayVariant.name} seçenekleriyle
                  </p>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300",
                    isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-95"
                  )}
                  aria-label="Sepete ekle"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isOutOfStock ? "Stok Yok" : "Sepete Ekle"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={ROUTES.product(product.slug)}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/40 hover:border-primary/30 h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50/50 to-gray-100/50">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">
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

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.new && !isOutOfStock && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                Yeni
              </span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                %{discountPercent} İndirim
              </span>
            )}
            {product.sugarFree && !isOutOfStock && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                Şekersiz
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                )}
              />
            </button>
            <button
              onClick={handleQuickView}
              className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              aria-label="Hızlı görüntüle"
            >
              <Eye className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
          <p className="text-xs text-gray-500 mb-1.5 capitalize font-medium">
            {product.category.replace("-", " ")}
          </p>

          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg leading-tight">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">
                {formatPrice(displayVariant.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {displayVariant.name} seçenekleriyle
            </p>
          </div>

          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:shadow-xl active:scale-95 transition-all"
              aria-label="Sepete ekle"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sepete Ekle</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
