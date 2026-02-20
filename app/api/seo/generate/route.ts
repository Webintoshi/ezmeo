import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message: string; code: number };
}

function parseAIResponse(text: string): any {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON parse error:", error);
    return null;
  }
}

async function callGeminiAPI(prompt: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("No response from Gemini API");
  }

  const text = data.candidates[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  const parsed = parseAIResponse(text);
  if (!parsed) {
    throw new Error("Invalid JSON response from AI");
  }

  return parsed;
}

function buildSEOPrompt(name: string, category?: string, description?: string): string {
  return `Sen Toshi - 15 yıllık deneyimli, sertifikalı bir E-ticaret SEO uzmanısın.

## ÜRÜN BİLGİLERİ
Ürün Adı: ${name}
${category ? `Kategori: ${category}` : ''}
${description ? `Mevcut Açıklama: ${description}` : ''}

## GÖREVİN
Bu ürün için Google SERP'da en yüksek CTR (Click-Through Rate) sağlayacak meta başlık ve açıklama oluştur.

## ALTIN KURALLAR (KESİNLİKLE UYULMASI ZORUNLU)

### META BAŞLIK KURALLARI
- KESİNLİKLE 50-55 karakter arası olmalı (Google 60'ta keser)
- Yapı: [Ana Ürün Adı] + [| Özellik/Fayda] + [| Ezmeo]
- Marka "| Ezmeo" olarak SONDA olmalı
- Büyük harf kullanımına dikkat et (her kelime başı büyük)
- "Premium", "Doğal", "Organik", "Katkısız" gibi güç kelimeleri kullan
- ASLA ürün adından uzaklaşma, meyve için meyve yaz, ezme için ezme yaz

### META AÇIKLAMA KURALLARI  
- KESİNLİKLE 150-155 karakter arası olmalı (Google 160'ta keser)
- Yapı: [Fayda Cümlesi] + [Özellik] + [CTA]
- Kesinlikle ikna edici, eylem çağrısı içeren dil kullan
- "Hemen sipariş ver", "Kapıda öde", "Hızlı kargo" gibi CTA'lar kullan
- Ürünün asıl faydasını vurgula
- ASLA 160 karakteri aşma

## ÇIKTI FORMATI (SADECE JSON - KESİN KARAKTER KONTROLÜ)
\\\`\\\`\\\`json
{
  "metaTitle": "KESİNLİKLE 50-55 karakter arası",
  "metaDescription": "KESİNLİKLE 150-155 karakter arası"
}
\\\`\\\`\\\`

## ÖRNEKLER

✅ DOĞRU (Fıstık Ezmesi için):
{
  "metaTitle": "Şekersiz Fıstık Ezmesi | Doğal Protein Kaynağı | Ezmeo",
  "metaDescription": "%100 doğal şekersiz fıstık ezmesi ile sağlıklı beslenin. Sporcular için ideal protein kaynağı. Hemen sipariş ver, kapıda öde!"
}

✅ DOĞRU (Reçel için):
{
  "metaTitle": "Ev Yapımı Çilek Reçeli | Katkısız Lezzet | Ezmeo", 
  "metaDescription": "Gerçek çileklerden yapılan katkısız reçel. Kahvaltılarınıza doğal tat katın. Hemen sipariş ver, kapıda ödeme fırsatı!"
}

❌ YANLIŞ (Limit aşımı):
{
  "metaTitle": "Premium Şekersiz Fıstık Ezmesi | Katkısız Sağlıklı Lezzet | Ezmeo" (65 karakter - ÇOK UZUN)
  "metaDescription": "Şekerden uzak, sağlıklı atıştırmalık mı arıyorsunuz? Ezmeo'nun %100 doğal, katkısız şekersiz fıstık ezmesiyle tanışın..." (227 karakter - ÇOK UZUN)
}

## EN ÖNEMLİ KURAL
Ürün adı neyse onu kullan: "Vişne Reçeli" ise vişne hakkında yaz, "Fıstık Ezmesi" ise fıstık hakkında yaz. Asla üründen bağımsız genel cümleler kullanma.

SADECE ve SADECE JSON çıktısı ver. Başlık ve açıklama KESİNLİKLE karakter limitlerine uymalı.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: "Ürün adı zorunludur"
      }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "AI sistemi yapılandırılmamış (GEMINI_API_KEY eksik)"
      }, { status: 500 });
    }

    const prompt = buildSEOPrompt(name, category, description);
    const aiResponse = await callGeminiAPI(prompt);

    if (!aiResponse.metaTitle || !aiResponse.metaDescription) {
      return NextResponse.json({
        success: false,
        error: "AI yanıtı eksik meta bilgileri içeriyor"
      }, { status: 500 });
    }

    // Karakter limiti kontrolü (hard validation)
    const title = aiResponse.metaTitle;
    const desc = aiResponse.metaDescription;
    
    if (title.length > 60) {
      console.warn(`[Toshi] Title too long: ${title.length} chars - truncating`);
      aiResponse.metaTitle = title.substring(0, 57) + "...";
    }
    
    if (desc.length > 160) {
      console.warn(`[Toshi] Description too long: ${desc.length} chars - truncating`);
      aiResponse.metaDescription = desc.substring(0, 157) + "...";
    }

    return NextResponse.json({
      success: true,
      metaTitle: aiResponse.metaTitle,
      metaDescription: aiResponse.metaDescription,
      source: "toshi_ai"
    });

  } catch (error: any) {
    console.error("[Toshi] SEO Generation Error:", error);
    
    return NextResponse.json({
      success: false,
      error: `Toshi şu anda çalışamıyor: ${error.message}`,
      hint: "Lütfen daha sonra tekrar deneyin veya manuel giriş yapın"
    }, { status: 500 });
  }
}
