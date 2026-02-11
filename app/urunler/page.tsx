"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/products";
import { motion } from "framer-motion";

export default function AllProductsPage() {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts] = useState(getAllProducts());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const { createServerClient } = await import("@/lib/supabase");
        const supabase = createServerClient();
        const { data, error } = await supabase
          .from("products")
          .select("*, variants:product_variants(*)");
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Ürün filtreleme ve sıralama mantığı
  const filteredProducts = products
    .filter((p) => {
      // Kategori filtrelemesi
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
      }
      // Özellik filtrelemesi
      if (selectedBadge === "vegan" && !p.vegan) return false;
      if (selectedBadge === "glutenFree" && !p.glutenFree) return false;
      if (selectedBadge === "sugarFree" && !p.sugarFree) return false;
      if (selectedBadge === "highProtein" && !p.highProtein) return false;
      // Arama filtrelemesi
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.shortDescription?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sıralama mantığı
      switch (sortBy) {
        case "price-low":
          return a.variants[0].price - b.variants[0].price;
        case "price-high":
          return b.variants[0].price - a.variants[0].price;
        case "new":
          return (b.new ? 1 : 0) - (a.new ? 1 : 0);
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header - Modern Gradient with Search */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-12 md:py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tüm Ürünler
            </h1>
            <p className="text-lg text-white/90 mb-8">
              {filteredProducts.length} ürün arasından size en uygununu keşfedin
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-2xl bg-white shadow-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Filters Panel */}
      <section className="sticky top-16 bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Left: Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Kategori:</span>
              <div className="flex gap-2">
                {["all", "fistik-ezmesi", "findik-ezmesi", "kuruyemis"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat === "all" ? "Tümü" :
                     cat === "fistik-ezmesi" ? "Fıstık Ezmesi" :
                     cat === "findik-ezmesi" ? "Fındık Ezmesi" : "Kuruyemiş"}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Badge Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Özellik:</span>
              <div className="flex gap-2">
                {[
                  { id: null, label: "Tümü" },
                  { id: "vegan", label: "Vegan" },
                  { id: "glutenFree", label: "Glutensiz" },
                  { id: "sugarFree", label: "Şekersiz" },
                  { id: "highProtein", label: "Yüksek Protein" },
                ].map((badge) => (
                  <button
                    key={badge.label}
                    onClick={() => setSelectedBadge(badge.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedBadge === badge.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {badge.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">Sırala:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option value="default">Önerilen</option>
                <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                <option value="new">En Yeniler</option>
                <option value="rating">En Çok Beğenilenler</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            // Loading State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty State
            <div className="text-center py-16 bg-white rounded-2xl">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">Ürün bulunamadı</p>
              <p className="text-gray-400 text-sm">Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz</p>
            </div>
          ) : (
            // Products Grid
            <>
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{filteredProducts.length}</span> ürün bulundu
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
