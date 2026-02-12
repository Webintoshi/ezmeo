"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ROUTES } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";
import { createBrowserClient } from "@supabase/ssr";

// Transform DB product to app Product type
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

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function loadFeatured() {
      try {
        // Client-side Supabase kullan
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            variants:product_variants(*)
          `)
          .eq("is_featured", true)
          .eq("is_active", true)
          .limit(4);
        
        if (error) {
          console.error("Supabase error:", error);
          return;
        }
        
        if (data) {
          setFeaturedProducts(data.map(transformProduct));
        }
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

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

  // Ürün yoksa section'ı gizle
  if (!loading && featuredProducts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/50 rounded-full blur-3xl"></div>
      </div>

      <div ref={sectionRef} className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 scroll-slide ${isVisible ? "is-visible" : ""}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary">Müşteri Favorileri</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Çok Satanlar
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            En çok tercih edilen doğal ezmelerimizle tanışın. Binlerce mutlu müşterinin favorisi.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 scroll-slide ${isVisible ? "is-visible" : ""}`}>
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* Mobile & Desktop View All Button */}
        <div className={`mt-12 text-center scroll-slide ${isVisible ? "is-visible" : ""}`}>
          <Link
            href={ROUTES.allProducts}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
