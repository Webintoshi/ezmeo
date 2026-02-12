"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { Star, ArrowRight, Flame, Sparkles, TrendingUp, Filter, X, ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import Link from "next/link";

function transformProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || "",
    shortDescription: dbProduct.short_description || "",
    category: dbProduct.category || "fistik-ezmesi",
    subcategory: dbProduct.subcategory || "klasik",
    images: dbProduct.images || [],
    tags: dbProduct.tags || [],
    variants: dbProduct.variants?.map((v: any) => ({
      id: v.id,
      name: v.name,
      weight: v.weight ? parseInt(v.weight) : 250,
      price: Number(v.price),
      originalPrice: v.original_price ? Number(v.original_price) : undefined,
      stock: v.stock,
      sku: v.sku || "",
    })) || [],
    vegan: dbProduct.vegan,
    glutenFree: dbProduct.gluten_free,
    sugarFree: dbProduct.sugar_free,
    highProtein: dbProduct.high_protein,
    rating: Number(dbProduct.rating) || 5,
    reviewCount: dbProduct.review_count || 0,
    featured: dbProduct.is_featured,
    new: dbProduct.is_new,
    seoTitle: dbProduct.seo_title || undefined,
    seoDescription: dbProduct.seo_description || undefined,
  };
}

interface ProductShowcaseProps {
  onQuickView?: (product: Product) => void;
}

type TabType = "bestsellers" | "new" | "discounted";

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "bestsellers", label: "Çok Satanlar", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "new", label: "Yeni Gelenler", icon: <Sparkles className="w-4 h-4" /> },
  { id: "discounted", label: "İndirimli", icon: <Flame className="w-4 h-4" /> },
];

function ProductCard({ product, index, onQuickView }: { product: Product; index: number; onQuickView?: (product: Product) => void }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const displayVariant = product.variants[0];
  const originalPrice = displayVariant.originalPrice || displayVariant.price;
  const hasDiscount = displayVariant.originalPrice ? displayVariant.originalPrice > displayVariant.price : false;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - displayVariant.price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, displayVariant, 1);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={ROUTES.product(product.slug)} className="group block">
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary/20 h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
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

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.new && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  Yeni
                </span>
              )}
              {hasDiscount && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  %{discountPercent} İndirim
                </span>
              )}
              {product.sugarFree && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  Şekersiz
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <button
                onClick={handleWishlist}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label={isWishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
              >
                <Heart className={cn("w-5 h-5 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </button>
              <button
                onClick={handleQuickView}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                aria-label="Hızlı görüntüle"
              >
                <Eye className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-3 left-3 right-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:shadow-xl active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Sepete Ekle
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
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
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
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
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>("bestsellers");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let query = supabase
          .from("products")
          .select(`*, variants:product_variants(*)`)
          .eq("is_active", true);

        switch (activeTab) {
          case "bestsellers":
            query = query.eq("is_featured", true);
            break;
          case "new":
            query = query.eq("is_new", true);
            break;
          case "discounted":
            query = query.filter("variants.original_price", "gt", "variants.price");
            break;
        }

        const { data, error } = await query.limit(8);

        if (error) {
          console.error("Supabase error:", error);
          return;
        }

        if (data) {
          const transformed = data.map(transformProduct);
          
          if (activeTab === "discounted") {
            const filtered = transformed.filter(p => 
              p.variants.some(v => v.originalPrice && v.originalPrice > v.price)
            );
            setProducts(filtered);
          } else {
            setProducts(transformed);
          }
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeTab]);

  if (!loading && products.length === 0 && activeTab === "discounted") {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Ürünlerimiz</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Özenle Seçilmiş Lezzetler
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            En taze ve kaliteli ezmelerimizi keşfedin. Doğal malzemelerle hazırlanan özel tariflerimiz.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1.5 bg-gray-100 rounded-2xl">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onQuickView={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href={ROUTES.allProducts}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-square md:aspect-auto bg-gradient-to-br from-gray-50 to-gray-100">
                  {selectedProduct.images?.[0] ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-9xl">
                      {selectedProduct.category === "fistik-ezmesi" && "🥜"}
                      {selectedProduct.category === "findik-ezmesi" && "🌰"}
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col">
                  <p className="text-sm text-gray-500 mb-2 capitalize font-medium">
                    {selectedProduct.category.replace("-", " ")}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {selectedProduct.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(selectedProduct.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({selectedProduct.reviewCount || 0} yorum)</span>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {selectedProduct.shortDescription || selectedProduct.description}
                  </p>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(selectedProduct.variants[0]?.price || 0)}
                    </span>
                    {selectedProduct.variants[0]?.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(selectedProduct.variants[0].originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto space-y-4">
                    <button
                      onClick={() => {
                        addToCart(selectedProduct, selectedProduct.variants[0], 1);
                        setSelectedProduct(null);
                      }}
                      className="w-full py-4 bg-primary text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Sepete Ekle
                    </button>
                    <Link
                      href={ROUTES.product(selectedProduct.slug)}
                      onClick={() => setSelectedProduct(null)}
                      className="block w-full py-4 border-2 border-primary text-primary rounded-xl font-semibold text-center hover:bg-primary hover:text-white transition-all"
                    >
                      Ürün Detayını Gör
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
