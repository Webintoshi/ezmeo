import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// SEO TEMPLATE CONFIGURATION
// ============================================================================

interface SEOTemplate {
  keywords: string[];
  titleTemplates: string[];
  descTemplates: string[];
  cta: string[];
}

// Kategori bazlı SEO template'leri
const SEO_TEMPLATES: Record<string, SEOTemplate> = {
  "kahvaltilik": {
    keywords: ["kahvaltı", "doğal", "ev yapımı", "taze"],
    titleTemplates: [
      "{name} | Kahvaltılık | Ezmeo",
      "{name} - Doğal Kahvaltılık | Ezmeo",
      "{name} | Ev Yapımı Lezzet | Ezmeo"
    ],
    descTemplates: [
      "{name} kahvaltılarınıza lezzet katıyor. Doğal içerikli, katkısız. Hemen sipariş ver, kapıda öde!",
      "{name} en taze haliyle Ezmeo'da! Kahvaltılarınız için ideal seçim. Hızlı kargo, güvenli ödeme.",
      "Doğal {name} kahvaltılarınız için mükemmel. Katkı maddesi içermez. Hemen keşfet!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Hızlı kargo"]
  },
  "atistirmalik": {
    keywords: ["atıştırmalık", "sağlıklı", "protein", "enerji"],
    titleTemplates: [
      "{name} | Sağlıklı Atıştırmalık | Ezmeo",
      "{name} - Protein Kaynağı | Ezmeo",
      "{name} | Enerji Deposu | Ezmeo"
    ],
    descTemplates: [
      "{name} sağlıklı atıştırmalık arayanlar için ideal. Yüksek protein, doğal enerji. Hemen sipariş ver!",
      "{name} sporcu beslenmesine uygun, protein açısından zengin. Ezmeo'da en uygun fiyatla!",
      "Sağlıklı yaşamın tadı {name}. Katkısız, doğal içerik. Kapıda ödeme seçeneğiyle hemen al!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Stokla sınırlı"]
  },
  "fistik-ezmesi": {
    keywords: ["fıstık ezmesi", "şekersiz", "doğal", "protein"],
    titleTemplates: [
      "{name} | Şekersiz | Ezmeo",
      "{name} - Doğal Fıstık Ezmesi | Ezmeo",
      "{name} | Sporcu Besini | Ezmeo"
    ],
    descTemplates: [
      "%100 doğal {name}, şeker ilavesiz. Sporcular için ideal protein kaynağı. Hemen sipariş ver, kapıda öde!",
      "{name} en uygun fiyatla Ezmeo'da! Doğal, katkısız, sağlıklı. Hızlı kargo avantajıyla!",
      "Şekersiz {name} kahvaltılarınızın vazgeçilmezi. Yüksek protein, düşük karbonhidrat. Stokla sınırlı!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Hızlı kargo"]
  },
  "recel": {
    keywords: ["reçel", "ev yapımı", "doğal", "meyve"],
    titleTemplates: [
      "{name} | Ev Yapımı Reçel | Ezmeo",
      "{name} - Doğal Meyve Reçeli | Ezmeo",
      "{name} | Katkısız Reçel | Ezmeo"
    ],
    descTemplates: [
      "Ev yapımı lezzetinde {name}. Doğal meyvelerden, katkı maddesiz. Hemen sipariş ver!",
      "{name} kahvaltılarınıza tat katıyor. Gerçek meyve aroması, doğal şeker. Kapıda ödeme!",
      "{name} en taze haliyle Ezmeo'da! Ev yapımı kalitesinde, doğal içerik. Hızlı kargo!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Taze ürün"]
  },
  "zeytin": {
    keywords: ["zeytin", "doğal", "Ege", "kahvaltı"],
    titleTemplates: [
      "{name} | Doğal Zeytin | Ezmeo",
      "{name} - Ege Zeytini | Ezmeo",
      "{name} | Kahvaltılık Zeytin | Ezmeo"
    ],
    descTemplates: [
      "Ege'nin eşsiz lezzeti {name}. Doğal hasat, katkısız. Hemen sipariş ver, kapıda öde!",
      "{name} kahvaltılarınızın vazgeçilmezi. Doğal fermente, Ege kalitesi. Ezmeo'da!",
      "{name} en uygun fiyatla Ezmeo'da! Doğal zeytin, geleneksel yöntemlerle. Hızlı kargo!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Ege lezzeti"]
  },
  "sos": {
    keywords: ["sos", "doğal", "ev yapımı", "lezzet"],
    titleTemplates: [
      "{name} | Doğal Sos | Ezmeo",
      "{name} - Ev Yapımı Sos | Ezmeo",
      "{name} | Katkısız Sos | Ezmeo"
    ],
    descTemplates: [
      "{name} yemeklerinize lezzet katıyor. Doğal içerikli, katkısız. Hemen sipariş ver!",
      "Ev yapımı kalitesinde {name}. Doğal malzemeler, özel tarif. Kapıda ödeme seçeneğiyle!",
      "{name} en taze haliyle Ezmeo'da! Doğal, sağlıklı, lezzetli. Hızlı kargo avantajıyla!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Özel tarif"]
  },
  "bal": {
    keywords: ["bal", "doğal", "organik", "kahvaltı"],
    titleTemplates: [
      "{name} | Doğal Bal | Ezmeo",
      "{name} - Organik Bal | Ezmeo",
      "{name} | Kahvaltılık Bal | Ezmeo"
    ],
    descTemplates: [
      "{name} doğal arıcılıktan sofralarınıza. Katkısız, saf bal. Hemen sipariş ver, kapıda öde!",
      "{name} kahvaltılarınızın tatlısı. Doğal, organik, sağlıklı. Ezmeo'da en uygun fiyatla!",
      "{name} en taze haliyle Ezmeo'da! Doğal bal, gerçek lezzet. Hızlı kargo, güvenli ödeme!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Doğal ürün"]
  },
  "tahin": {
    keywords: ["tahin", "doğal", "katkısız", "kahvaltı"],
    titleTemplates: [
      "{name} | Doğal Tahin | Ezmeo",
      "{name} - Katkısız Tahin | Ezmeo",
      "{name} | Kahvaltılık Tahin | Ezmeo"
    ],
    descTemplates: [
      "{name} susamın en saf hali. Doğal, katkısız, geleneksel yöntemlerle. Hemen sipariş ver!",
      "{name} kahvaltılarınızın vazgeçilmezi. Doğal tahin, gerçek lezzet. Kapıda ödeme!",
      "{name} en uygun fiyatla Ezmeo'da! Doğal içerik, geleneksel üretim. Hızlı kargo!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Geleneksel lezzet"]
  },
  "pekmez": {
    keywords: ["pekmez", "doğal", "üzüm", "demir"],
    titleTemplates: [
      "{name} | Doğal Pekmez | Ezmeo",
      "{name} - Üzüm Pekmezi | Ezmeo",
      "{name} | Katkısız Pekmez | Ezmeo"
    ],
    descTemplates: [
      "{name} doğal üzümden elde edildi. Demir açısından zengin, katkısız. Hemen sipariş ver!",
      "{name} geleneksel yöntemlerle üretildi. Doğal, sağlıklı, besleyici. Kapıda ödeme!",
      "{name} en taze haliyle Ezmeo'da! Doğal üzüm pekmezi, gerçek lezzet. Hızlı kargo!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Demir deposu"]
  },
  "default": {
    keywords: ["doğal", "taze", "kaliteli"],
    titleTemplates: [
      "{name} | Ezmeo",
      "{name} - Doğal Ürün | Ezmeo",
      "{name} | En Uygun Fiyat | Ezmeo"
    ],
    descTemplates: [
      "{name} en uygun fiyatla Ezmeo'da! Doğal, taze ve kaliteli. Hemen sipariş ver, kapıda öde!",
      "{name} Ezmeo güvencesiyle kapınıza geliyor. Doğal ürün, hızlı kargo. Hemen keşfet!",
      "{name} stoklarımızda sınırlı! Doğal ve taze ürün için hemen sipariş ver, kaçırma!"
    ],
    cta: ["Hemen sipariş ver", "Kapıda öde", "Hızlı kargo"]
  }
};

