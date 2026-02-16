"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  Truck,
  Shield,
  ChevronDown,
  Check,
  ArrowLeft,
  Leaf,
  Award,
  Sparkles,
  ChefHat,
  Package,
  Info,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { ImageGallery } from "@/components/product/ImageGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { NutritionLabel } from "@/components/product/NutritionLabel";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ComplementaryProducts } from "@/components/product/ComplementaryProducts";
import { MobileStickyBar } from "@/components/product/MobileStickyBar";
import { Product } from "@/types/product";

// Lazy load ProductCard
const ProductCard = React.lazy(() =>
  import("@/components/product/ProductCard").then((mod) => ({
    default: mod.ProductCard,
  }))
);
import React from "react";

type TabType = "features" | "nutrition" | "reviews";

interface ProductDetailClientProps {
  slug: string;
  initialProduct: Product | null;
  initialRelatedProducts?: Product[];
  initialVariantIndex?: number;
}

// Trust Badge Component
function TrustBadge({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-[#7B1113]/10">
      <div className="w-10 h-10 rounded-lg bg-[#7B1113]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#7B1113]" />
      </div>
      <div>
        <p className="font-medium text-[#7B1113] text-sm">{title}</p>
        <p className="text-xs text-[#6b4b4c] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// Ingredient Card Component
function IngredientCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex-shrink-0 w-[160px] p-4 rounded-2xl bg-white border border-[#7B1113]/10 shadow-sm"
    >
      <div className="w-12 h-12 rounded-xl bg-[#F3E0E1] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-[#7B1113]" />
      </div>
      <h4 className="font-medium text-[#7B1113] text-sm mb-1">{title}</h4>
      <p className="text-xs text-[#6b4b4c] leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Recipe Card Component
function RecipeCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      <div className="aspect-[4/3] rounded-2xl bg-[#F3E0E1] mb-3 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-[#7B1113]/30" />
          </div>
        )}
      </div>
      <h4 className="font-medium text-[#7B1113] mb-1">{title}</h4>
      <p className="text-sm text-[#6b4b4c]">{description}</p>
    </motion.div>
  );
}

