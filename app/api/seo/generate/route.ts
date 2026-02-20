import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// AI PROVIDER CONFIGURATIONS
// ============================================================================

// Z.AI Configuration (Anthropic Compatible)
const ZAI_API_KEY = process.env.ZAI_API_KEY || "";
const ZAI_BASE_URL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/anthropic";
const ZAI_MODEL = process.env.ZAI_MODEL || "GLM-4.7";

// Kimi K2.5 Configuration (OpenAI Compatible)
const KIMI_API_KEY = process.env.KIMI_API_KEY || "";
const KIMI_BASE_URL = process.env.KIMI_BASE_URL || "https://api.kimi.com/coding/v1";
const KIMI_MODEL = process.env.KIMI_MODEL || "kimi-k2-5";

// Provider priority: kimi > zai > fallback
const DEFAULT_PROVIDER = process.env.DEFAULT_AI_PROVIDER || "kimi";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AIProvider {
  name: string;
  generate: (prompt: string) => Promise<{ content: string; source: string }>;
}

// ============================================================================
// TURKISH SEO PROMPTS
// ============================================================================

function buildTurkishPrompt(params: {
  type: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
}): string {
  const { type, name, description, category, tags } = params;

  return `Ezmeo.com e-ticaret sitesi için ${type === "product" ? "ürün" : "sayfa"} SEO meta bilgileri oluştur.

📦 ÜRÜN BİLGİLERİ:
• Ad: ${name}
• Kategori: ${category || "Genel"}
• Açıklama: ${description || "N/A"}
• Etiketler: ${tags?.join(", ") || "N/A"}

✅ KURALLAR (TÜRKÇE):
1. Meta Başlık (metaTitle):
   - 50-60 karakter arasında olmalı
   - Ürün adını içermeli
   - Sonunda "| Ezmeo" olmalı
   - İkna edici, dikkat çekici olmalı

2. Meta Açıklama (metaDescription):
   - 120-160 karakter arasında olmalı
   - Ürün faydalarını vurgulamalı
   - "Hemen sipariş ver", "Kapıda öde", "Hızlı kargo" gibi CTA kelimeler kullan
   - Türkçe doğal ve akıcı olmalı

📋 ÇIKTI FORMATI (SADECE JSON):
{
  "metaTitle": "... | Ezmeo",
  "metaDescription": "..."
}

⚠️ ÖNEMLİ:
- SADECE JSON çıktısı ver, başka açıklama ekleme
- Türkçe karakterleri doğru kullan (ç, ğ, ı, ö, ş, ü)
- E-ticaret dili kullan (satış odaklı)
- Rakiplerden farklılaş, özgün ol`;
}

// ============================================================================
// AI PROVIDER IMPLEMENTATIONS
// ============================================================================

/**
 * Kimi K2.5 - OpenAI Compatible API
 * Model: kimi-k2-5 (128K context, Turkish optimized)
 */
async function generateWithKimi(prompt: string): Promise<{ content: string; source: string }> {
  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        {
          role: "system",
          content: `Sen bir e-ticaret SEO uzmanısın. Türkiye pazarında faaliyet gösteren Ezmeo.com için çalışıyorsun.

GÖREVİN:
- Ürünler için optimize edilmiş meta başlık ve açıklamalar yazmak
- Türk tüketici davranışlarına uygun, ikna edici içerikler oluşturmak
- SEO kurallarına uygun, karakter limitlerine dikkat etmek

DİL:
- SADECE Türkçe yanıt ver
- Türkçe karakterleri doğru kullan (ç, ğ, ı, ö, ş, ü)
- Doğal ve akıcı Türkçe yaz
- E-ticaret jargonu kullan (stok, kargo, sipariş, kapıda ödeme)

KISITLAMALAR:
- SADECE istenen JSON formatında yanıt ver
- Markdown, HTML veya başka format kullanma
- Açıklama veya yorum ekleme` 
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Kimi returned empty content");
  }

  return {
    content,
    source: `kimi_${KIMI_MODEL}`
  };
}

/**
 * Z.AI (GLM-4.7) - Anthropic Compatible API
 * Fallback provider
 */
