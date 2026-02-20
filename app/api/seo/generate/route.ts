import { NextRequest, NextResponse } from "next/server";

// Z.AI Configuration (Anthropic Compatible)
const ZAI_API_KEY = process.env.ZAI_API_KEY || "4b5859a10f6d490dbc060c8944513b8a.OXgqU8puVqpl10Ip";
const ZAI_BASE_URL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/anthropic";
const ZAI_MODEL = "GLM-4.7"; // Sonnet = GLM-4.7

export async function POST(request: NextRequest) {
  const debugLogs: string[] = [];
  
  try {
    const body = await request.json();
    const { type, name, description, category, tags } = body;

    debugLogs.push(`1. İstek alındı: ${name} (${type})`);

    // API Key kontrol
    if (!ZAI_API_KEY) {
      debugLogs.push("2. HATA: ZAI_API_KEY tanımlı değil!");
      return NextResponse.json({
        success: false,
        error: "API Key tanımlı değil",
        debug: debugLogs,
        metaTitle: `${name} | Ezmeo`,
        metaDescription: `${name} ürünü Ezmeo'da!`,
        source: "fallback_no_key"
      });
    }

    debugLogs.push("2. Z.AI API Key mevcut");
    debugLogs.push(`2.1. Model: ${ZAI_MODEL} (Sonnet/GLM-4.7)`);
    debugLogs.push(`2.2. Endpoint: ${ZAI_BASE_URL}/v1/messages`);

    // Prompt oluştur
    const prompt = `Bu ürün için SEO meta başlık ve açıklama yaz.

Ürün: ${name}
Kategori: ${category || "Genel"}
Açıklama: ${description || ""}
Etiketler: ${tags?.join(", ") || ""}

KURALLAR:
- Meta başlık: Ürün adı geçmeli, 50-60 karakter, sonuna "| Ezmeo" ekle
- Meta açıklama: 120-160 karakter, ikna edici, ürün özelliklerini vurgula
- SADECE JSON formatında yanıt ver, başka açıklama ekleme

ÖRNEK:
{
  "metaTitle": "Şekersiz Fıstık Ezmesi 500gr | Doğal | Ezmeo",
  "metaDescription": "%100 doğal fıstık ezmesi, şeker ilavesiz. Sporcular için ideal protein kaynağı. Hemen sipariş ver, kapıda öde!"
}`;

    debugLogs.push("3. Z.AI API'ye istek gönderiliyor (Anthropic format)...");

    // Anthropic API formatında çağrı
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
            content: `Sen bir SEO uzmanısın. JSON formatında yanıt ver.

${prompt}` 
          }
        ]
      })
    });

    debugLogs.push(`4. Z.AI yanıt durumu: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      debugLogs.push(`5. HATA: ${response.status} - ${errorText.slice(0, 300)}`);
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    debugLogs.push(`5. Z.AI yanıtı alındı: ${JSON.stringify(data).slice(0, 200)}...`);

    // Anthropic format: content[0].text
    const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content;
    
    if (!content) {
      debugLogs.push(`6. HATA: Boş yanıt. Structure: ${JSON.stringify(Object.keys(data))}`);
      throw new Error("Boş yanıt");
    }

    debugLogs.push(`6. Content alındı: ${content.slice(0, 100)}...`);

    // JSON parse
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      debugLogs.push("7. JSON parse başarılı");
    } catch (e) {
      debugLogs.push(`7. HATA: JSON parse - ${e}`);
      debugLogs.push(`7.1. Raw content: ${content.slice(0, 200)}`);
      throw new Error("JSON parse hatası");
    }

    return NextResponse.json({
      success: true,
      metaTitle: result.metaTitle?.slice(0, 60) || `${name} | Ezmeo`,
      metaDescription: result.metaDescription?.slice(0, 160) || `${name} ürünü Ezmeo'da!`,
      source: `zai_${ZAI_MODEL}`,
      debug: debugLogs
    });

  } catch (error: any) {
    debugLogs.push(`HATA: ${error.message}`);
    
    return NextResponse.json({
      success: true,
      metaTitle: "Ürün | Ezmeo",
      metaDescription: "Ürün ürünü en uygun fiyatla Ezmeo'da! Hızlı kargo, kapıda ödeme.",
      source: "fallback_error",
      debug: debugLogs,
      error: error.message
    });
  }
}