export function ProductDetailClient({
  slug,
  initialProduct,
  initialRelatedProducts = [],
  initialVariantIndex = 0,
}: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(
    initialRelatedProducts
  );
  const [complementaryProducts, setComplementaryProducts] = useState<Product[]>(
    []
  );
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
        .then((res) => res.json())
        .then((data) => {
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F5]">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-[#F3E0E1] rounded mb-4" />
          <div className="h-4 w-32 bg-[#F3E0E1] rounded" />
        </div>
      </div>
    );
  }

  const variants = product.variants || [];
  const variant = variants[selectedVariant] || variants[0];

  if (!variant) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#FFF5F5]">
        <div className="text-center">
          <p className="text-[#6b4b4c]">Ürün bilgisi yüklenemedi.</p>
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
    setQuantity((prev) =>
      Math.max(1, Math.min(variant.stock || 10, prev + delta))
    );
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
    if (variant.stock <= 5)
      return { text: `Son ${variant.stock} adet`, color: "text-amber-600" };
    return { text: "Stokta var", color: "text-green-600" };
  };

  const stockStatus = getStockStatus();

  // Sample ingredients data (can be moved to product type)
  const ingredients = [
    { title: "Antep Fıstığı", description: "Gaziantep'ten özenle seçilmiş", icon: Award },
    { title: "Doğal", description: "Katkı maddesi içermez", icon: Leaf },
    { title: "Taze", description: "Günlük üretim", icon: Sparkles },
    { title: "Sağlıklı", description: "Protein ve lif kaynağı", icon: BadgeCheck },
  ];

  // Sample recipes data
  const recipes = [
    { title: "Kahvaltı Kasesi", description: "Yoğurt, granola ve ezme ile güne enerjik başlayın" },
    { title: "Smoothie Bowl", description: "Meyve ve ezme karışımı sağlıklı bir öğün" },
    { title: "Protein Topları", description: "Yulaf, ezme ve bal ile pratik atıştırmalık" },
  ];

  return (
    <div className="min-h-screen bg-[#FFF5F5]">
      {/* Back Navigation - Modern */}
      <div className="border-b border-[#7B1113]/10 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <Link
              href="/urunler"
              className="flex items-center gap-2 text-sm text-[#6b4b4c] hover:text-[#7B1113] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#F3E0E1] flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Tüm Ürünlere Dön</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-[#6b4b4c] ml-auto">
              <Link href="/" className="hover:text-[#7B1113]">Ana Sayfa</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/urunler" className="hover:text-[#7B1113]">Ürünler</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#7B1113] font-medium truncate max-w-[150px]">
                {product.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Image Gallery - UNCHANGED */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Right: Product Info - Modern Redesign */}
            <div className="space-y-6">
              {/* Brand & Category Badge */}
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-[#7B1113] text-white text-sm font-medium">
                  {product.brand || "Ezmeo"}
                </span>
                {product.category && (
                  <span className="text-sm text-[#6b4b4c]">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Title & Rating */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-semibold text-[#7B1113] leading-tight mb-4">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[#7B1113] font-medium">{product.rating || 0}</span>
                  <span className="text-[#6b4b4c]">
                    ({product.reviewCount || 0} değerlendirme)
                  </span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-[#6b4b4c] text-lg leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.new && (
                  <span className="px-4 py-2 bg-[#7B1113] text-white text-sm font-medium rounded-full">
                    ✨ Yeni
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full">
                    %{discountPercent} İndirim
                  </span>
                )}
                {product.sugarFree && (
                  <span className="px-4 py-2 bg-[#F3E0E1] text-[#7B1113] text-sm font-medium rounded-full">
                    Şekersiz
                  </span>
                )}
                {product.vegan && (
                  <span className="px-4 py-2 bg-[#F3E0E1] text-[#7B1113] text-sm font-medium rounded-full">
                    Vegan
                  </span>
                )}
                {product.glutenFree && (
                  <span className="px-4 py-2 bg-[#F3E0E1] text-[#7B1113] text-sm font-medium rounded-full">
                    Glutensiz
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-gray-400' : variant.stock <= 5 ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span className={`text-sm font-medium ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#7B1113]/10" />

              {/* Variant Selector */}
              <VariantSelector
                variants={variants}
                selectedIndex={selectedVariant}
                onSelect={setSelectedVariant}
              />

              {/* Divider */}
              <div className="h-px bg-[#7B1113]/10" />

              {/* Price & Quantity Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#7B1113]/10">
                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-[#7B1113]">
                    {variant.price} ₺
                  </span>
                  {variant.originalPrice && (
                    <span className="text-xl text-[#6b4b4c] line-through">
                      {variant.originalPrice} ₺
                    </span>
                  )}
                </div>
                
                {/* Unit Price */}
                <p className="text-sm text-[#6b4b4c] mb-6">
                  {(variant.price / (variant.weight / 100)).toFixed(2)} ₺ / 100g
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-[#7B1113]">Adet</span>
                  <div className="flex items-center bg-[#F3E0E1] rounded-full">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#7B1113]/10 disabled:opacity-50 transition-colors"
                    >
                      <Minus className="w-5 h-5 text-[#7B1113]" />
                    </button>
                    <span className="w-12 text-center font-semibold text-[#7B1113] text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (variant.stock || 10)}
                      className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#7B1113]/10 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-[#7B1113]" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`
                      flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg
                      transition-all duration-300
                      ${isOutOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#7B1113] text-white hover:bg-[#5d0e0f] active:scale-[0.98] shadow-lg shadow-[#7B1113]/25"
                      }
                    `}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {isOutOfStock ? "Tükendi" : "Sepete Ekle"}
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`
                      w-16 h-16 flex items-center justify-center rounded-xl border-2 transition-all
                      ${isWishlisted
                        ? "bg-red-50 border-red-300 text-red-500"
                        : "border-[#7B1113]/20 text-[#7B1113] hover:border-[#7B1113]/40 bg-white"
                      }
                    `}
                  >
                    <Heart className={`h-6 w-6 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-16 h-16 flex items-center justify-center rounded-xl border-2 border-[#7B1113]/20 text-[#7B1113] hover:border-[#7B1113]/40 bg-white transition-all"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Trust Badges - Modern Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TrustBadge
                  icon={Truck}
                  title="Ücretsiz Kargo"
                  description="500₺ ve üzeri siparişlerde"
                />
                <TrustBadge
                  icon={Shield}
                  title="Güvenli Alışveriş"
                  description="14 gün koşulsuz iade"
                />
                <TrustBadge
                  icon={Package}
                  title="Özenli Paketleme"
                  description="Kırılmaya karşı koruma"
                />
                <TrustBadge
                  icon={BadgeCheck}
                  title="Kalite Garantisi"
                  description="%100 doğal içerik"
                />
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-[#6b4b4c]">
                  Ürün Kodu: <span className="font-mono">{product.sku}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients & Highlights Section */}
      <section className="py-12 bg-white border-y border-[#7B1113]/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-[#7B1113] mb-8 text-center">
            İçindekiler & Özellikler
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {ingredients.map((ing, idx) => (
              <IngredientCard key={idx} {...ing} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Product Description */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[#7B1113] font-medium mb-2 block">
                  Neden Ezmeo?
                </span>
                <h2 className="text-3xl font-semibold text-[#7B1113] mb-6">
                  Doğallığın Tadını Çıkarın
                </h2>
                <div className="prose prose-lg text-[#6b4b4c] space-y-4">
                  <p>
                    Ezmeo olarak, Anadolu'nun en kaliteli fıstıklarını ve kuruyemişlerini 
                    sizlerle buluşturuyoruz. Her kavanoz, Gaziantep'in bereketli topraklarından 
                    gelen taze fıstıkların özenle seçilmesiyle başlar.
                  </p>
                  <p>
                    Üretim sürecimizde katkı maddesi, koruyucu veya şeker kullanmıyoruz. 
                    Sadece %100 doğal içeriklerle, besleyici ve lezzetli ürünler sunuyoruz.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="mt-8 space-y-3">
                  {[
                    "Katlı maddesi içermez",
                    "Günlük taze üretim",
                    "Gaziantep menşeli fıstık",
                    "Cam kavanozda hijyenik paketleme",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#7B1113] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[#7B1113]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Visual Placeholder - Can be replaced with lifestyle image */}
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-[#F3E0E1] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#7B1113]/10 flex items-center justify-center">
                      <Leaf className="w-12 h-12 text-[#7B1113]" />
                    </div>
                    <p className="text-[#7B1113] font-medium text-lg">
                      100% Doğal
                    </p>
                    <p className="text-[#6b4b4c] mt-2">
                      Anadolu'nun saf lezzeti
                    </p>
                  </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 bg-[#7B1113] text-white px-6 py-3 rounded-2xl shadow-xl">
                  <p className="font-bold text-lg">100%</p>
                  <p className="text-sm opacity-90">Doğal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Suggestions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#7B1113] mb-4">
              Kullanım Önerileri
            </h2>
            <p className="text-[#6b4b4c] max-w-2xl mx-auto">
              Ezmeo ürünlerini mutfağınızda birçok farklı şekilde kullanabilirsiniz. 
              İşte size ilham verecek öneriler:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {recipes.map((recipe, idx) => (
              <RecipeCard key={idx} {...recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Section - Modern */}
      <section className="py-16 bg-[#FFF5F5]">
        <div className="container mx-auto px-4">
          {/* Tab Navigation - Pills */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white rounded-full p-1.5 border border-[#7B1113]/10 shadow-sm">
              {[
                { id: "features", label: "Ürün Detayları" },
                { id: "nutrition", label: "Besin Değerleri" },
                { id: "reviews", label: "Yorumlar" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${activeTab === tab.id
                      ? "bg-[#7B1113] text-white shadow-md"
                      : "text-[#6b4b4c] hover:text-[#7B1113]"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === "features" && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProductFeatures product={product} />
                </motion.div>
              )}
              {activeTab === "nutrition" && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <NutritionLabel product={product} />
                </motion.div>
              )}
              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-16 bg-white rounded-3xl border border-[#7B1113]/10"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F3E0E1] flex items-center justify-center">
                    <Star className="w-10 h-10 text-[#7B1113]" />
                  </div>
                  <p className="text-xl font-medium text-[#7B1113] mb-2">
                    Henüz Değerlendirme Yok
                  </p>
                  <p className="text-[#6b4b4c] max-w-md mx-auto">
                    Bu ürünü denediniz mi? İlk değerlendiren siz olun ve deneyiminizi paylaşın.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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
      <section className="py-16 bg-white border-t border-[#7B1113]/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-[#7B1113]">
              Benzer Ürünler
            </h2>
            <Link
              href="/urunler"
              className="flex items-center gap-2 text-[#7B1113] font-medium hover:gap-3 transition-all"
            >
              Tümünü Gör
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          {isLoadingRelated ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-[#F3E0E1] rounded-2xl animate-pulse"
                />
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
