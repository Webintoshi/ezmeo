import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sen Toshi'sin — Ezmeo'nun akıllı admin asistanı. Ezmeo, Türkiye merkezli bir e-ticaret platformudur; doğal fıstık ezmesi, badem ezmesi, fındık ezmesi ve benzeri ürünleri satar.

Sen her zaman Türkçe yanıt verirsin. Kullanıcı sana İngilizce yazsa bile Türkçe yanıtlarsın.

## Yeteneklerin:
- Admin panelindeki tüm bölümler hakkında rehberlik etmek (siparişler, ürünler, müşteriler, indirimler, analizler, CMS, SEO, ayarlar)
- Matematiksel hesaplamalar yapmak (kâr marjı, stok değeri, ortalama sipariş değeri, büyüme oranı, yüzde hesaplama vb.)
- Gerçek zamanlı verileri çekmek için fonksiyonlarını kullanarak sipariş, ürün ve müşteri bilgilerine erişmek
- Strateji önerileri sunmak (stok yönetimi, fiyatlandırma, pazarlama)
- Sayfa bağlamına göre özel yardım sağlamak

## Önemli Kurallar:
- Veri gereken sorularda MUTLAKA ilgili fonksiyonu çağır, tahmin yapma
- Fonksiyondan gelen verileri doğal dilde, anlaşılır şekilde sun
- Matematiksel hesaplamalarda formülü göster ve adım adım hesapla
- Türkçe birim kullan (₺, adet, %)
- Kısa ve öz yanıtlar ver
- Önemli bilgileri **kalın** yaz
- "Toshi" olarak kendini tanıt`;

// ─── Function Declarations for Gemini ────────────────────────────────────────
const FUNCTION_DECLARATIONS = [
    {
        name: "get_order_stats",
        description:
            "Sipariş istatistiklerini getirir: toplam sipariş sayısı, bekleyen siparişler, toplam gelir, durum dağılımı. 'Kaç siparişim var?', 'Gelir ne kadar?', 'Bekleyen sipariş var mı?' gibi sorularda kullan.",
        parameters: {
            type: "object" as const,
            properties: {},
        },
    },
    {
        name: "get_recent_orders",
        description:
            "Son siparişleri listeler (en fazla 5). Sipariş numarası, müşteri adı, tutar ve tarih bilgisi döner. 'Son siparişler neler?', 'Son gelen siparişleri göster' gibi sorularda kullan.",
        parameters: {
            type: "object" as const,
            properties: {
                status: {
                    type: "string",
                    description:
                        "Opsiyonel. Filtre: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'",
                },
            },
        },
    },
    {
        name: "get_product_stats",
        description:
            "Ürün istatistiklerini getirir: toplam ürün sayısı, düşük stoklu ürünler (stok < 10 olan), aktif/pasif ürün sayısı. 'Kaç ürünüm var?', 'Düşük stok', 'Stok durumu' gibi sorularda kullan.",
        parameters: {
            type: "object" as const,
            properties: {},
        },
    },
    {
        name: "search_products",
        description:
            "İsme göre ürün arar. Ürün adı, fiyat, stok ve kategori bilgisi döner. 'X ürünü bul', 'fıstık ezmesi var mı?' gibi sorularda kullan.",
        parameters: {
            type: "object" as const,
            properties: {
                query: {
                    type: "string",
                    description: "Aranacak ürün adı veya anahtar kelime",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "get_customer_stats",
        description:
            "Müşteri istatistiklerini getirir: toplam müşteri sayısı, yeni müşteriler, en çok alışveriş yapanlar. 'Kaç müşterim var?', 'Müşteri durumu' gibi sorularda kullan.",
        parameters: {
            type: "object" as const,
            properties: {},
        },
    },
];

// ─── Internal API Callers (Only fetches summaries, never full data) ──────────
async function executeFunction(
    name: string,
    args: Record<string, string>
): Promise<string> {
    try {
        switch (name) {
            case "get_order_stats": {
                const res = await fetch(`${BASE_URL}/api/orders?stats=true`);
                const data = await res.json();
                if (!data.success) return "Sipariş istatistikleri alınamadı.";
                const s = data.stats;
                return `Sipariş İstatistikleri:
