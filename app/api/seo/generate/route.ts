import { NextRequest, NextResponse } from "next/server";

// MiniMax Configuration
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE_URL = process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.5";

export async function POST(request: NextRequest) {
  const debugLogs: string[] = [];
  
  try {
    const body = await request.json();
    const { type, name, description, category, tags } = body;

    debugLogs.push(`1. İstek alındı: ${name} (${type})`);

    // API Key kontrol
    if (!MINIMAX_API_KEY) {
      debugLogs.push("2. HATA: MINIMAX_API_KEY tanımlı değil!");
      return NextResponse.json({
        success: false,
        error: "API Key tanımlı değil",
        debug: debugLogs,
        metaTitle: `${name} | Ezmeo`,
        metaDescription: `${name} ürünü Ezmeo'da!`,
        source: "fallback_no_key"
      });
    }

    debugLogs.push("2. MiniMax API Key mevcut");
    debugLogs.push(`2.1. Model: ${MINIMAX_MODEL}`);

    // Prompt oluştur
    const prompt = `Bu ürün için SEO meta başlık ve açıklama yaz.

Ürün: ${name}
Kategori: ${category || "Genel"}
Açıklama: ${description || ""}
Etiketler: ${tags?.join(", ") || ""}

KURALLAR:
- Meta başlık: Ürün adı geçmeli, 50-60 karakter, sonuna "| Ezmeo" ekle
- Meta açıklama: 120-160 karakter, ikna edici, ürün özelliklerini vurgula
- JSON formatında yanıt ver

ÖRNEK:
{
  "metaTitle": "Şekersiz Fıstık Ezmesi 500gr | Doğal | Ezmeo",
  "metaDescription": "%100 doğal fıstık ezmesi, şeker ilavesiz. Sporcular için ideal protein kaynağı. Hemen sipariş ver, kapıda öde!"
}`;

    debugLogs.push("3. MiniMax API'ye istek gönderiliyor...");

    // MiniMax API çağrısı (OpenAI format)
    const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [
          { role: "system", content: "Sen bir SEO uzmanısın. JSON formatında yanıt ver." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    debugLogs.push(`4. MiniMax yanıt durumu: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      debugLogs.push(`5. HATA: ${response.status} - ${errorText.slice(0, 300)}`);
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    debugLogs.push(`5. MiniMax yanıtı alındı: ${JSON.stringify(data).slice(0, 200)}...`);

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      debugLogs.push("6. HATA: Boş yanıt");
      throw new Error("Boş yanıt");
    }

    // JSON parse
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      debugLogs.push("6. JSON parse başarılı");
    } catch (e) {
      debugLogs.push(`6. HATA: JSON parse - ${e}`);
      throw new Error("JSON parse hatası");
    }

    return NextResponse.json({
      success: true,
      metaTitle: result.metaTitle?.slice(0, 60) || `${name} | Ezmeo`,
      metaDescription: result.metaDescription?.slice(0, 160) || `${name} ürünü Ezmeo'da!`,
      source: `minimax_${MINIMAX_MODEL}`,
      debug: debugLogs
    });

  } catch (error: any) {
    debugLogs.push(`HATA: ${error.message}`);
    
    // Fallback - şablon kullan
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
