import { createServerClient } from "@/lib/supabase";
import { Suspense } from "react";
import { Product } from "@/types/product";
import { ProductsPageClient } from "@/components/product/ProductsPageClient";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Tüm Ürünler | Ezmeo",
  description: "Doğal ve katkısız fıstık ezmesi, fındık ezmesi ve kuruyemiş çeşitlerimizi keşfedin.",
};

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  images: string[];
  category: string;
  subcategory: string | null;
  tags: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;
  is_new: boolean;
  vegan: boolean;
  gluten_free: boolean;
  sugar_free: boolean;
  high_protein: boolean;
  rating: number;
  review_count: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  variants: DBVariant[];
}

interface DBVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  weight: string | null;
  created_at: string;
}

function transformProduct(dbProduct: DBProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || "",
    shortDescription: dbProduct.short_description || "",
    category: (dbProduct.category as Product["category"]) || "fistik-ezmesi",
    subcategory: (dbProduct.subcategory as Product["subcategory"]) || "klasik",
    images: dbProduct.images || [],
    tags: dbProduct.tags || [],
    variants: dbProduct.variants?.map(v => ({
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

async function getProducts(): Promise<Product[]> {
  const supabase = createServerClient();
  
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        variants:product_variants(*)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Supabase error:", error);
      return [];
    }
    
    return (products as DBProduct[] || []).map(transformProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

async function getCategoryCounts() {
  const supabase = createServerClient();
  
  try {
    const { data: products } = await supabase
      .from("products")
      .select("category")
      .eq("is_active", true);

    const counts: Record<string, number> = {};
    products?.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    console.error("Failed to fetch category counts:", error);
    return {};
  }
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(8)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function ProductsContent() {
  const [products, categoryCounts] = await Promise.all([
    getProducts(),
    getCategoryCounts(),
  ]);
  
  return (
    <ProductsPageClient 
      initialProducts={products} 
      categoryCounts={categoryCounts}
    />
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={
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
          <ProductsLoading />
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
