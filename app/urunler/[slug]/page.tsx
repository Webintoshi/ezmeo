import { Metadata } from "next";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { getProductBySlug, getProductSlug } from "@/lib/products";
import { createServerClient } from "@/lib/supabase";

// Generate metadata on the server side using database SEO fields
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  // Check if product exists in static data first
  const product = getProductBySlug(slug);
  if (!product) {
    return {
      title: "Ürün Bulunamadı | Ezmeo",
      description: "Aradığınız ürün bulunamadı.",
    };
  }

  // Try to fetch SEO data from database
  let seoTitle = `${product.name} | Ezmeo`;
  let seoDescription = product.shortDescription;

  try {
    const supabase = createServerClient();
    const { data: dbProduct } = await supabase
      .from("products")
      .select("seo_title, seo_description")
      .eq("slug", slug)
      .single();

    if (dbProduct?.seo_title) seoTitle = dbProduct.seo_title;
    if (dbProduct?.seo_description) seoDescription = dbProduct.seo_description;
  } catch {
    // Use static data as fallback
  }

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

// Generate static paths for all products
export async function generateStaticParams() {
  // Get all product slugs from static data
  const allSlugs = getProductSlug();
  return allSlugs.map((slug) => ({ slug }));
}

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

// Server component that wraps the client component with JSON-LD Schema
export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  // Try to fetch full product data from Supabase
  let initialProduct = null;
  let relatedProducts = [];

  try {
    const supabase = createServerClient();
    const { data: dbProduct } = await supabase
      .from("products")
      .select("*, variants:product_variants(*)")
      .eq("slug", slug)
      .single();

    if (dbProduct) {
      initialProduct = dbProduct;

      // Fetch related products from same category (parallel fetch)
      const [{ data: related }, { data: seoData }] = await Promise.all([
        supabase
          .from("products")
          .select("*, variants:product_variants(*)")
          .eq("category", dbProduct.category)
          .neq("slug", slug)
          .limit(4),
        supabase
          .from("products")
          .select("seo_title, seo_description")
          .eq("slug", slug)
          .single()
      ]);

      relatedProducts = related || [];

      // Update SEO if database data exists
      if (seoData?.seo_title || seoData?.seo_description) {
        initialProduct = {
          ...dbProduct,
          seo_title: seoData.seo_title,
          seo_description: seoData.seo_description,
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch product from Supabase:", error);
  }

  // Fallback to static data if Supabase fails
  if (!initialProduct) {
    const staticProduct = getProductBySlug(slug);
    if (!staticProduct) {
      return <ProductDetailClient slug={slug} initialProduct={null} initialRelatedProducts={[]} />;
    }
    initialProduct = staticProduct;
  }

  const product = initialProduct;
  const seoTitle = product.seo_title || `${product.name} | Ezmeo`;
  const seoDescription = product.seo_description || product.short_description;

  // Generate JSON-LD Schema
  const variant = product.variants[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: seoTitle.split(" | ")[0] || product.name, // Use SEO title prefix if available
    description: seoDescription,
    image: product.images,
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    sku: variant.sku,
    category: product.category,
  };

  // Breadcrumb JSON-LD
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
      {/* JSON-LD Schema for Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* JSON-LD Schema for Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Client Component for Product Detail with initial data */}
      <ProductDetailClient
        slug={slug}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}