async function generateWithZAI(prompt: string): Promise<{ content: string; source: string }> {
  const response = await fetch(`${ZAI_BASE_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ZAI_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: ZAI_MODEL,
      max_tokens: 1000,
      messages: [
        { 
          role: "user", 
          content: `Sen bir SEO uzmanısın. SADECE Türkçe yanıt ver ve JSON formatında yanıt ver.

${prompt}` 
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ZAI API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("ZAI returned empty content");
  }

  return {
    content,
    source: `zai_${ZAI_MODEL}`
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const debugLogs: string[] = [];
  
  try {
    const body = await request.json();
    const { 
      type, 
      name, 
      description, 
      category, 
      tags,
      provider = DEFAULT_PROVIDER // 'kimi' | 'zai' | 'auto'
    } = body;

    debugLogs.push(`🚀 İstek alındı: ${name} (${type})`);
    debugLogs.push(`🤖 Provider seçimi: ${provider}`);

    // Build Turkish optimized prompt
    const prompt = buildTurkishPrompt({ type, name, description, category, tags });
    debugLogs.push(`📝 Prompt oluşturuldu (${prompt.length} karakter)`);

    // Try providers in order
    let result: { content: string; source: string } | null = null;
    const errors: string[] = [];

    // Provider selection logic
    const providersToTry: Array<{ name: string; fn: () => Promise<{ content: string; source: string }>; key: string }> = [];

    if (provider === "kimi" || provider === "auto") {
      providersToTry.push({
        name: "Kimi K2.5",
        fn: () => generateWithKimi(prompt),
        key: KIMI_API_KEY
      });
    }

    if (provider === "zai" || provider === "auto") {
      providersToTry.push({
        name: "Z.AI (GLM-4.7)",
        fn: () => generateWithZAI(prompt),
        key: ZAI_API_KEY
      });
    }

    // Try each provider
    for (const p of providersToTry) {
      if (!p.key) {
        debugLogs.push(`⚠️ ${p.name}: API Key tanımlı değil, atlanıyor`);
        continue;
      }

      try {
        debugLogs.push(`🔄 ${p.name} deneniyor...`);
        result = await p.fn();
        debugLogs.push(`✅ ${p.name} başarılı`);
        break;
      } catch (error: any) {
        const errMsg = error.message || "Bilinmeyen hata";
        debugLogs.push(`❌ ${p.name} hata: ${errMsg.slice(0, 100)}`);
        errors.push(`${p.name}: ${errMsg}`);
      }
    }

    // If all providers failed, use fallback
    if (!result) {
      debugLogs.push(`🚨 Tüm providerlar başarısız, fallback kullanılıyor`);
      
      return NextResponse.json({
        success: true,
        metaTitle: `${name} | Ezmeo`.slice(0, 60),
        metaDescription: `${name} ürünü en uygun fiyatla Ezmeo'da! Hızlı kargo, kapıda ödeme seçenekleriyle hemen sipariş ver.`.slice(0, 160),
        source: "fallback_template",
        debug: debugLogs,
        errors
      });
    }

    // Parse JSON response
    debugLogs.push(`📦 Yanıt parse ediliyor...`);
    let parsedResult: { metaTitle?: string; metaDescription?: string };
    
    try {
      // Try to extract JSON from markdown code blocks or raw JSON
      const jsonMatch = result.content.match(/```json\n?([\s\S]*?)\n?```/);
      const cleanContent = jsonMatch ? jsonMatch[1] : result.content;
      
      // Find JSON object in response
      const jsonObjMatch = cleanContent.match(/\{[\s\S]*?\}/);
      const jsonStr = jsonObjMatch ? jsonObjMatch[0] : cleanContent;
      
      parsedResult = JSON.parse(jsonStr);
      debugLogs.push(`✅ JSON parse başarılı`);
    } catch (e: any) {
      debugLogs.push(`⚠️ JSON parse hatası: ${e.message}`);
      debugLogs.push(`📝 Raw content: ${result.content.slice(0, 200)}...`);
      
      // Try to extract using regex as last resort
      const titleMatch = result.content.match(/["']metaTitle["']\s*:\s*["']([^"']+)["']/);
      const descMatch = result.content.match(/["']metaDescription["']\s*:\s*["']([^"']+)["']/);
      
      parsedResult = {
        metaTitle: titleMatch?.[1] || `${name} | Ezmeo`,
        metaDescription: descMatch?.[1] || `${name} ürünü Ezmeo'da!`
      };
      
      debugLogs.push(`🔧 Regex ile çıkarıldı`);
    }

    // Validate and clean results
    const metaTitle = (parsedResult.metaTitle || `${name} | Ezmeo`).slice(0, 60);
    const metaDescription = (parsedResult.metaDescription || `${name} ürünü Ezmeo'da!`).slice(0, 160);

    // Ensure Turkish suffix
    const finalTitle = metaTitle.includes("Ezmeo") ? metaTitle : `${metaTitle.slice(0, 52)} | Ezmeo`;

    debugLogs.push(`🎯 Sonuç: ${finalTitle.slice(0, 30)}... (${result.source})`);

    return NextResponse.json({
      success: true,
      metaTitle: finalTitle,
      metaDescription,
      source: result.source,
      debug: debugLogs
    });

  } catch (error: any) {
    debugLogs.push(`💥 Kritik hata: ${error.message}`);
    
    return NextResponse.json({
      success: false,
      metaTitle: "Ürün | Ezmeo",
      metaDescription: "Ürün ürünü en uygun fiyatla Ezmeo'da! Hızlı kargo, kapıda ödeme.",
      source: "fallback_error",
      debug: debugLogs,
      error: error.message
    }, { status: 200 }); // Return 200 to prevent UI breakage
  }
}