// Kategori eşleştirme kuralları
const CATEGORY_MAPPING: Record<string, string[]> = {
  "fistik-ezmesi": ["fıstık", "fıstık ezmesi", "nutella", "krema", "sürülebilir"],
  "kahvaltilik": ["kahvaltı", "krema", "ezme", "sürülebilir", "reçel", "bal", "tahin", "pekmez"],
  "atistirmalik": ["atıştırmalık", "protein", "bar", "top", "kuruyemiş", "meyve"],
  "recel": ["reçel", "marmelat"],
  "zeytin": ["zeytin", "salamura"],
  "sos": ["sos", "ketçap", "mayonez", "hardal"],
  "bal": ["bal", "arı", "petek"],
  "tahin": ["tahin", "susam"],
  "pekmez": ["pekmez", "üzüm", "kestane"]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function detectCategory(name: string, category?: string): string {
  const lowerName = name.toLowerCase();
  const lowerCategory = (category || "").toLowerCase();
  
  // Önce ürün adına göre eşleştir
  for (const [catKey, keywords] of Object.entries(CATEGORY_MAPPING)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword) || lowerCategory.includes(keyword)) {
        return catKey;
      }
    }
  }
  
  return "default";
}

function selectRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateSEOContent(name: string, category?: string, description?: string): {
  metaTitle: string;
  metaDescription: string;
} {
  const detectedCategory = detectCategory(name, category);
  const template = SEO_TEMPLATES[detectedCategory] || SEO_TEMPLATES["default"];
  
  // Template seç ve ürün adını yerleştir
  let metaTitle = selectRandomTemplate(template.titleTemplates)
    .replace(/{name}/g, name);
  
  let metaDescription = selectRandomTemplate(template.descTemplates)
    .replace(/{name}/g, name);
  
  // Karakter limitlerine göre kısalt
  metaTitle = metaTitle.slice(0, 60);
  metaDescription = metaDescription.slice(0, 160);
  
  return { metaTitle, metaDescription };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const debugLogs: string[] = [];
  
  try {
    const body = await request.json();
    const { name, category, description } = body;

    debugLogs.push(`🚀 İstek alındı: ${name}`);
    debugLogs.push(`📂 Kategori: ${category || "belirtilmemiş"}`);
    
    // Kategori tespiti
    const detectedCategory = detectCategory(name, category);
    debugLogs.push(`🎯 Tespit edilen kategori: ${detectedCategory}`);
    
    // SEO içeriği oluştur
    const { metaTitle, metaDescription } = generateSEOContent(name, category, description);
    
    debugLogs.push(`✅ SEO içeriği oluşturuldu`);
    debugLogs.push(`📝 Başlık: ${metaTitle.slice(0, 40)}... (${metaTitle.length} karakter)`);
    debugLogs.push(`📄 Açıklama: ${metaDescription.slice(0, 50)}... (${metaDescription.length} karakter)`);

    return NextResponse.json({
      success: true,
      metaTitle,
      metaDescription,
      source: `template_${detectedCategory}`,
      debug: debugLogs
    });

  } catch (error: any) {
    debugLogs.push(`💥 Hata: ${error.message}`);
    
    // Fallback - her zaman çalışır
    return NextResponse.json({
      success: true,
      metaTitle: "Ürün | Ezmeo",
      metaDescription: "Doğal ürün en uygun fiyatla Ezmeo'da! Hızlı kargo, kapıda ödeme.",
      source: "fallback_error",
      debug: debugLogs
    });
  }
}
