import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/giris/", "/kayit/"],
        crawlDelay: 2,
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: " anthropic-ai",
        disallow: "/",
      },
    ],
    sitemap: "https://ezmeo.com/sitemap.xml",
  };
}
