import { NextRequest, NextResponse } from "next/server";

// Z.AI Configuration
const API_KEY = process.env.ZAI_API_KEY || "";
const BASE_URL = "https://api.z.ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, description, category } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Ürün adı gerekli" },
        { status: 400 }
      );
    }

    // API Key kontrolü
    if (!API_KEY) {
      console.error("ZAI_API_KEY bulunamadı!");
      return NextResponse.json(
        { 
          success: true, 
          metaTitle: `${name} | Ezmeo`,
          metaDescription: `${name} ürünü Ezmeo kalitesiyle. Hemen sipariş ver!`,
          source: "fallback_no_key"
        }
      );
    }

    // Basit prompt
    const prompt = `Sen bir SEO uzmanısın. Bu ürün için meta başlık ve açıklama yaz:

Ürün: ${name}
Kategori: ${category || "Genel"}
Açıklama: ${description || ""}

KURALLAR:
- Meta başlık: 50-60 karakter, ürün adı + fayda + | Ezmeo
- Meta açıklama: 120-160 karakter, ikna edici, CTA içermeli
- Emoji kullanma
- Sadece JSON formatında yanıt ver

ÖRNEK FORMAT:
{
  "metaTitle": "Doğal Fıstık Ezmesi 500gr | Şekersiz | Ezmeo",
  "metaDescription": "%100 doğal fıstık ezmesi, şeker ilavesiz. Sporcular için ideal protein kaynağı. Hemen sipariş ver!"
}`;

    console.log("Z.AI isteği gönderiliyor...", { model: "glm-4.7", name });

    // Z.AI API çağrısı
    const response = await fetch(`${BASE_URL}/api/paas/v4/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4.7",
        messages: [
          { role: "system", content: "You are an SEO expert. Respond only in valid JSON format." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    console.log("Z.AI yanıt durumu:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Z.AI hatası:", response.status, errorText);
      throw new Error(`API hatası: ${response.status}`);
    }

    const data = await response.json();
    console.log("Z.AI yanıtı:", JSON.stringify(data, null, 2));

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Boş yanıt");
    }

    // JSON parse
    let result;
    try {
      // Markdown code block temizleme
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (e) {
      console.error("JSON parse hatası:", e, "İçerik:", content);
      throw new Error("Yanıt JSON formatında değil");
    }

    // Validasyon
    if (!result.metaTitle || !result.metaDescription) {
      throw new Error("Eksik alanlar");
    }

    return NextResponse.json({
      success: true,
      metaTitle: result.metaTitle.slice(0, 60),
      metaDescription: result.metaDescription.slice(0, 160),
      source: "zai_glm-4.7"
    });

  } catch (error) {
    console.error("SEO Generation Hatası:", error);
    
    // Fallback
    const { name, category } = await request.json().catch(() => ({ name: "Ürün", category: "" }));
    
    return NextResponse.json({
      success: true,
      metaTitle: `${name} | ${category || "Ezmeo"}`,
      metaDescription: `${name} ürünü en uygun fiyatla Ezmeo'da! Hızlı kargo, kapıda ödeme. Hemen sipariş ver!`,
      source: "fallback_error"
    });
  }
}
