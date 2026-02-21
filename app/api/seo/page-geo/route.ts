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

function extractJSON(text: string): any {
  console.log("[Toshi Page GEO] Raw AI response:", text.substring(0, 500));
  
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e2) {}
    }
    
    const curlyMatch = text.match(/\{[\s\S]*\}/);
    if (curlyMatch) {
      try {
        return JSON.parse(curlyMatch[0]);
      } catch (e3) {}
    }
  }
  
  return null;
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

  const parsed = extractJSON(text);
  if (!parsed) {
    throw new Error(`Invalid JSON response. Raw: ${text.substring(0, 200)}`);
  }

  return parsed;
}

function buildPageGEOPrompt(name: string, url?: string, description?: string): string {
  return `Sen Toshi - 15 yillik deneyimli bir GEO (Generative Engine Optimization) ve LLM Optimization uzmanisisin.

SAYFA: ${name}
${url ? `URL: ${url}` : ''}
${description ? `Aciklama: ${description}` : ''}

GOREV: Bu SAYFA icin ChatGPT, Perplexity, Claude ve diger AI sistemlerinin dogru anlayip onerebilmesi icin "Onemli Cikarimlar" (Key Takeaways) olustur.

SAYFA OLDUGUNU UNUTMA! Bu bir urun veya kategori degil, bir bilgi/icerik sayfasi (Hakkimizda, Iletisim, vb.).

NEDIR BU?
GEO/LLM Optimizasyonu, AI sistemlerinin sayfayi dogru anlamasini saglar. Ornegin bir kullanici "Ezmeo hakkinda bilgi" dediginde AI bu sayfayi onerebilsin.

KURALLAR:
1. Her cikarim 1 cumle, net ve oz olmali
2. 5 ile 8 arasi cikarim olmali
3. Cikarimlar SEO anahtar kelimeleri icermeli
4. Sayfanin ESSIZ degerini vurgula
5. AI sistemlerinin context'ini zenginlestirecek bilgiler

SAYFA ICIN CIKARIM TIPLERI:
- Bu sayfa ne hakkindadir?
- Bu sayfada hangi bilgiler bulunur?
- Bu sayfa kimin icin faydalidir?
- Bu sayfanin amaci nedir?
- Bu sayfa neden ziyaret edilmeli?
- Bu sayfada hangi konular ele alinir?
- Bu sayfa markanin hangi yonunu yanstirir?

CIKTI FORMATI (SADECE JSON):
{
  "takeaways": [
    "Cikarim 1",
    "Cikarim 2", 
    "Cikarim 3",
    "Cikarim 4",
    "Cikarim 5"
  ]
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, description } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: "Sayfa adi zorunludur"
      }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY eksik"
      }, { status: 500 });
    }

    const prompt = buildPageGEOPrompt(name, url, description);
    const aiResponse = await callGeminiAPI(prompt);

    if (!aiResponse.takeaways || !Array.isArray(aiResponse.takeaways) || aiResponse.takeaways.length === 0) {
      return NextResponse.json({
        success: false,
        error: "AI gecerli cikarim olusturamadi"
      }, { status: 500 });
    }

    // Validate takeaways
    const validTakeaways = aiResponse.takeaways.filter((item: any) => 
      typeof item === 'string' && item.length > 10
    );

    if (validTakeaways.length === 0) {
      return NextResponse.json({
        success: false,
        error: "AI gecerli format dondurmedi"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      takeaways: validTakeaways,
      source: "toshi_page_geo"
    });

  } catch (error: any) {
    console.error("[Toshi Page GEO] Error:", error);
    
    return NextResponse.json({
      success: false,
      error: `Toshi GEO olusturamiyor: ${error.message}`
    }, { status: 500 });
  }
}
