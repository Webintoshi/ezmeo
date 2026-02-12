"use client";

import * as React from "react";
import { Product, ProductSortOption } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar, FilterState, ActiveFilters } from "@/components/product/FilterSidebar";
import { FilterDrawer } from "@/components/product/FilterDrawer";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Grid3X3, List, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductsPageClientProps {
  initialProducts: Product[];
  categoryCounts?: Record<string, number>;
}

const SORT_OPTIONS = [
  { value: "featured", label: "Öne Çıkanlar" },
  { value: "newest", label: "En Yeni" },
  { value: "price-asc", label: "Fiyat: Düşük → Yüksek" },
  { value: "price-desc", label: "Fiyat: Yüksek → Düşük" },
  { value: "rating", label: "En Çok Puanlanan" },
  { value: "popular", label: "En Popüler" },
];

const ITEMS_PER_PAGE = 12;

export function ProductsPageClient({ initialProducts, categoryCounts }: ProductsPageClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOption, setSortOption] = React.useState<ProductSortOption>("featured");
  const [filters, setFilters] = React.useState<FilterState>({
    categories: [],
    priceRange: [0, 500],
    vegan: false,
    sugarFree: false,
    highProtein: false,
    glutenFree: false,
    inStock: false,
    onSale: false,
    isNew: false,
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const filteredProducts = React.useMemo(() => {
    let products = [...initialProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filters.categories.length > 0) {
      products = products.filter((p) => filters.categories.includes(p.category));
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
      products = products.filter((p) => {
        const minPrice = Math.min(...p.variants.map((v) => v.price));
        return minPrice >= filters.priceRange[0] && minPrice <= filters.priceRange[1];
      });
    }

    if (filters.vegan) {
      products = products.filter((p) => p.vegan);
    }

    if (filters.sugarFree) {
      products = products.filter((p) => p.sugarFree);
    }

    if (filters.highProtein) {
      products = products.filter((p) => p.highProtein);
    }

    if (filters.glutenFree) {
      products = products.filter((p) => p.glutenFree);
    }

    if (filters.inStock) {
      products = products.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    if (filters.onSale) {
      products = products.filter((p) => p.variants.some((v) => v.originalPrice && v.originalPrice > v.price));
    }

    if (filters.isNew) {
      products = products.filter((p) => p.new);
    }

    switch (sortOption) {
      case "newest":
        products.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
        break;
      case "price-asc":
        products.sort((a, b) => Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price)));
        break;
      case "price-desc":
        products.sort((a, b) => Math.min(...b.variants.map((v) => v.price)) - Math.min(...a.variants.map((v) => v.price)));
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        products.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "featured":
      default:
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return products;
  }, [initialProducts, searchQuery, filters, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortOption]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Tüm Ürünler</h1>
            <p className="text-lg text-white/90">Doğal ve katkısız ürünlerimizi keşfedin</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm py-4 -mx-4 px-4 md:-mx-0 md:px-0 border-b border-gray-200/50 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Ürün ara..."
                value={searchQuery}
                onSearch={setSearchQuery}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block w-48">
                <Select
                  options={SORT_OPTIONS}
                  value={sortOption}
                  onChange={(value) => setSortOption(value as ProductSortOption)}
                  placeholder="Sırala"
                />
              </div>

              <FilterDrawer
                filters={filters}
                onFilterChange={handleFilterChange}
                categoryCounts={categoryCounts}
              />

              <div className="hidden lg:flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2.5 transition-colors",
                    viewMode === "grid" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2.5 transition-colors",
                    viewMode === "list" ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 lg:hidden">
            <Select
              options={SORT_OPTIONS}
              value={sortOption}
              onChange={(value) => setSortOption(value as ProductSortOption)}
              placeholder="Sırala"
            />
          </div>
        </div>

        <ActiveFilters filters={filters} onFilterChange={handleFilterChange} />

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-36">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                categoryCounts={categoryCounts}
              />
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{filteredProducts.length}</span> ürün bulundu
              </p>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">Filtrelere uygun ürün bulunamadı</p>
                <p className="text-gray-400 text-sm">Farklı filtreler denemeyi veya arama yapmayı deneyin</p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "grid gap-4 lg:gap-6",
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                      : "grid-cols-1"
                  )}
                >
                  {paginatedProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} viewMode={viewMode} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {getPageNumbers().map((page, index) =>
                      page === "ellipsis" ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
