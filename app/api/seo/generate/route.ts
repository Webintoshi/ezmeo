import { NextRequest, NextResponse } from "next/server";

const TOSHI_API_KEY = process.env.TOSHI_AI_API_KEY || "";

interface SEOGenerationRequest {
    type: "product" | "category" | "page";
    name: string;
    description?: string;
    category?: string;
    keywords?: string[];
}

export async function POST(request: NextRequest) {
    try {
        const body: SEOGenerationRequest = await request.json();
        const { type, name, description, category, keywords } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Name is required" },
                { status: 400 }
            );
        }

        // Build the SEO expert prompt
        const systemPrompt = `Sen Türkiye'nin en iyi SEO uzmanısın. E-ticaret siteleri için meta başlık ve açıklama yazıyorsun.

KURALLAR:
1. Meta başlık 30-60 karakter arasında olmalı
2. Meta açıklama 120-160 karakter arasında olmalı
3. Anahtar kelimeler doğal şekilde kullanılmalı
4. Türkçe karakterler doğru kullanılmalı
5. Marka adı "Ezmeo" her zaman başlıkta yer almalı
6. Call-to-action içermeli (örn: "Hemen sipariş verin", "Keşfedin")
7. Benzersiz ve dikkat çekici olmalı
8. Google arama sonuçlarında tıklanma oranını artıracak şekilde yazılmalı

YANITINI SADECE JSON FORMATINDA VER:
{
  "metaTitle": "...",
  "metaDescription": "..."
}`;

        let userPrompt = "";

        if (type === "product") {
            userPrompt = `Aşağıdaki ürün için SEO optimize meta başlık ve açıklama oluştur:

Ürün Adı: ${name}
${description ? `Ürün Açıklaması: ${description}` : ""}
${category ? `Kategori: ${category}` : ""}
${keywords?.length ? `Anahtar Kelimeler: ${keywords.join(", ")}` : ""}

Bu bir doğal gıda / kuruyemiş ezmesi ürünüdür. Sağlıklı yaşam, doğal beslenme ve protein açısından zenginlik vurgulansın.`;
        } else if (type === "category") {
            userPrompt = `Aşağıdaki kategori sayfası için SEO optimize meta başlık ve açıklama oluştur:

Kategori Adı: ${name}
${description ? `Açıklama: ${description}` : ""}

Bu bir e-ticaret sitesinin kategori sayfasıdır. Koleksiyon sayfası olarak düşün.`;
        } else {
            userPrompt = `Aşağıdaki sayfa için SEO optimize meta başlık ve açıklama oluştur:

Sayfa Adı: ${name}
${description ? `Sayfa Açıklaması: ${description}` : ""}

Bu statik bir sayfa (${name}).`;
        }

        // Call AI API (Azure OpenAI compatible format)
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOSHI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("AI API Error:", errorText);

            // Fallback to template-based generation
            const fallbackResult = generateFallbackMeta(type, name, description);
            return NextResponse.json({
                success: true,
                ...fallbackResult,
                source: "fallback"
            });
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || "";

        // Parse JSON response
        try {
            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return NextResponse.json({
                    success: true,
                    metaTitle: parsed.metaTitle || "",
                    metaDescription: parsed.metaDescription || "",
                    source: "ai"
                });
            }
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
        }

        // Fallback if parsing fails
        const fallbackResult = generateFallbackMeta(type, name, description);
        return NextResponse.json({
            success: true,
            ...fallbackResult,
            source: "fallback"
        });

    } catch (error) {
        console.error("SEO Generation Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate SEO content" },
            { status: 500 }
        );
    }
}

function generateFallbackMeta(type: string, name: string, description?: string) {
    let metaTitle = "";
    let metaDescription = "";

    if (type === "product") {
        metaTitle = `${name} | Doğal & Katkısız | Ezmeo`;
        metaDescription = `${name} - ${description?.slice(0, 60) || "Doğal ve sağlıklı"}... Türkiye'nin en kaliteli doğal ezmeleri. %100 doğal. Hemen sipariş verin!`;
    } else if (type === "category") {
        metaTitle = `${name} Çeşitleri | Ezmeo`;
        metaDescription = `En kaliteli ${name.toLowerCase()} çeşitleri. %100 doğal, şekersiz, katkısız. Ücretsiz kargo ile kapınıza gelsin!`;
    } else {
        metaTitle = `${name} | Ezmeo`;
        metaDescription = `${name} - Ezmeo doğal gıda markası. Sağlıklı ve lezzetli ürünlerle tanışın.`;
    }

    // Truncate to limits
    metaTitle = metaTitle.slice(0, 60);
    metaDescription = metaDescription.slice(0, 160);

    return { metaTitle, metaDescription };
}
