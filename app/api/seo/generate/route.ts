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
  console.log("[Toshi] Raw AI response:", text.substring(0, 500));
  
  try {
    // Önce direkt JSON parse dene
    return JSON.parse(text.trim());
  } catch (e) {
    // Markdown code block içinde mi?
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (e2) {
        console.log("[Toshi] Code block parse failed");
      }
    }
    
    // Süslü parantezler arasını bul
    const curlyMatch = text.match(/\{[\s\S]*\}/);
    if (curlyMatch) {
      try {
        return JSON.parse(curlyMatch[0]);
      } catch (e3) {
        console.log("[Toshi] Curly brace extract failed");
      }
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
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
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

function buildSEOPrompt(name: string, category?: string, description?: string): string {
  return `Sen Toshi - 15 yillik deneyimli bir E-ticaret SEO uzmanisin.

URUN: ${name}
${category ? `Kategori: ${category}` : ''}
${description ? `Aciklama: ${description}` : ''}

GOREV: Bu urun icin Google SERP'da en yuksek tiklanma orani saglayacak meta baslik ve aciklama olustur.

KURALLAR:
1. Meta baslik: 50-60 karakter arasi (Google 60'ta keser)
2. Meta aciklama: 150-160 karakter arasi (Google 160'ta keser)  
3. Marka | Ezmeo olarak SONDA olmali
4. Urun neyse onu yaz: fistik ezmesi ise fistik, recel ise meyve
5. Kesinlikle karakter limitlerini asma

CIKTI FORMATI (SADECE JSON, baska hicbir sey yazma):
{
  "metaTitle": "50-60 karakter arasi baslik | Ezmeo",
  "metaDescription": "150-160 karakter arasi aciklama"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: "Urun adi zorunludur"
      }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY eksik"
      }, { status: 500 });
    }

    const prompt = buildSEOPrompt(name, category, description);
    const aiResponse = await callGeminiAPI(prompt);

    let title = aiResponse.metaTitle || "";
    let desc = aiResponse.metaDescription || "";

    // Hard limit enforcement
    if (title.length > 60) title = title.substring(0, 57) + "...";
    if (desc.length > 160) desc = desc.substring(0, 157) + "...";

    if (!title || !desc) {
      return NextResponse.json({
        success: false,
        error: "AI yaniti eksik"
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      metaTitle: title,
      metaDescription: desc,
      source: "toshi_ai"
    });

  } catch (error: any) {
    console.error("[Toshi] Error:", error);
    
    return NextResponse.json({
      success: false,
      error: `Toshi calisamiyor: ${error.message}`
    }, { status: 500 });
  }
}
