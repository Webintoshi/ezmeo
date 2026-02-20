import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.ZAI_API_KEY;
const MODEL = "glm-4.7";

export async function POST(request: NextRequest) {
  const debugLogs: string[] = [];
  
  try {
    const body = await request.json();
    const { name, description, category } = body;

    debugLogs.push(`1. İstek alındı: ${name}`);

    // API Key kontrol
    if (!API_KEY) {
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

    debugLogs.push("2. API Key mevcut");

    // Prompt oluştur
    const prompt = `Bu ürün için SEO meta başlık ve açıklama yaz.

Ürün: ${name}
Kategori: ${category || "Genel"}
Açıklama: ${description || ""}

KURALLAR:
- Meta başlık: Ürün adı geçmeli, 50-60 karakter, sonuna "| Ezmeo" ekle
- Meta açıklama: 120-160 karakter, ikna edici, ürün özelliklerini vurgula
- JSON formatında yanıt ver

ÖRNEK:
{
  "metaTitle": "Şekersiz Fıstık Ezmesi 500gr | Doğal | Ezmeo",
  "metaDescription": "%100 doğal fıstık ezmesi, şeker ilavesiz. Sporcular için ideal protein kaynağı. Hemen sipariş ver, kapıda öde!"
}`;

    debugLogs.push("3. Z.AI API'ye istek gönderiliyor...");

    // API çağrısı
    const response = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "Sen bir SEO uzmanısın. JSON formatında yanıt ver." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    debugLogs.push(`4. Z.AI yanıt durumu: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      debugLogs.push(`5. HATA: ${response.status} - ${errorText.slice(0, 200)}`);
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    debugLogs.push(`6. Z.AI yanıtı alındı: ${JSON.stringify(data).slice(0, 300)}`);

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      debugLogs.push("7. HATA: Boş yanıt");
      throw new Error("Boş yanıt");
    }

    // JSON parse
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
      debugLogs.push("8. JSON parse başarılı");
    } catch (e) {
      debugLogs.push(`7. HATA: JSON parse - ${e}`);
      throw new Error("JSON parse hatası");
    }

    return NextResponse.json({
      success: true,
      metaTitle: result.metaTitle?.slice(0, 60) || `${name} | Ezmeo`,
      metaDescription: result.metaDescription?.slice(0, 160) || `${name} ürünü Ezmeo'da!`,
      source: "zai_glm-4.7",
      debug: debugLogs
    });

  } catch (error: any) {
    debugLogs.push(`HATA: ${error.message}`);
    
    return NextResponse.json({
      success: true, // Frontend'de gösterilsin diye
      metaTitle: "Ürün | Ezmeo",
      metaDescription: "Ürün ürünü en uygun fiyatla Ezmeo'da! Hızlı kargo, kapıda ödeme.",
      source: "fallback_error",
      debug: debugLogs,
      error: error.message
    });
  }
}
