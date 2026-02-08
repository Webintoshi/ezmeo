"use client";

import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  // İlk varyasyonu göster (veya en ucuz olanı)
  const displayVariant = product.variants[0];
  const originalPrice = displayVariant.originalPrice || displayVariant.price;
  const hasDiscount = displayVariant.originalPrice
    ? displayVariant.originalPrice > displayVariant.price
    : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, displayVariant, 1);
  };

  return (
    <Link
      href={ROUTES.product(product.slug)}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-white">
          {/* Product Image */}
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 text-6xl">
              {product.category === "fistik-ezmesi" && "🥜"}
              {product.category === "findik-ezmesi" && "🌰"}
              {product.category === "kuruyemis" && "🥔"}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.new && (
              <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">
                Yeni
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                İndirim
              </span>
            )}
            {product.sugarFree && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Şekersiz
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (isWishlisted) {
                removeFromWishlist(product.id);
              } else {
                addToWishlist(product);
              }
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white transition-colors shadow-sm"
            aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart
              className={`h-4 w-4 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-muted"
              }`}
            />
          </button>

          {/* Quick Add Button - Show on Hover */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 left-3 right-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center justify-center gap-2"
            aria-label="Sepete ekle"
          >
            <ShoppingCart className="h-4 w-4" />
            Sepete Ekle
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          <p className="text-xs text-muted mb-1 capitalize">
            {product.category.replace("-", " ")}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-primary mb-2 line-clamp-2 flex-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(displayVariant.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Weight Info */}
          <p className="text-xs text-muted mt-1">
            {displayVariant.name} seçenekleriyle
          </p>
        </div>
      </div>
    </Link>
  );
}
