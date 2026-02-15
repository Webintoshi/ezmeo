"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Eye, Plus, Minus } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useQuickView } from "@/components/product/QuickViewProvider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

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

  // Modern Rating Stars Component
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
      <span className="text-[11px] text-gray-400 font-medium">
        ({count || 0})
      </span>
    </div>
  );

  // Badges Component
  const ProductBadges = () => (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
      {isOutOfStock ? (
        <span className="px-2.5 py-1 bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
          Stok Yok
        </span>
      ) : (
        <>
          {product.new && (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              Yeni
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              %{discountPercent}
            </span>
          )}
          {product.sugarFree && (
            <span className="px-2.5 py-1 bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              Şekersiz
            </span>
          )}
          {product.organic && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              Organik
            </span>
          )}
        </>
      )}
    </div>
  );

  // Action Buttons Component
  const ActionButtons = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        onClick={handleWishlist}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95",
          isWishlisted 
            ? "bg-rose-50 text-rose-500" 
            : "bg-white text-gray-600 hover:text-rose-500"
        )}
        aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-colors",
            isWishlisted && "fill-rose-500"
          )}
        />
      </button>
      <button
        onClick={handleQuickView}
        className="w-9 h-9 rounded-full bg-white text-gray-600 flex items-center justify-center shadow-lg hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Hızlı görüntüle"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );

  if (viewMode === "list") {
    return (
      <Link
        href={ROUTES.product(product.slug)}
        className="group block"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="flex">
            {/* Image */}
            <div className="relative w-40 sm:w-48 flex-shrink-0 bg-gray-50 overflow-hidden">
              <div className="aspect-square">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="192px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {product.category === "fistik-ezmesi" && "🥜"}
                    {product.category === "findik-ezmesi" && "🌰"}
                    {product.category === "kuruyemis" && "🥔"}
                  </div>
                )}
              </div>
              <ProductBadges />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-1">
                  {product.category.replace("-", " ")}
                </p>
                <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg leading-tight line-clamp-1">
                  {product.name}
                </h3>
                <RatingStars rating={product.rating} count={product.reviewCount || 0} />
                <p className="text-sm text-gray-500 line-clamp-2 mt-2 hidden sm:block">
                  {product.shortDescription || product.description}
                </p>
              </div>

              <div className="flex items-end justify-between mt-3 sm:mt-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-primary">
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
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isWishlisted ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", isWishlisted && "fill-rose-500")} />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={cn(
                      "px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-200",
                      isOutOfStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-95"
                    )}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">{isOutOfStock ? "Stok Yok" : "Sepete Ekle"}</span>
                    <span className="sm:hidden">{isOutOfStock ? "Yok" : "Ekle"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // GRID VIEW - Modern Premium Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={ROUTES.product(product.slug)}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
          
          {/* Image Container */}
          <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-gray-50">
            {product.images && product.images.length > 0 ? (
              <>
                {/* Primary Image */}
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className={cn(
                    "object-cover transition-all duration-700 ease-out",
                    isHovered && product.images[1] ? "opacity-0 scale-105" : "opacity-100 scale-100"
                  )}
                  priority={index < 4}
                />
                {/* Secondary Image on Hover (if exists) */}
                {product.images[1] && (
                  <Image
                    src={product.images[1]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className={cn(
                      "object-cover transition-all duration-700 ease-out absolute inset-0",
                      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {product.category === "fistik-ezmesi" && "🥜"}
                {product.category === "findik-ezmesi" && "🌰"}
                {product.category === "kuruyemis" && "🥔"}
              </div>
            )}

            {/* Badges */}
            <ProductBadges />

            {/* Wishlist Button - Always visible on mobile, hover on desktop */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleWishlist}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200",
                  isWishlisted 
                    ? "bg-rose-50 text-rose-500" 
                    : "bg-white/90 backdrop-blur-sm text-gray-500 hover:text-rose-500",
                  "md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0",
                  "opacity-100 translate-y-0"
                )}
                aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isWishlisted && "fill-rose-500"
                  )}
                />
              </button>
            </div>

            {/* Quick View - Desktop only */}
            <div className="absolute inset-x-0 bottom-0 p-3 hidden md:block">
              <button
                onClick={handleQuickView}
                className="w-full py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-medium rounded-xl shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
              >
                Hızlı Görüntüle
              </button>
            </div>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg">
                  Stok Tükendi
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col">
            {/* Category */}
            <p className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-1">
              {product.category.replace("-", " ")}
            </p>

            {/* Name */}
            <h3 className="font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="mb-2 sm:mb-3">
              <RatingStars rating={product.rating} count={product.reviewCount || 0} />
            </div>

            {/* Price & CTA Row */}
            <div className="mt-auto flex items-center justify-between gap-2">
              {/* Price */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl font-bold text-primary">
                    {formatPrice(displayVariant.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs sm:text-sm text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 hidden sm:block">
                  {displayVariant.name}
                </p>
              </div>

              {/* Add to Cart Button */}
              {!isOutOfStock && (
                <button
                  onClick={handleAddToCart}
                  className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                  aria-label="Sepete ekle"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
