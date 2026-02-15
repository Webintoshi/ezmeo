"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useQuickView } from "@/components/product/QuickViewProvider";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, index = 0, viewMode = "grid" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { setQuickViewProduct } = useQuickView();
  const isWishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);

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
    setQuickViewProduct(product);
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

  // Rating Stars - Sade tasarım
  const RatingStars = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3 h-3",
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-100 text-gray-200"
            )}
          />
        ))}
      </div>
      {count > 0 && (
        <span className="text-[11px] text-gray-400">
          ({count})
        </span>
      )}
    </div>
  );

  // Sade Badge'ler - Daha az göze çarpan, doğal
  const ProductBadges = () => (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
      {isOutOfStock ? (
        <span className="px-2.5 py-1 bg-gray-800/80 text-white text-[10px] rounded-md">
          Stok Yok
        </span>
      ) : (
        <>
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-primary text-white text-[10px] rounded-md">
              %{discountPercent} İndirim
            </span>
          )}
          {product.new && !hasDiscount && (
            <span className="px-2.5 py-1 bg-stone-600 text-white text-[10px] rounded-md">
              Yeni
            </span>
          )}
        </>
      )}
    </div>
  );

  if (viewMode === "list") {
    return (
      <Link
        href={ROUTES.product(product.slug)}
        className="group block"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="relative bg-white rounded-xl overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-300">
          <div className="flex">
            {/* Image */}
            <div className="relative w-36 sm:w-44 flex-shrink-0 bg-stone-50 overflow-hidden">
              <div className="aspect-square">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="176px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {product.category === "fistik-ezmesi" && "🥜"}
                    {product.category === "findik-ezmesi" && "🌰"}
                    {product.category === "kuruyemis" && "🥔"}
                  </div>
                )}
              </div>
              <ProductBadges />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-1">
                  {product.category.replace("-", " ")}
                </p>
                <h3 className="font-semibold text-gray-900 mb-1.5 text-base leading-tight">
                  {product.name}
                </h3>
                <RatingStars rating={product.rating} count={product.reviewCount || 0} />
                <p className="text-sm text-gray-500 line-clamp-2 mt-2 hidden sm:block">
                  {product.shortDescription || product.description}
                </p>
              </div>

              <div className="flex items-end justify-between mt-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-primary">
                      {formatPrice(displayVariant.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {displayVariant.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlist}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 transition-colors",
                      isWishlisted ? "text-rose-500 border-rose-200 bg-rose-50" : "text-gray-400 hover:text-rose-500"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isWishlisted && "fill-rose-500")} />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isOutOfStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90"
                    )}
                  >
                    {isOutOfStock ? "Stok Yok" : "Sepete Ekle"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // GRID VIEW - Sade, Doğal Tasarım
  return (
    <Link
      href={ROUTES.product(product.slug)}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-xl overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all duration-300">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-stone-50">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={index < 4}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {product.category === "fistik-ezmesi" && "🥜"}
              {product.category === "findik-ezmesi" && "🌰"}
              {product.category === "kuruyemis" && "🥔"}
            </div>
          )}

          {/* Badges */}
          <ProductBadges />

          {/* Wishlist - Sade */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200",
              isWishlisted 
                ? "bg-rose-50 border-rose-200 text-rose-500" 
                : "bg-white/90 border-stone-200 text-gray-400 hover:text-rose-500",
              "md:opacity-0 md:group-hover:opacity-100",
              "opacity-100"
            )}
            aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-rose-500")} />
          </button>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md">
                Stok Tükendi
              </span>
            </div>
          )}
        </div>

        {/* Content - Sade ve Düzenli */}
        <div className="p-3">
          {/* Category */}
          <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-1">
            {product.category.replace("-", " ")}
          </p>

          {/* Name */}
          <h3 className="font-medium text-gray-900 mb-1.5 text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mb-2">
            <RatingStars rating={product.rating} count={product.reviewCount || 0} />
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-semibold text-primary">
                  {formatPrice(displayVariant.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Sepete Ekle Butonu - Sade */}
            {!isOutOfStock && (
              <button
                onClick={handleAddToCart}
                className="flex-shrink-0 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
                aria-label="Sepete ekle"
              >
                Sepete Ekle
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
