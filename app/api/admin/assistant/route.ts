import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const MAX_FUNCTION_CALLS = 3; // Prevent infinite loops

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sen Toshi'sin — Ezmeo'nun akıllı admin asistanı. Ezmeo, Türkiye merkezli bir e-ticaret platformudur; doğal fıstık ezmesi, badem ezmesi, fındık ezmesi ve benzeri ürünleri satar.

Sen her zaman Türkçe yanıt verirsin. Kullanıcı sana İngilizce yazsa bile Türkçe yanıtlarsın.

## Yeteneklerin:
- Admin panelindeki tüm bölümler hakkında rehberlik etmek (siparişler, ürünler, müşteriler, indirimler, analizler, CMS, SEO, ayarlar)
- Matematiksel hesaplamalar yapmak (kâr marjı, stok değeri, ortalama sipariş değeri, büyüme oranı, yüzde hesaplama vb.)
- Gerçek zamanlı verileri çekmek için fonksiyonlarını kullanarak sipariş, ürün ve müşteri bilgilerine erişmek
- Strateji önerileri sunmak (stok yönetimi, fiyatlandırma, pazarlama)
- Sayfa bağlamına göre özel yardım sağlamak
- Birden fazla veri kaynağını birleştirerek kapsamlı analizler yapmak

## Önemli Kurallar:
- Veri gereken sorularda MUTLAKA ilgili fonksiyonu çağır, tahmin yapma
- Birden fazla veri kaynağı gerektiren sorularda gerekli tüm fonksiyonları sırayla çağır
- Fonksiyondan gelen verileri doğal dilde, anlaşılır şekilde sun
- Matematiksel hesaplamalarda formülü göster ve adım adım hesapla
- Türkçe birim kullan (₺, adet, %)
- Kısa ve öz yanıtlar ver, gereksiz uzatma
- Önemli bilgileri **kalın** yaz
- Liste kullanarak verileri düzenli göster
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
            "Ürün istatistiklerini getirir: toplam ürün sayısı, düşük stoklu ürünler (stok < 10 olan), aktif/pasif ürün sayısı, toplam stok değeri. 'Kaç ürünüm var?', 'Düşük stok', 'Stok durumu' gibi sorularda kullan.",
        parameters: {
            type: "object" as const,
            properties: {},
        },
    },
    {
        name: "search_products",
        description:
            "İsme göre ürün arar. Ürün adı, fiyat, stok ve kategori bilgisi döner. 'X ürünü bul', 'fıstık ezmesi var mı?', 'bu ürünün fiyatı' gibi sorularda kullan.",
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
    {
        name: "get_dashboard_summary",
        description:
            "Tüm mağaza için kapsamlı özet getirir: siparişler + ürünler + müşteriler birleşik. 'Günlük özet', 'Mağaza durumu', 'Genel durum', 'Dashboard özeti' gibi sorularda kullan. Birden fazla veri kaynağını tek seferde getirir.",
        parameters: {
            type: "object" as const,
            properties: {},
        },
    },
    {
        name: "get_categories",
        description:
            "Mağazadaki tüm ürün kategorilerini ve her kategorideki ürün sayısını listeler. 'Hangi kategoriler var?', 'Kategori listesi', 'Kategori bazlı ürün sayısı' gibi sorularda kullan.",
        parameters: {
            type: "object" as const,
            properties: {},
        },
    },
];

