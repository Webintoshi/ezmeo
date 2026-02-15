import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase";
import { ProductsPageClient } from "@/components/product/ProductsPageClient";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
}

function transformProduct(dbProduct: DBProduct) {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || "",
    shortDescription: dbProduct.short_description || "",
    category: dbProduct.category,
    subcategory: dbProduct.subcategory || undefined,
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

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createServerClient();
  
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function getProductsByCategory(categorySlug: string) {
  const supabase = createServerClient();
  
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        variants:product_variants(*)
      `)
      .eq("category", categorySlug)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    
    if (error || !products) return [];
    return (products as DBProduct[]).map(transformProduct);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: "Koleksiyon Bulunamadı | Ezmeo",
    };
  }
  
  return {
    title: `${category.name} | Ezmeo`,
    description: category.description || `${category.name} kategorisindeki ürünlerimizi keşfedin.`,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Koleksiyon Bulunamadı</h1>
          <p className="text-gray-600 mb-8">Aradığınız koleksyon mevcut değil veya kaldırılmış olabilir.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }
  
  const products = await getProductsByCategory(slug);
  
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-white/90">{category.description}</p>
            )}
            <p className="text-white/70 mt-4">{products.length} ürün</p>
          </div>
        </div>
      </section>
      
      {/* Products */}
      <ProductsPageClient 
        initialProducts={products} 
      />
    </>
  );
}