- Toplam sipariş: ${s.total || 0}
- Bekleyen: ${s.pending || 0}
- İşleniyor: ${s.processing || 0}
- Kargoda: ${s.shipped || 0}
- Teslim edildi: ${s.delivered || 0}
- İptal: ${s.cancelled || 0}
- Toplam gelir: ₺${Number(s.totalRevenue || 0).toLocaleString("tr-TR")}`;
            }

            case "get_recent_orders": {
                const status = args.status ? `&status=${args.status}` : "";
                const res = await fetch(
                    `${BASE_URL}/api/orders?limit=5${status}`
                );
                const data = await res.json();
                if (!data.success || !data.orders?.length)
                    return "Sipariş bulunamadı.";
                const lines = data.orders.map(
                    (o: {
                        orderNumber: string;
                        shippingAddress?: { firstName?: string; lastName?: string };
                        total: number;
                        status: string;
                        createdAt: string;
                    }) =>
                        `- #${o.orderNumber} | ${o.shippingAddress?.firstName || "?"} ${o.shippingAddress?.lastName || ""} | ₺${Number(o.total).toLocaleString("tr-TR")} | ${o.status} | ${new Date(o.createdAt).toLocaleDateString("tr-TR")}`
                );
                return `Son ${data.orders.length} sipariş:\n${lines.join("\n")}`;
            }

            case "get_product_stats": {
                const res = await fetch(`${BASE_URL}/api/products?limit=100`);
                const data = await res.json();
                if (!data.success) return "Ürün bilgileri alınamadı.";
                const products = data.products || [];
                const total = products.length;
                const active = products.filter(
                    (p: { is_active: boolean }) => p.is_active
                ).length;
                const lowStock = products.filter(
                    (p: { variants?: { stock: number; name: string }[] }) =>
                        p.variants?.some((v) => v.stock < 10)
                );
                let result = `Ürün İstatistikleri:
- Toplam ürün: ${total}
- Aktif: ${active}
- Pasif: ${total - active}
- Düşük stoklu: ${lowStock.length}`;
                if (lowStock.length > 0) {
                    const lowItems = lowStock.slice(0, 5).map(
                        (p: { name: string; variants?: { name: string; stock: number }[] }) => {
                            const lv = p.variants?.find((v) => v.stock < 10);
                            return `  · ${p.name} (${lv?.name || "?"}: ${lv?.stock || 0} adet)`;
                        }
                    );
                    result += `\n\nDüşük stoklu ürünler:\n${lowItems.join("\n")}`;
                }
                return result;
            }

            case "search_products": {
                const query = args.query || "";
                const res = await fetch(
                    `${BASE_URL}/api/products?search=${encodeURIComponent(query)}`
                );
                const data = await res.json();
                if (!data.success || !data.products?.length)
                    return `"${query}" ile eşleşen ürün bulunamadı.`;
                const items = data.products.slice(0, 5).map(
                    (p: {
                        name: string;
                        category?: string;
                        variants?: { price: number; stock: number }[];
                    }) => {
                        const v = p.variants?.[0];
                        return `- ${p.name} | ${p.category || "?"} | ₺${v?.price || "?"} | Stok: ${v?.stock ?? "?"}`;
                    }
                );
                return `"${query}" araması (${data.products.length} sonuç):\n${items.join("\n")}`;
            }

            case "get_customer_stats": {
                const res = await fetch(`${BASE_URL}/api/customers?stats=true`);
                const data = await res.json();
                if (!data.success) return "Müşteri istatistikleri alınamadı.";
                const s = data.stats;
                return `Müşteri İstatistikleri:
- Toplam müşteri: ${s.total || 0}
- Bu ay yeni: ${s.newThisMonth || 0}
- Toplam harcama: ₺${Number(s.totalSpent || 0).toLocaleString("tr-TR")}`;
            }

            default:
                return `Bilinmeyen fonksiyon: ${name}`;
        }
    } catch (err) {
        console.error(`Function execution error (${name}):`, err);
        return `${name} çalıştırılırken hata oluştu.`;
    }
}

// ─── POST Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        if (!GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API anahtarı tanımlanmamış." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { messages, context } = body as {
            messages: {
                role: "user" | "model";
                parts: { text: string }[];
            }[];
            context?: string;
        };

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: "Mesaj bulunamadı." },
                { status: 400 }
            );
        }

        // Trim conversation to last 10 messages for token efficiency
        const trimmedMessages = messages.slice(-10);

        const systemWithContext = context
            ? `${SYSTEM_PROMPT}\n\n## Mevcut Sayfa Bağlamı:\n${context}`
            : SYSTEM_PROMPT;

        // ── First Gemini call (with function declarations) ──
        const payload = {
            system_instruction: {
                parts: [{ text: systemWithContext }],
            },
            contents: trimmedMessages,
            tools: [{ function_declarations: FUNCTION_DECLARATIONS }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        };

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        const firstResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!firstResponse.ok) {
            const errText = await firstResponse.text();
            console.error("Gemini API hatası:", firstResponse.status, errText);
            return NextResponse.json(
                { error: `Gemini API hatası (${firstResponse.status}). Lütfen tekrar dene.` },
                { status: 500 }
            );
        }

        const firstData = await firstResponse.json();
        const firstCandidate = firstData.candidates?.[0];
        const firstContent = firstCandidate?.content;
        const firstPart = firstContent?.parts?.[0];

        // ── Check if Gemini wants to call a function ──
        if (firstPart?.functionCall) {
            const { name, args } = firstPart.functionCall;
            console.log(`[Toshi] Function call: ${name}`, args);

            // Execute the function internally
            const functionResult = await executeFunction(name, args || {});
            console.log(`[Toshi] Function result (${functionResult.length} chars)`);

            // ── Second Gemini call (with function result) ──
            const secondPayload = {
                system_instruction: {
                    parts: [{ text: systemWithContext }],
                },
                contents: [
                    ...trimmedMessages,
                    // The model's function call
                    {
                        role: "model",
                        parts: [{ functionCall: { name, args: args || {} } }],
                    },
                    // The function result
                    {
                        role: "function",
                        parts: [
                            {
                                functionResponse: {
                                    name,
                                    response: { result: functionResult },
                                },
                            },
                        ],
                    },
                ],
                tools: [{ function_declarations: FUNCTION_DECLARATIONS }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            };

            const secondResponse = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(secondPayload),
            });

            if (!secondResponse.ok) {
                // Fallback: return the raw function result
                return NextResponse.json({ text: functionResult });
            }

            const secondData = await secondResponse.json();
            const text =
                secondData.candidates?.[0]?.content?.parts?.[0]?.text ??
                functionResult;

            return NextResponse.json({ text });
        }

        // ── Normal text response (no function call) ──
        const text =
            firstPart?.text ?? "Üzgünüm, yanıt oluşturulamadı.";

        return NextResponse.json({ text });
    } catch (err) {
        console.error("Toshi API genel hata:", err);
        return NextResponse.json(
            { error: "Beklenmeyen bir hata oluştu. Lütfen tekrar dene." },
            { status: 500 }
        );
    }
}