// ─── Internal API Callers ────────────────────────────────────────────────────
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
                const res = await fetch(`${BASE_URL}/api/orders?limit=5${status}`);
                const data = await res.json();
                if (!data.success || !data.orders?.length)
                    return "Sipariş bulunamadı.";
                const lines = data.orders.map(
                    (o: {
                        orderNumber: string;
                        shippingAddress?: {
                            firstName?: string;
                            lastName?: string;
                        };
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

                // Calculate total stock value
                let totalStockValue = 0;
                let totalStockCount = 0;
                products.forEach(
                    (p: { variants?: { price: number; stock: number }[] }) => {
                        p.variants?.forEach((v) => {
                            totalStockValue += (v.price || 0) * (v.stock || 0);
                            totalStockCount += v.stock || 0;
                        });
                    }
                );

                const lowStock = products.filter(
                    (p: { variants?: { stock: number; name: string }[] }) =>
                        p.variants?.some((v) => v.stock < 10)
                );

                let result = `Ürün İstatistikleri:
- Toplam ürün: ${total}
- Aktif: ${active}
- Pasif: ${total - active}
- Toplam stok: ${totalStockCount} adet
- Stok değeri: ₺${totalStockValue.toLocaleString("tr-TR")}
- Düşük stoklu: ${lowStock.length}`;

                if (lowStock.length > 0) {
                    const lowItems = lowStock.slice(0, 5).map(
                        (p: {
                            name: string;
                            variants?: { name: string; stock: number }[];
                        }) => {
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
                        variants?: {
                            name: string;
                            price: number;
                            stock: number;
                            original_price?: number;
                        }[];
                    }) => {
                        const v = p.variants?.[0];
                        const discount =
                            v?.original_price && v.original_price > v.price
                                ? ` (indirimli, eski: ₺${v.original_price})`
                                : "";
                        return `- ${p.name} | ${p.category || "?"} | ₺${v?.price || "?"} ${discount} | Stok: ${v?.stock ?? "?"}`;
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

            case "get_dashboard_summary": {
                // Fetch all data sources in parallel
                const [ordersRes, productsRes, customersRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/orders?stats=true`)
                        .then((r) => r.json())
                        .catch(() => null),
                    fetch(`${BASE_URL}/api/products?limit=100`)
                        .then((r) => r.json())
                        .catch(() => null),
                    fetch(`${BASE_URL}/api/customers?stats=true`)
                        .then((r) => r.json())
                        .catch(() => null),
                ]);

                const os = ordersRes?.stats || {};
                const products = productsRes?.products || [];
                const cs = customersRes?.stats || {};

                const totalProducts = products.length;
                const activeProducts = products.filter(
                    (p: { is_active: boolean }) => p.is_active
                ).length;
                const lowStockCount = products.filter(
                    (p: { variants?: { stock: number }[] }) =>
                        p.variants?.some((v) => v.stock < 10)
                ).length;

                let totalStockValue = 0;
                products.forEach(
                    (p: { variants?: { price: number; stock: number }[] }) => {
                        p.variants?.forEach((v) => {
                            totalStockValue += (v.price || 0) * (v.stock || 0);
                        });
                    }
                );

                return `📊 Mağaza Dashboard Özeti:

🛒 SİPARİŞLER:
- Toplam: ${os.total || 0} sipariş
- Bekleyen: ${os.pending || 0}
- İşleniyor: ${os.processing || 0}
- Kargoda: ${os.shipped || 0}
- Teslim edildi: ${os.delivered || 0}
- Toplam gelir: ₺${Number(os.totalRevenue || 0).toLocaleString("tr-TR")}

📦 ÜRÜNLER:
- Toplam: ${totalProducts} ürün (${activeProducts} aktif)
- Düşük stoklu: ${lowStockCount} ürün
- Stok değeri: ₺${totalStockValue.toLocaleString("tr-TR")}

👥 MÜŞTERİLER:
- Toplam: ${cs.total || 0} müşteri
- Bu ay yeni: ${cs.newThisMonth || 0}
- Toplam harcama: ₺${Number(cs.totalSpent || 0).toLocaleString("tr-TR")}`;
            }

            case "get_categories": {
                const res = await fetch(`${BASE_URL}/api/products?limit=100`);
                const data = await res.json();
                if (!data.success) return "Kategori bilgileri alınamadı.";
                const products = data.products || [];

                const categoryMap = new Map<string, number>();
                products.forEach((p: { category?: string }) => {
                    const cat = p.category || "Kategorisiz";
                    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
                });

                const sorted = [...categoryMap.entries()].sort(
                    (a, b) => b[1] - a[1]
                );
                const lines = sorted.map(
                    ([cat, count]) => `- ${cat}: ${count} ürün`
                );

                return `Kategoriler (${sorted.length} kategori, ${products.length} toplam ürün):\n${lines.join("\n")}`;
            }

            default:
                return `Bilinmeyen fonksiyon: ${name}`;
        }
    } catch (err) {
        console.error(`Function execution error (${name}):`, err);
        return `${name} çalıştırılırken hata oluştu.`;
    }
}

// ─── POST Handler (Multi-function loop support) ──────────────────────────────
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

        const trimmedMessages = messages.slice(-10);

        const systemWithContext = context
            ? `${SYSTEM_PROMPT}\n\n## Mevcut Sayfa Bağlamı:\n${context}`
            : SYSTEM_PROMPT;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        // Build the evolving contents array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let contents: any[] = [...trimmedMessages];
        let finalText = "";

        // ── Multi-function calling loop ──
        for (let turn = 0; turn < MAX_FUNCTION_CALLS + 1; turn++) {
            const payload = {
                system_instruction: {
                    parts: [{ text: systemWithContext }],
                },
                contents,
                tools: [{ function_declarations: FUNCTION_DECLARATIONS }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            };

            const response = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Gemini API hatası:", response.status, errText);
                return NextResponse.json(
                    {
                        error: `Gemini API hatası (${response.status}). Lütfen tekrar dene.`,
                    },
                    { status: 500 }
                );
            }

            const data = await response.json();
            const candidate = data.candidates?.[0];
            const content = candidate?.content;
            const parts = content?.parts || [];

            // Check for function call
            const functionCallPart = parts.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (p: any) => p.functionCall
            );

            if (functionCallPart?.functionCall) {
                const { name, args } = functionCallPart.functionCall;
                console.log(`[Toshi] Function call #${turn + 1}: ${name}`, args);

                const functionResult = await executeFunction(name, args || {});
                console.log(
                    `[Toshi] Result: ${functionResult.substring(0, 100)}...`
                );

                // Append the model's function call + function response to contents
                contents = [
                    ...contents,
                    {
                        role: "model",
                        parts: [{ functionCall: { name, args: args || {} } }],
                    },
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
                ];

                // If this was the last allowed function call, break
                if (turn >= MAX_FUNCTION_CALLS - 1) {
                    finalText = functionResult;
                    break;
                }

                // Otherwise, continue the loop — Gemini will see the result and
                // might call another function or give a text response
                continue;
            }

            // Normal text response — done!
            const textPart = parts.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (p: any) => p.text
            );
            finalText = textPart?.text ?? "Üzgünüm, yanıt oluşturulamadı.";
            break;
        }

        return NextResponse.json({ text: finalText });
    } catch (err) {
        console.error("Toshi API genel hata:", err);
        return NextResponse.json(
            { error: "Beklenmeyen bir hata oluştu. Lütfen tekrar dene." },
            { status: 500 }
        );
    }
}
