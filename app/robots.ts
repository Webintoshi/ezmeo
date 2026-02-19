import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ezmeo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
        crawlDelay: 2,
      },
      // LLM botlarına SEO ve blog içerikleri için izin ver (GEO - Generative Engine Optimization)
      {
        userAgent: "GPTBot",
        allow: ["/seo/", "/blog/"],
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/seo/", "/blog/"],
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/seo/", "/blog/"],
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/seo/", "/blog/"],
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
      },
      {
        userAgent: "CCBot",
        allow: ["/seo/", "/blog/"],
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/seo/", "/blog/"],
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/seo/", "/blog/"],
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
