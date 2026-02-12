import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Marquee } from "@/components/sections/Marquee";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { Benefits } from "@/components/sections/Benefits";

export const metadata: Metadata = {
  title: "Ezmeo - Doğal Fıstık Ezmesi ve Kuruyemiş | Organik & Katkısız",
  description: "Ezmeo ile doğal lezzetin tadını çıkarın. %100 organik, katkısız fıstık ezmesi, fındık ezmesi ve doğal kuruyemişler. Hızlı teslimat, taze ürün garantisi.",
  keywords: ["fıstık ezmesi", "fındık ezmesi", "doğal ezme", "organik kuruyemiş", "katkısız yiyecek", "sağlıklı atıştırmalık", "protein kaynağı"],
  openGraph: {
    title: "Ezmeo - Doğal Fıstık Ezmesi ve Kuruyemiş",
    description: "Doğal lezzetin tadını çıkarın. %100 organik, katkısız fıstık ezmesi ve doğal kuruyemişler.",
    type: "website",
    locale: "tr_TR",
    siteName: "Ezmeo",
  },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
  },
};

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <TrustBadges />
      <Benefits />
      <Marquee />
      <Categories />
      <ProductShowcase />
      <Testimonials />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Ezmeo",
            "url": "https://ezmeo.com",
            "description": "Doğal fıstık ezmesi ve kuruyemiş ürünleri",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://ezmeo.com/urunler?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Ezmeo",
            "url": "https://ezmeo.com",
            "logo": "https://ezmeo.com/logo.webp",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+90-xxx-xxx-xxxx",
              "contactType": "customer service",
              "availableLanguage": ["Turkish"]
            },
            "sameAs": [
              "https://instagram.com/ezmeo",
              "https://facebook.com/ezmeo",
              "https://twitter.com/ezmeo"
            ]
          })
        }}
      />
    </>
  );
}
