"use client";

import { use } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { getProductsByCategorySlug } from "@/lib/products";
import { getCategoryBySlug } from "@/lib/categories";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = getProductsByCategorySlug(slug);
  const category = getCategoryBySlug(slug);

  if (!category || products.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">{category.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              {category.name}
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {category.description}
            </p>
            <p className="text-sm text-muted mt-2">
              {products.length} ürün
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-lg">
                Bu kategoride henüz ürün bulunmamaktadır.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
