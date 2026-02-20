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
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
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
  return `Sen 15 yıllık deneyimli, uluslararası sertifikalı bir E-ticaret SEO stratejistsin. 
Google'ın E-E-A-T (Experience, Expertise, Authoritativeness, Trust) ve YMYL (Your Money Your Life) kriterlerine ustalıkla hakimsin.

## MÜŞTERİ PROFİLİ
Ezmeo.com - Premium doğal gıda ve katkısız ürünler satan bir e-ticaret markası. 
Hedef kitle: Sağlıklı yaşamaya önem veren, kaliteli ürün arayan, orta-üst gelir grubu tüketiciler.
Rekabet avantajı: %100 doğal, katkısız, geleneksel yöntemlerle üretim, kapıda ödeme.

## ÜRÜN BİLGİLERİ
Ürün Adı: ${name}
${category ? `Kategori: ${category}` : ''}
${description ? `Açıklama: ${description}` : ''}

## SEO STRATEJİ GÖREVİ

1. **ANAHTAR KELİME ARAŞTIRMASI (Sanal)**
   - Ürün adından yüksek hacimli, düşük rekabetli long-tail anahtar kelimeler çıkar
   - Transactional intent (satın alma niyeti) olan kelimeler seç
   - Yerel SEO için "online", "kapıda ödeme", "hızlı kargo" modifikatörlerini düşün

2. **META BAŞLIK OPTİMİZASYONU**
   - 50-60 karakter (Google SERP'da tam görünecek şekilde)
   - Yapı: [Anahtar Kelime] + [Fayda/Özellik] + [| Ezmeo]
   - Güç kelimeleri kullan: "Doğal", "Organik", "Premium", "Katkısız"
   - Duygusal tetikleyiciler: "Lezzet", "Sağlık", "Kalite"

3. **META AÇIKLAMA OPTİMİZASYONU**
   - 150-160 karakter arası (kesilmeden görünecek)
   - Yapı: [Sorun/İhtiyaç] + [Çözüm] + [Fayda] + [CTA]
   - İkna edici, eylem çağrısı içeren dil
   - "Hemen sipariş ver", "Kapıda öde", "Stokla sınırlı" gibi aciliyet unsurları

4. **KATEGORİ TESPİTİ**
   - Ürünün doğru kategorisini belirle (fıstık ezmesi, reçel, bal, vb.)
   - Hedef kitlenin arama davranışını analiz et

## ÇIKTI FORMATI (SADECE JSON)
\\\`\\\`\\\`json
{
  "metaTitle": "50-60 karakter arası, SEO uyumlu başlık",
  "metaDescription": "150-160 karakter arası, ikna edici açıklama",
  "keywords": ["5-10 adet long-tail anahtar kelime"],
  "category": "Tespit edilen kategori",
  "targetAudience": "Hedef kitle açıklaması",
  "strategy": "Kullanılan SEO stratejisinin kısa açıklaması"
}
\\\`\\\`\\\`

## KRİTİK KURALLAR

1. Kesinlikle 50-60 karakter arası meta başlık yaz
2. Kesinlikle 150-160 karakter arası meta açıklama yaz  
3. Marka "| Ezmeo" olarak MUTLAKA sona eklensin
4. CTA (Call-to-Action) MUTLAKA olsun
5. Türkçe karakterleri doğru kullan (ı, İ, ş, ç, ö, ğ, ü)
6. Rakip analizi yap, farklılaştırıcı özellikleri vurgula
7. SADECE JSON çıktısı ver, başka açıklama EKLEME`;
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

    return NextResponse.json({
      success: true,
      metaTitle: aiResponse.metaTitle,
      metaDescription: aiResponse.metaDescription,
      keywords: aiResponse.keywords || [],
      category: aiResponse.category || category || "belirsiz",
      targetAudience: aiResponse.targetAudience || "",
      strategy: aiResponse.strategy || "",
      source: "gemini_ai"
    });

  } catch (error: any) {
    console.error("AI SEO Generation Error:", error);
    
    return NextResponse.json({
      success: false,
      error: `AI SEO uzmanı şu anda çalışamıyor: ${error.message}`,
      hint: "Lütfen daha sonra tekrar deneyin veya manuel giriş yapın"
    }, { status: 500 });
  }
}
