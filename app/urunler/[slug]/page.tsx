import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { getProductBySlug, getProductSlug } from "@/lib/products";
import { createServerClient } from "@/lib/supabase";

// Generate metadata on the server side
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Get product from static data (fastest)
  const product = getProductBySlug(slug);
  
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
      canonical: `https://ezmeo.com/urunler/${slug}`,
    },
  };
}

// Generate static paths for all products at build time
export async function generateStaticParams() {
  const allSlugs = getProductSlug();
  return allSlugs.map((slug) => ({ slug }));
}

// Static rendering with ISR
export const revalidate = 3600; // 1 saat
export const dynamic = 'force-static';

// Server component
export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  let product = null;
  let relatedProducts: any[] = [];

  // 1. FIRST: Check Supabase (always has latest data with images)
  try {
    const supabase = createServerClient();
    const { data: dbProduct } = await supabase
      .from("products")
      .select("*, variants:product_variants(*)")
      .eq("slug", slug)
      .single();

    console.log('Product Page - dbProduct.images:', dbProduct?.images);
    console.log('Product Page - dbProduct.images count:', dbProduct?.images?.length);
    console.log('Product Page - dbProduct:', dbProduct);

    if (dbProduct) {
      product = dbProduct as any;
    }
  } catch (error) {
    console.error("Failed to fetch product from Supabase:", error);
  }

  // 2. SECOND: Fallback to static data if Supabase fails
  if (!product) {
    product = getProductBySlug(slug);
  }

  // 3. If still no product, return 404
  if (!product) {
    notFound();
  }

  // 4. Get related products from same category (from static data - faster)
  try {
    // Try to get related products from static data first
    const { getRelatedProducts } = await import("@/lib/products");
    relatedProducts = getRelatedProducts(product, 4);
  } catch {
    // Fallback: empty array
    relatedProducts = [];
  }

  // Generate JSON-LD Schema
  const variant = product.variants?.[0];
  const jsonLd = variant ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 160),
    image: product.images?.[0],
    url: `https://ezmeo.com/urunler/${slug}`,
    brand: {
      "@type": "Brand",
      name: "Ezmeo",
    },
    offers: {
      "@type": "Offer",
      url: `https://ezmeo.com/urunler/${slug}`,
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
        item: `https://ezmeo.com/urunler/${slug}`,
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
        slug={slug}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}
