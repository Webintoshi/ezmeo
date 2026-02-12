import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { getProductBySlug, getProductSlug } from "@/lib/products";
import { createServerClient } from "@/lib/supabase";
import { parseProductSlug, findVariantIndex, buildCanonicalUrl } from "@/lib/slug-parser";

// Generate metadata on the server side
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  // Parse URL slug to extract base slug
  const { baseSlug } = parseProductSlug(slug);

  // Get product from static data (fastest)
  const product = getProductBySlug(baseSlug);
  
  if (!product) {
    return {
      title: "Ürün Bulunamadı | Ezmeo",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  const seoTitle = `${product.name} | Ezmeo`;
  const seoDescription = product.shortDescription;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: product.images?.[0] ? [product.images[0]] : [],
      type: "website",
      locale: "tr_TR",
      siteName: "Ezmeo",
      url: `https://ezmeo.com/urunler/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: {
      canonical: buildCanonicalUrl(baseSlug),
    },
  };
}

// Generate static paths for all products at build time
export async function generateStaticParams() {
  // Get all slugs from Supabase (including newly added products)
  try {
    const supabase = createServerClient();
    const { data: products } = await supabase
      .from("products")
      .select("slug")
      .eq("is_active", true);
    
    if (products && products.length > 0) {
      return products.map((p) => ({ slug: p.slug }));
    }
  } catch (error) {
    console.error("Failed to fetch slugs for static generation:", error);
  }
  
  // Fallback to static data
  const allSlugs = getProductSlug();
  return allSlugs.map((slug) => ({ slug }));
}

// Dynamic rendering for fresh data
export const revalidate = 0; // No cache - always fresh
export const dynamic = 'force-dynamic';

// Server component
export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: urlSlug } = await params;

  // Parse URL slug to extract base product slug and variant info
  const parsedSlug = parseProductSlug(urlSlug);
  const { baseSlug } = parsedSlug;

  let product = null;
  let relatedProducts: any[] = [];

  // 1. FIRST: Check Supabase (always has latest data with images)
  try {
    const supabase = createServerClient();
    const { data: dbProduct } = await supabase
      .from("products")
      .select("*, variants:product_variants(*)")
      .eq("slug", baseSlug)  // Use baseSlug instead of urlSlug
      .eq("is_active", true)
      .single();

    console.log('=== DEBUG Product Page ===');
    console.log('URL Slug:', urlSlug);
    console.log('Parsed Base Slug:', baseSlug);
    console.log('DB Product:', dbProduct);
    console.log('========================');

    console.log('Product Page - dbProduct.images:', dbProduct?.images);
    console.log('Product Page - dbProduct.images count:', dbProduct?.images?.length);
    console.log('Product Page - dbProduct:', dbProduct);

    if (dbProduct) {
      // Transform images_v2 to images format
      const images = dbProduct.images_v2?.map((img: any) => img.url) || dbProduct.images || [];
      product = {
        ...dbProduct,
        images,
        variants: dbProduct.variants?.map((v: any) => ({
          ...v,
          originalPrice: v.original_price,
        })),
      } as any;
    }
  } catch (error) {
    console.error("Failed to fetch product from Supabase:", error);
  }

  // 2. SECOND: Fallback to static data if Supabase fails
  if (!product) {
    product = getProductBySlug(baseSlug);  // Use baseSlug instead of urlSlug
  }

  // 3. If still no product, return 404
  if (!product) {
    notFound();
  }

  // 4. Determine selected variant based on URL
  let selectedVariantIndex = 0;
  if (product.variants && product.variants.length > 0) {
    selectedVariantIndex = findVariantIndex(product.variants, parsedSlug);
  }

  // 5. Get related products from same category (from static data - faster)
  try {
    // Try to get related products from static data first
    const { getRelatedProducts } = await import("@/lib/products");
    relatedProducts = getRelatedProducts(product, 4);
  } catch {
    // Fallback: empty array
    relatedProducts = [];
  }

  // Generate JSON-LD Schema
  const variant = product.variants?.[selectedVariantIndex || 0];
  const jsonLd = variant ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    image: product.images?.[0],
    url: `https://ezmeo.com/urunler/${baseSlug}`,
    brand: {
      "@type": "Brand",
      name: "Ezmeo",
    },
    offers: {
      "@type": "Offer",
      url: `https://ezmeo.com/urunler/${baseSlug}`,
      priceCurrency: "TRY",
      price: variant.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: variant.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Ezmeo",
      },
    },
    aggregateRating: product.rating ? {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0,
    } : undefined,
    sku: variant.sku,
    category: product.category,
  } : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://ezmeo.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ürünler",
        item: "https://ezmeo.com/urunler",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://ezmeo.com/urunler/${baseSlug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Schema */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Product Detail Client Component */}
      <ProductDetailClient
        slug={baseSlug}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
        initialVariantIndex={selectedVariantIndex}
      />
    </>
  );
}
