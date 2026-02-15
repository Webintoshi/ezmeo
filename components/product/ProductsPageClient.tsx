"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar, FilterState, ActiveFilters } from "@/components/product/FilterSidebar";
import { FilterDrawer } from "@/components/product/FilterDrawer";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Grid3X3, List, SlidersHorizontal, ChevronLeft, ChevronRight, X, ShoppingCart, Heart, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";

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

type ProductSortOption = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "popular";

function parseFiltersFromParams(searchParams: URLSearchParams): {
  filters: FilterState;
  sort: ProductSortOption;
  search: string;
  page: number;
} {
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const priceMin = Number(searchParams.get("priceMin")) || 0;
  const priceMax = Number(searchParams.get("priceMax")) || 500;
  
  return {
    filters: {
      categories,
      priceRange: [priceMin, priceMax] as [number, number],
      vegan: searchParams.get("vegan") === "true",
      sugarFree: searchParams.get("sugarFree") === "true",
      highProtein: searchParams.get("highProtein") === "true",
      glutenFree: searchParams.get("glutenFree") === "true",
      inStock: searchParams.get("inStock") === "true",
      onSale: searchParams.get("onSale") === "true",
      isNew: searchParams.get("isNew") === "true",
    },
    sort: (searchParams.get("sort") as ProductSortOption) || "featured",
    search: searchParams.get("q") || "",
    page: Number(searchParams.get("page")) || 1,
  };
}

function ProductsPageContent({ initialProducts, categoryCounts }: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

  const initialState = React.useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);

  const [searchQuery, setSearchQuery] = React.useState(initialState.search);
  const [sortOption, setSortOption] = React.useState<ProductSortOption>(initialState.sort);
  const [filters, setFilters] = React.useState<FilterState>(initialState.filters);
  const [currentPage, setCurrentPage] = React.useState(initialState.page);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  React.useEffect(() => {
    setIsInitialized(true);
  }, []);

  React.useEffect(() => {
    setSearchQuery(initialState.search);
    setSortOption(initialState.sort);
    setFilters(initialState.filters);
    setCurrentPage(initialState.page);
  }, [initialState]);

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

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort as ProductSortOption);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                onSearch={handleSearchChange}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block w-48">
                <Select
                  options={SORT_OPTIONS}
                  value={sortOption}
                  onChange={handleSortChange}
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
              onChange={handleSortChange}
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
                    <ProductCard key={product.id} product={product} index={index} viewMode={viewMode} onQuickView={setQuickViewProduct} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
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
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
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

      {/* Quick View Modal - Centered Popup */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setQuickViewProduct(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto bg-gray-100">
                {quickViewProduct.images && quickViewProduct.images.length > 0 ? (
                  <img
                    src={quickViewProduct.images[0]}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {quickViewProduct.category === "fistik-ezmesi" && "🥜"}
                    {quickViewProduct.category === "findik-ezmesi" && "🌰"}
                    {quickViewProduct.category === "kuruyemis" && "🥔"}
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{quickViewProduct.name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-4 h-4", i < Math.round(quickViewProduct.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({quickViewProduct.reviewCount || 0} değerlendirme)</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{quickViewProduct.shortDescription || quickViewProduct.description}</p>
                
                {/* Variants */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Seçenekler</p>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.variants?.map((variant) => (
                      <button
                        key={variant.id}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-sm"
                      >
                        {variant.name} - {formatPrice(variant.price)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(quickViewProduct.variants?.[0]?.price || 0)}
                    </span>
                    {quickViewProduct.variants?.[0]?.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(quickViewProduct.variants[0].originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/urun/${quickViewProduct.slug}`}
                      className="flex-1 px-6 py-3 bg-primary text-white text-center font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Ürünü İncele
                    </Link>
                    <button className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductsPageClient({ initialProducts, categoryCounts }: ProductsPageClientProps) {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-12 md:py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Tüm Ürünler</h1>
              <p className="text-lg text-white/90">Doğal ve katkısız ürünlerimizi keşfedin</p>
            </div>
          </div>
        </section>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent initialProducts={initialProducts} categoryCounts={categoryCounts} />
    </React.Suspense>
  );
}
