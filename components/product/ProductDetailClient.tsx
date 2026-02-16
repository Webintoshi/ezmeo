"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  ShoppingCart, Star, Heart, Share2, Minus, Plus,
  Truck, Shield, ChevronDown, Check, ArrowLeft
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { ImageGallery } from "@/components/product/ImageGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { NutritionLabel } from "@/components/product/NutritionLabel";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ComplementaryProducts } from "@/components/product/ComplementaryProducts";
import { MobileStickyBar } from "@/components/product/MobileStickyBar";
import { Product } from "@/types/product";

// Lazy load ProductCard
const ProductCard = React.lazy(() => import("@/components/product/ProductCard").then(mod => ({ default: mod.ProductCard })));
import React from "react";

type TabType = "features" | "nutrition" | "reviews";

interface ProductDetailClientProps {
  slug: string;
  initialProduct: Product | null;
  initialRelatedProducts?: Product[];
  initialVariantIndex?: number;
}

export function ProductDetailClient({
  slug,
  initialProduct,
  initialRelatedProducts = [],
  initialVariantIndex = 0
}: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);
  const [complementaryProducts, setComplementaryProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(initialVariantIndex);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>("features");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { addToCart } = useCart();

  // Load wishlist state
  useEffect(() => {
    if (typeof window !== "undefined" && product) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsWishlisted(wishlist.includes(product.id));
    }
  }, [product]);

  // Load related & complementary products
  useEffect(() => {
    if (product?.category) {
      setIsLoadingRelated(true);
      fetch(`/api/products?category=${product.category}&limit=8`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.products) {
            const filtered = data.products.filter((p: Product) => p.slug !== slug);
            setRelatedProducts(filtered.slice(0, 4));
            setComplementaryProducts(filtered.slice(4, 8));
          }
        })
        .finally(() => setIsLoadingRelated(false));
    }
  }, [product?.category, slug]);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-100 rounded mb-4" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const variants = product.variants || [];
  const variant = variants[selectedVariant] || variants[0];
  
  if (!variant) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">Ürün bilgisi yüklenemedi.</p>
        </div>
      </div>
    );
  }

  const discountPercent = variant.originalPrice
    ? Math.round((1 - variant.price / variant.originalPrice) * 100)
    : 0;

  const isOutOfStock = variant.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, variant, quantity);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(variant.stock || 10, prev + delta)));
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const newWishlist = isWishlisted
      ? wishlist.filter((id: string) => id !== product.id)
      : [...wishlist, product.id];
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setShowShareMenu(false);
  };

  // Stock status text
  const getStockStatus = () => {
    if (isOutOfStock) return { text: "Tükendi", color: "text-gray-400" };
    if (variant.stock <= 5) return { text: `Son ${variant.stock} adet`, color: "text-amber-600" };
    return { text: "Stokta var", color: "text-green-600" };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <Link 
              href="/urunler" 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tüm Ürünler
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-900 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Image Gallery - UNCHANGED */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Brand & Meta */}
              <div className="flex items-center gap-3 text-sm">
                {product.brand && (
                  <span className="font-medium text-gray-900">{product.brand}</span>
                )}
                {product.countryOfOrigin && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">{product.countryOfOrigin}</span>
                  </>
                )}
                <span className="text-gray-300">·</span>
                <span className={stockStatus.color}>{stockStatus.text}</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-medium text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating)
                          ? "fill-gray-900 text-gray-900"
                          : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.rating} ({product.reviewCount} değerlendirme)
                  </span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.new && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-900 text-xs font-medium rounded-full">
                    Yeni
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                    %{discountPercent} İndirim
                  </span>
                )}
                {product.sugarFree && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Şekersiz
                  </span>
                )}
                {product.vegan && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Vegan
                  </span>
                )}
                {product.glutenFree && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Glutensiz
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Variant Selector */}
              <VariantSelector
                variants={variants}
                selectedIndex={selectedVariant}
                onSelect={setSelectedVariant}
              />

              {/* Divider */}
              <div className="h-px bg-gray-100" />

              {/* Price & Quantity */}
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-medium text-gray-900">
                    {variant.price} ₺
                  </span>
                  {variant.originalPrice && (
                    <span className="text-lg text-gray-400 line-through mb-1">
                      {variant.originalPrice} ₺
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {(variant.price / (variant.weight / 100)).toFixed(2)} ₺ / 100g
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Adet</span>
                  <div className="flex items-center bg-gray-100 rounded-full">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (variant.stock || 10)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-medium
                    transition-all duration-200
                    ${isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                    }
                  `}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? "Tükendi" : "Sepete Ekle"}
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`
                    w-14 h-14 flex items-center justify-center rounded-full border-2 transition-all
                    ${isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }
                  `}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:border-gray-300 transition-all"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">500₺ üzeri ücretsiz kargo</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">14 gün koşulsuz iade</span>
                </div>
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-gray-400">
                  Ürün Kodu: {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="border-t border-gray-100">
        <div className="container mx-auto px-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: "features", label: "Özellikler" },
              { id: "nutrition", label: "Besin Değerleri" },
              { id: "reviews", label: "Yorumlar" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8 lg:py-12">
            {activeTab === "features" && <ProductFeatures product={product} />}
            {activeTab === "nutrition" && <NutritionLabel product={product} />}
            {activeTab === "reviews" && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <p className="text-gray-500">Henüz değerlendirme yok.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Complementary Products */}
      <ComplementaryProducts
        title="Bu Ürünle Birlikte Alınanlar"
        products={complementaryProducts}
        loading={isLoadingRelated}
      />

      {/* Related Products */}
      <section className="border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Benzer Ürünler</h2>
          {isLoadingRelated ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Suspense fallback={null}>
                {relatedProducts.map((p, index) => (
                  <ProductCard key={p.id} product={p} index={index} />
                ))}
              </Suspense>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sticky Bar */}
      <MobileStickyBar
        price={variant.price}
        originalPrice={variant.originalPrice}
        onAddToCart={handleAddToCart}
        isOutOfStock={isOutOfStock}
      />
    </div>
  );
}
