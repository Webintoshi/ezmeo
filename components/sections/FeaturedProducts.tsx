"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { getFeaturedProducts } from "@/lib/products";
import { ROUTES } from "@/lib/constants";

export function FeaturedProducts() {
  const featuredProducts = getFeaturedProducts(8);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Öne Çıkan Ürünler
            </h2>
            <p className="text-muted">
              En çok tercih edilen doğal ezmelerimiz
            </p>
          </div>
          <Link
            href={ROUTES.products}
            className="hidden md:flex items-center gap-2 px-4 py-2 border border-primary/20 rounded-full hover:bg-primary hover:text-primary-foreground transition-all text-sm font-medium"
          >
            Tümünü Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href={ROUTES.products}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
