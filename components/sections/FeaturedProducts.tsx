"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { useCart } from "@/lib/cart-context";
import { Product } from "@/types/product";
import { cn, formatPrice } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Plus, Check } from "lucide-react";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  variant: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    stock: number;
    weight: number;
    image?: string;
  };
  badge?: 'new' | 'discount' | 'bestseller';
  discount?: number;
}

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

const MAX_RETRY = 3;
const CACHE_TTL = 5 * 60 * 1000;

function transformToFeaturedProduct(product: Product): FeaturedProduct {
  const variant = product.variants?.[0];
  const hasDiscount = variant?.originalPrice && variant.originalPrice > variant.price;
  const discount = hasDiscount 
    ? Math.round(((variant.originalPrice! - variant.price) / variant.originalPrice!) * 100)
    : undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    images: product.images || [],
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    variant: {
      id: variant?.id || '',
      name: variant?.name || '',
      price: variant?.price || 0,
      originalPrice: variant?.originalPrice,
      stock: variant?.stock || 0,
      weight: variant?.weight || 0,
      image: variant?.image,
    },
    badge: product.new ? 'new' : hasDiscount ? 'discount' : product.isBestseller ? 'bestseller' : undefined,
    discount,
  };
}

function getCachedData(): FeaturedProduct[] | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem('ezmeo_featured_products');
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

function setCachedData(data: FeaturedProduct[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ezmeo_featured_products', JSON.stringify({
    data,
    timestamp: Date.now()
  }));
}

async function fetchBestsellers(limit: number): Promise<FeaturedProduct[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('status', 'active')
    .order('sales_count', { ascending: false })
    .limit(limit);

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch products');
  }

  return data.map(transformToFeaturedProduct);
}

async function fetchWithRetry(attempt: number = 0): Promise<{ heroProduct: FeaturedProduct; products: FeaturedProduct[] }> {
  try {
    const products = await fetchBestsellers(4);
    
    if (products.length === 0) {
      throw new Error('No products found');
    }

    const heroProduct = products[0];
    const miniProducts = products.slice(1, 4);

    setCachedData(products);

    return {
      heroProduct,
      products: miniProducts,
    };
  } catch (error) {
    if (attempt < MAX_RETRY - 1) {
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(attempt + 1);
    }
    throw error;
  }
}

function ProductBadge({ type, discount, position = 'hero' }: { type?: string; discount?: number; position?: 'hero' | 'mini' }) {
  if (!type) return null;

  const config: Record<string, { label: string; bgColor: string }> = {
    new: { label: 'Yeni', bgColor: 'bg-emerald-500' },
    discount: { label: discount ? `%${discount} İndirim` : 'İndirim', bgColor: 'bg-rose-500' },
    bestseller: { label: 'Çok Satan', bgColor: 'bg-amber-500' },
  };

  const { label, bgColor } = config[type] || config.new;
  
  const sizeClasses = position === 'hero' 
    ? 'px-3 py-1.5 text-xs font-bold rounded-full' 
    : 'px-2 py-0.5 text-[10px] font-bold rounded';

  return (
    <div className={cn(bgColor, 'text-white uppercase tracking-wider', sizeClasses)}>
      {label}
    </div>
  );
}

function HeroProductCard({ product, onAddToCart, isVisible }: { product: FeaturedProduct; onAddToCart: (p: FeaturedProduct) => void; isVisible: boolean }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  const imageSrc = product.variant.image || product.images[0] || '/placeholder.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Link href={ROUTES.product(product.slug)}>
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group h-full">
          {product.badge && (
            <div className="absolute top-4 left-4 z-20">
              <ProductBadge type={product.badge} discount={product.discount} position="hero" />
            </div>
          )}

          <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-lg line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl font-black text-white">
                {formatPrice(product.variant.price)}
              </span>
              {product.variant.originalPrice && (
                <span className="text-xl text-white/70 line-through">
                  {formatPrice(product.variant.originalPrice)}
                </span>
              )}
              {product.discount && (
                <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">
                  %{product.discount}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.variant.stock <= 0}
              className={cn(
                "w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300",
                product.variant.stock > 0
                  ? "bg-white text-gray-900 hover:bg-blue-600 hover:text-white active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {isAdding ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  {product.variant.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
                </>
              )}
            </button>
          </div>

          {product.rating > 0 && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-gray-900">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function ProductMiniCard({ product, index, onAddToCart, isVisible }: { product: FeaturedProduct; index: number; onAddToCart: (p: FeaturedProduct) => void; isVisible: boolean }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await onAddToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  const imageSrc = product.variant.image || product.images[0] || '/placeholder.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
    >
      <Link href={ROUTES.product(product.slug)}>
        <div className="flex bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
          <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="128px"
            />
            {product.badge && (
              <div className="absolute top-2 left-2">
                <ProductBadge type={product.badge} position="mini" />
              </div>
            )}
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm">
                {product.name}
              </h4>

              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-blue-600">
                  {formatPrice(product.variant.price)}
                </span>
                {product.variant.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.variant.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.variant.stock <= 0}
              className={cn(
                "self-start px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all duration-200",
                product.variant.stock > 0
                  ? "bg-gray-900 text-white hover:bg-blue-600 active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Ekle
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
      <div className="md:col-span-7">
        <div className="aspect-[3/4] bg-gray-200 rounded-3xl animate-pulse" />
      </div>
      <div className="md:col-span-5 flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function FeaturedProducts({
  title = "Çıtır Lezzetler",
  subtitle,
  badge = "ÖNE ÇIKANLAR",
  badgeColor = "primary",
  className
}: FeaturedProductsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [heroProduct, setHeroProduct] = useState<FeaturedProduct | null>(null);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { addToCart } = useCart();

  const hasProducts = useMemo(() => 
    heroProduct !== null || products.length > 0 
  , [heroProduct, products]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const cached = getCachedData();
        if (cached && cached.length > 0) {
          const hero = cached[0];
          const mins = cached.slice(1, 4);
          if (isMounted) {
            setHeroProduct(hero);
            setProducts(mins);
            setLoading(false);
            return;
          }
        }

        const data = await fetchWithRetry();
        
        if (isMounted) {
          setHeroProduct(data.heroProduct);
          setProducts(data.products);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = useCallback(async (product: FeaturedProduct) => {
    try {
      await addToCart(
        { id: product.id, name: product.name, slug: product.slug, images: product.images, category: product.category, variants: [product.variant] } as any,
        product.variant,
        1
      );
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  }, [addToCart]);

  const badgeColorClasses: Record<string, string> = {
    primary: 'bg-blue-50 text-blue-600',
    secondary: 'bg-amber-50 text-amber-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-rose-50 text-rose-600',
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (error && !hasProducts) {
    return null;
  }

  if (!hasProducts) {
    return null;
  }

  return (
    <section 
      ref={sectionRef} 
      className={cn("py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden", className)}
      aria-label={title}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-50/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={cn("inline-block px-4 py-1.5 text-sm font-bold rounded-full mb-4 uppercase tracking-wider", badgeColorClasses[badgeColor])}>
            {badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ lineHeight: 1.1 }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          <motion.div 
            className="md:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {heroProduct && (
              <HeroProductCard 
                product={heroProduct} 
                onAddToCart={handleAddToCart}
                isVisible={isVisible}
              />
            )}
          </motion.div>

          <motion.div 
            className="md:col-span-5 flex flex-col gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {products.map((product, index) => (
              <ProductMiniCard
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                isVisible={isVisible}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
