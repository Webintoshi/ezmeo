"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/products";
import { PRODUCT_BADGES } from "@/lib/constants";
import { motion } from "framer-motion";

export default function AllProductsPage() {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [products, setProducts] = useState(getAllProducts());

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

  const filteredProducts = selectedBadge
    ? products.filter((p) => {
        if (selectedBadge === "vegan") return p.vegan;
        if (selectedBadge === "glutenFree") return p.glutenFree;
        if (selectedBadge === "sugarFree") return p.sugarFree;
        if (selectedBadge === "highProtein") return p.highProtein;
        return true;
      })
    : products;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Tüm Ürünler
            </h1>
            <p className="text-lg text-muted">
              {products.length} ürün arasından size en uygununu keşfedin
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-primary/10 sticky top-16 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedBadge(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBadge === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedBadge("vegan")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBadge === "vegan"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Vegan
            </button>
            <button
              onClick={() => setSelectedBadge("glutenFree")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBadge === "glutenFree"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Glutensiz
            </button>
            <button
              onClick={() => setSelectedBadge("sugarFree")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBadge === "sugarFree"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Şekersiz
            </button>
            <button
              onClick={() => setSelectedBadge("highProtein")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBadge === "highProtein"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Yüksek Protein
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted text-lg">
                Bu kriterlere uygun ürün bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
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
