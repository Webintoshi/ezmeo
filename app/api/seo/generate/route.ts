import { NextRequest, NextResponse } from "next/server";
import { buildSEOPrompt, buildCategorySEOPrompt, buildPageSEOPrompt, generateFallbackSEO } from "@/lib/seo-prompts";

// Z.AI API Configuration
const ZAI_API_KEY = process.env.ZAI_API_KEY || "";
const ZAI_BASE_URL = process.env.ZAI_BASE_URL || "https://api.z.ai";
const ZAI_MODEL = process.env.ZAI_MODEL || "glm-4.7";

interface SEOGenerationRequest {
    type: "product" | "category" | "page";
    name: string;
    description?: string;
    shortDescription?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    features?: string[];
    schemaType?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: SEOGenerationRequest = await request.json();
        const { 
            type, 
            name, 
            description, 
            shortDescription,
            category, 
            subcategory,
            tags,
            features,
            schemaType 
        } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Name is required" },
                { status: 400 }
            );
        }

        // Build dynamic prompt based on type
        let prompt: string;
        
        if (type === "product") {
            prompt = buildSEOPrompt({
                name,
                description,
                shortDescription,
                category,
                subcategory,
                tags,
                features,
                brand: "Ezmeo"
            });
        } else if (type === "category") {
            prompt = buildCategorySEOPrompt(name, description);
        } else {
            // page type
            prompt = buildPageSEOPrompt(name, schemaType || "WebPage", description);
        }

        // Use Z.AI GLM-4.7 for generation
        let aiResult: { metaTitle: string; metaDescription: string; keywords: string[]; rationale?: string } | null = null;
        let source = "";

        if (ZAI_API_KEY) {
            try {
                const zaiResult = await callZAIGeneration(prompt);
                if (zaiResult) {
                    aiResult = zaiResult;
                    source = "zai_glm-4.7";
                }
            } catch (error) {
                console.warn("Z.AI GLM-4.7 failed:", error);
            }
        }

        // Template fallback
        if (!aiResult) {
            const fallback = generateFallbackSEO(name, category);
            aiResult = {
                metaTitle: fallback.metaTitle,
                metaDescription: fallback.metaDescription,
                keywords: fallback.keywords,
                rationale: "Template-based fallback (Z.AI unavailable)"
            };
            source = "template_fallback";
        }

        return NextResponse.json({
            success: true,
            metaTitle: aiResult.metaTitle,
            metaDescription: aiResult.metaDescription,
            keywords: aiResult.keywords,
            rationale: aiResult.rationale,
            source,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("SEO Generation Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate SEO content" },
            { status: 500 }
        );
    }
}

async function callZAIGeneration(prompt: string): Promise<{ metaTitle: string; metaDescription: string; keywords: string[]; rationale?: string } | null> {
    // Z.AI GLM-4.7 endpoint
    const endpoint = `${ZAI_BASE_URL}/api/paas/v4/chat/completions`;
    
    console.log("Calling Z.AI:", { endpoint, model: ZAI_MODEL });
    
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ZAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: ZAI_MODEL, // glm-4.7
            messages: [
                {
                    role: "system",
                    content: "You are an expert SEO specialist. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Z.AI API Error:", response.status, errorText);
        return null;
    }

    const data = await response.json();
    console.log("Z.AI Response:", JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        console.error("Empty Z.AI response");
        return null;
    }

    // Parse JSON response
    try {
        const parsed = JSON.parse(content);
        
        if (parsed.metaTitle && parsed.metaDescription) {
            return {
                metaTitle: parsed.metaTitle,
                metaDescription: parsed.metaDescription,
                keywords: parsed.keywords || parsed.analysis?.mainKeywords || [],
                rationale: parsed.rationale || parsed.analysis?.rationale
            };
        }
        
        console.error("Unexpected Z.AI response structure:", parsed);
        return null;
    } catch (parseError) {
        console.error("Failed to parse Z.AI response:", parseError, "Content:", content);
        return null;
    }
}
