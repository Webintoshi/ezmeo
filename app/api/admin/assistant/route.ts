import { NextRequest, NextResponse } from "next/server";
import { callAIWithFunctions } from "@/lib/ai";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const MAX_FUNCTION_CALLS = 3;

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sen Toshi'sin — Ezmeo'nun akıllı admin asistanı. Ezmeo, Türkiye merkezli bir e-ticaret platformudur; doğal fıstık ezmesi, badem ezmesi, fındık ezmesi ve benzeri ürünleri satar.

Sen her zaman Türkçe yanıt verirsin. Kullanıcı sana İngilizce yazsa bile Türkçe yanıtlarsın.

## Yeteneklerin:
- Admin panelindeki TÜM bölümler hakkında detaylı bilgi vermek
- Sipariş, ürün, müşteri, analitik, terk edilen sepet, kategori verilerine erişmek
- Matematiksel hesaplamalar yapmak (kâr marjı, stok değeri, ortalama sipariş, büyüme oranı vb.)
- Birden fazla veri kaynağını birleştirerek kapsamlı analizler yapmak
- Strateji önerileri sunmak

## Önemli Kurallar:
- Veri gereken sorularda MUTLAKA ilgili fonksiyonu çağır, tahmin yapma
- Birden fazla veri kaynağı gerektiren sorularda gerekli TÜM fonksiyonları sırayla çağır
- Ürün adları sorulduğunda list_all_products fonksiyonunu kullan
- Fonksiyondan gelen verileri doğal dilde, anlaşılır şekilde sun
- Türkçe birim kullan (₺, adet, %)
- Kısa ve öz yanıtlar ver
- Önemli bilgileri **kalın** yaz
- "Toshi" olarak kendini tanıt`;

// ─── Function Declarations ───────────────────────────────────────────────────
const FUNCTION_DECLARATIONS = [
    {
        name: "get_order_stats",
        description:
            "Sipariş istatistiklerini getirir: toplam sipariş, bekleyen, kargoda, teslim, iptal, toplam gelir. 'Kaç sipariş?', 'Gelir?', 'Bekleyen var mı?' sorularında kullan.",
        parameters: { type: "object" as const, properties: {} },
    },
    {
        name: "get_recent_orders",
        description:
            "Son siparişleri detaylı listeler (max 10). Sipariş no, müşteri adı, tutar, durum, tarih, ürünler. 'Son siparişler?', 'Bekleyen siparişleri göster' sorularında kullan.",
        parameters: {
            type: "object" as const,
            properties: {
                status: {
                    type: "string",
                    description:
                        "Opsiyonel filtre: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'",
                },
                limit: {
                    type: "string",
                    description: "Kaç sipariş gösterilsin (varsayılan 5, max 10)",
                },
            },
        },
    },
    {
        name: "list_all_products",
        description:
            "Tüm ürünleri isimleriyle birlikte listeler. Her ürünün adı, fiyatı, stoku, kategorisi, aktif/pasif durumu görünür. 'Ürünlerimi göster', 'Ürün adları', 'Hangi ürünler var?', 'Tüm ürünleri listele' sorularında kullan.",
        parameters: { type: "object" as const, properties: {} },
    },
    {
        name: "get_product_stats",
        description:
            "Ürün istatistikleri: toplam/aktif/pasif sayı, düşük stoklu ürünler (stok<10) isimleriyle, toplam stok adedi, toplam stok değeri (₺). 'Stok durumu', 'Düşük stok uyarı', 'Kaç ürün?' sorularında kullan.",
        parameters: { type: "object" as const, properties: {} },
    },
    {
        name: "search_products",
        description:
            "İsme göre ürün arar. Ürün adı, fiyat, stok, kategori, indirim durumu döner. 'X ürünü bul', 'fıstık ezmesi var mı?', 'bu ürünün fiyatı' sorularında kullan.",
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
            "Müşteri istatistikleri: toplam müşteri, bu ay yeni, toplam harcama. 'Kaç müşterim var?', 'Yeni müşteri?' sorularında kullan.",
        parameters: { type: "object" as const, properties: {} },
    },
    {
        name: "get_dashboard_summary",
        description:
            "Mağazanın tam özeti: siparişler + ürünler + müşteriler tek seferde. 'Mağaza özeti', 'Günlük özet', 'Genel durum', 'Dashboard' sorularında kullan.",
        parameters: { type: "object" as const, properties: {} },
    },
    {
        name: "get_categories",
        description:
            "Tüm ürün kategorilerini ve her kategorideki ürün sayısını listeler. 'Kategoriler?', 'Hangi kategoriler var?' sorularında kullan.",
        parameters: { type: "object" as const, properties: {} },
    },
    {
        name: "get_abandoned_carts",
        description:
            "Terk edilen sepetleri listeler: müşteri bilgileri, ürünler, tutar, tarih. 'Terk edilen sepetler', 'Sepet terk oranı', 'Kayıp müşteriler' sorularında kullan.",
        parameters: { type: "object" as const, properties: {} },
    },
    {
        name: "get_analytics",
        description:
            "Analitik verileri: gelir, sipariş sayısı, ortalama sipariş değeri, dönüşüm oranı, büyüme trendi, terk edilen sepet istatistikleri. 'Analiz', 'Gelir trendi', 'Dönüşüm oranı', 'Büyüme?' sorularında kullan.",
        parameters: {
            type: "object" as const,
            properties: {
                timeRange: {
                    type: "string",
                    description:
                        "Zaman aralığı: 'today' (bugün), 'week' (7 gün), 'month' (30 gün), 'year' (365 gün). Varsayılan: 'week'",
                },
            },
        },
    },
    {
        name: "get_order_details",
        description:
            "Tek bir siparişin detaylarını getirir: ürünler, müşteri, adres, ödeme bilgileri. Sipariş numarası veya ID ile aranır. 'Şu siparişin detayı?' sorularında kullan.",
        parameters: {
            type: "object" as const,
            properties: {
                orderNumber: {
                    type: "string",
                    description: "Sipariş numarası (ör: ORD-001 veya 001)",
                },
            },
            required: ["orderNumber"],
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
            // ── Sipariş İstatistikleri ──
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

            // ── Son Siparişler ──
            case "get_recent_orders": {
                const status = args.status ? `&status=${args.status}` : "";
                const limit = args.limit ? parseInt(args.limit) : 5;
                const safeLimit = Math.min(Math.max(limit, 1), 10);
                const res = await fetch(
                    `${BASE_URL}/api/orders?limit=${safeLimit}${status}`
                );
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
                        items?: { name: string; quantity: number }[];
                    }) => {
                        const itemsSummary = o.items
                            ? o.items
                                .map((i) => `${i.name} x${i.quantity}`)
                                .join(", ")
                            : "";
                        return `- #${o.orderNumber} | ${o.shippingAddress?.firstName || "?"} ${o.shippingAddress?.lastName || ""} | ₺${Number(o.total).toLocaleString("tr-TR")} | ${o.status} | ${new Date(o.createdAt).toLocaleDateString("tr-TR")}${itemsSummary ? ` | Ürünler: ${itemsSummary}` : ""}`;
                    }
                );
                return `Son ${data.orders.length} sipariş:\n${lines.join("\n")}`;
            }

            // ── Tüm Ürünleri Listele (İSİMLERİYLE) ──
            case "list_all_products": {
                const res = await fetch(`${BASE_URL}/api/products?limit=100`);
                const data = await res.json();
                if (!data.success || !data.products?.length)
                    return "Hiç ürün bulunamadı.";
                const products = data.products;
                const lines = products.map(
                    (
                        p: {
                            name: string;
                            category?: string;
                            is_active: boolean;
                            variants?: {
                                name: string;
                                price: number;
                                stock: number;
                                original_price?: number;
                            }[];
                        },
                        i: number
                    ) => {
                        const v = p.variants?.[0];
                        const price = v?.price ? `₺${v.price}` : "?";
                        const stock = v?.stock ?? "?";
                        const discount =
                            v?.original_price && v.original_price > (v?.price || 0)
                                ? ` (indirimli, eski: ₺${v.original_price})`
                                : "";
                        const status = p.is_active ? "✅" : "❌";
                        const allVariants =
                            p.variants && p.variants.length > 1
                                ? ` [${p.variants.length} varyant]`
                                : "";
                        return `${i + 1}. ${status} ${p.name} | ${p.category || "Kategorisiz"} | ${price}${discount} | Stok: ${stock}${allVariants}`;
                    }
                );
                return `Tüm Ürünler (${products.length} adet):\n${lines.join("\n")}`;
            }

            // ── Ürün İstatistikleri ──
            case "get_product_stats": {
                const res = await fetch(`${BASE_URL}/api/products?limit=100`);
                const data = await res.json();
                if (!data.success) return "Ürün bilgileri alınamadı.";
                const products = data.products || [];
                const total = products.length;
                const active = products.filter(
                    (p: { is_active: boolean }) => p.is_active
                ).length;

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
                    (p: {
                        variants?: { stock: number; name: string }[];
                        name: string;
                    }) => p.variants?.some((v) => v.stock < 10)
                );

                let result = `Ürün İstatistikleri:
- Toplam ürün: ${total}
- Aktif: ${active}, Pasif: ${total - active}
- Toplam stok: ${totalStockCount} adet
- Stok değeri: ₺${totalStockValue.toLocaleString("tr-TR")}
- Düşük stoklu: ${lowStock.length} ürün`;

                if (lowStock.length > 0) {
                    const lowItems = lowStock.map(
                        (p: {
                            name: string;
                            variants?: { name: string; stock: number }[];
                        }) => {
                            const lowVariants = p.variants
                                ?.filter((v) => v.stock < 10)
                                .map((v) => `${v.name}: ${v.stock} adet`)
                                .join(", ");
                            return `  ⚠️ ${p.name} → ${lowVariants || "?"}`;
                        }
                    );
                    result += `\n\nDüşük Stoklu Ürünler:\n${lowItems.join("\n")}`;
                }
                return result;
            }

            // ── Ürün Arama ──
            case "search_products": {
                const query = args.query || "";
                const res = await fetch(
                    `${BASE_URL}/api/products?search=${encodeURIComponent(query)}`
                );
                const data = await res.json();
                if (!data.success || !data.products?.length)
                    return `"${query}" ile eşleşen ürün bulunamadı.`;
                const items = data.products.slice(0, 10).map(
                    (p: {
                        name: string;
                        category?: string;
                        is_active: boolean;
                        variants?: {
                            name: string;
                            price: number;
                            stock: number;
                            original_price?: number;
                        }[];
                    }) => {
                        const variants = p.variants
                            ?.map((v) => {
                                const discount =
                                    v.original_price && v.original_price > v.price
                                        ? ` (indirimli, eski: ₺${v.original_price})`
                                        : "";
                                return `  · ${v.name}: ₺${v.price}${discount} | Stok: ${v.stock}`;
                            })
                            .join("\n");
                        return `- ${p.is_active ? "✅" : "❌"} ${p.name} | ${p.category || "?"}\n${variants || "  · Varyant yok"}`;
                    }
                );
                return `"${query}" araması (${data.products.length} sonuç):\n${items.join("\n")}`;
            }

            // ── Müşteri İstatistikleri ──
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

            // ── Dashboard Özeti (Hepsi Bir Arada) ──
            case "get_dashboard_summary": {
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

                // Product names list
                const productNames = products
                    .slice(0, 20)
                    .map(
                        (p: { name: string; is_active: boolean }, i: number) =>
                            `  ${i + 1}. ${p.is_active ? "✅" : "❌"} ${p.name}`
                    )
                    .join("\n");

                return `📊 Mağaza Dashboard Özeti:

🛒 SİPARİŞLER:
- Toplam: ${os.total || 0} sipariş
- Bekleyen: ${os.pending || 0} | İşleniyor: ${os.processing || 0}
- Kargoda: ${os.shipped || 0} | Teslim: ${os.delivered || 0}
- Toplam gelir: ₺${Number(os.totalRevenue || 0).toLocaleString("tr-TR")}

📦 ÜRÜNLER (${totalProducts} adet):
${productNames}
- Düşük stoklu: ${lowStockCount} ürün
- Stok değeri: ₺${totalStockValue.toLocaleString("tr-TR")}

👥 MÜŞTERİLER:
- Toplam: ${cs.total || 0} müşteri
- Bu ay yeni: ${cs.newThisMonth || 0}
- Toplam harcama: ₺${Number(cs.totalSpent || 0).toLocaleString("tr-TR")}`;
            }

            // ── Kategoriler ──
            case "get_categories": {
                const res = await fetch(`${BASE_URL}/api/categories`);
                const data = await res.json();
                if (!data.success && !data.categories) {
                    // Fallback: extract from products
                    const pRes = await fetch(`${BASE_URL}/api/products?limit=100`);
                    const pData = await pRes.json();
                    const products = pData?.products || [];
                    const catMap = new Map<string, number>();
                    products.forEach((p: { category?: string }) => {
                        const cat = p.category || "Kategorisiz";
                        catMap.set(cat, (catMap.get(cat) || 0) + 1);
                    });
                    const sorted = [...catMap.entries()].sort((a, b) => b[1] - a[1]);
                    const lines = sorted.map(
                        ([cat, count]) => `- ${cat}: ${count} ürün`
                    );
                    return `Kategoriler (${sorted.length} kategori):\n${lines.join("\n")}`;
                }

                const categories = data.categories || [];
                if (categories.length === 0) return "Hiç kategori bulunamadı.";

                const lines = categories.map(
                    (c: {
                        name: string;
                        slug: string;
                        product_count?: number;
                        is_active: boolean;
                    }) =>
                        `- ${c.is_active ? "✅" : "❌"} ${c.name} (${c.slug}) ${c.product_count !== undefined ? `| ${c.product_count} ürün` : ""}`
                );
                return `Kategoriler (${categories.length} adet):\n${lines.join("\n")}`;
            }

            // ── Terk Edilen Sepetler ──
            case "get_abandoned_carts": {
                const res = await fetch(`${BASE_URL}/api/abandoned-carts?limit=20`);
                const data = await res.json();

                if (!data.success || !data.carts?.length)
                    return "Terk edilen sepet bulunamadı.";

                const carts = data.carts;
                const totalValue = carts.reduce(
                    (sum: number, c: { total: number }) => sum + (c.total || 0),
                    0
                );
                const recovered = carts.filter(
                    (c: { recovered: boolean }) => c.recovered
                ).length;

                const lines = carts.slice(0, 10).map(
                    (c: {
                        first_name?: string;
                        last_name?: string;
                        email?: string;
                        phone?: string;
                        total: number;
                        item_count: number;
                        status: string;
                        recovered: boolean;
                        created_at: string;
                        items?: { name: string; quantity: number }[];
                    }) => {
                        const name = [c.first_name, c.last_name]
                            .filter(Boolean)
                            .join(" ") || "Anonim";
                        const contact = c.email || c.phone || "?";
                        const items = c.items
                            ? c.items.map((i) => `${i.name}×${i.quantity}`).join(", ")
                            : `${c.item_count} ürün`;
                        const status = c.recovered ? "✅ Kurtarıldı" : `⏳ ${c.status}`;
                        return `- ${name} (${contact}) | ₺${Number(c.total).toLocaleString("tr-TR")} | ${items} | ${status} | ${new Date(c.created_at).toLocaleDateString("tr-TR")}`;
                    }
                );

                return `Terk Edilen Sepetler (${data.pagination?.total || carts.length} toplam):
- Toplam kayıp değer: ₺${totalValue.toLocaleString("tr-TR")}
- Kurtarılan: ${recovered}/${carts.length}
- Kurtarma oranı: %${carts.length > 0 ? Math.round((recovered / carts.length) * 100) : 0}

Detaylar:
${lines.join("\n")}`;
            }

            // ── Analitik Veriler ──
            case "get_analytics": {
                const timeRange = args.timeRange || "week";
                const res = await fetch(
                    `${BASE_URL}/api/analytics/dashboard?timeRange=${timeRange}`
                );
                const data = await res.json();
                if (data.error) return "Analitik verileri alınamadı.";

                const s = data.stats || {};
                const ac = data.abandonedCartStats || {};
                const timeLabels: Record<string, string> = {
                    today: "Bugün",
                    week: "Son 7 gün",
                    month: "Son 30 gün",
                    year: "Son 1 yıl",
                };

                let result = `📈 Analitik Raporu (${timeLabels[timeRange] || timeRange}):

💰 GELİR:
- Gelir: ₺${Number(s.revenue || 0).toLocaleString("tr-TR")} (${s.revenueChange > 0 ? "+" : ""}${s.revenueChange || 0}%)
- Sipariş: ${s.orders || 0} adet (${s.ordersChange > 0 ? "+" : ""}${s.ordersChange || 0}%)
- Ortalama sipariş: ₺${s.avgOrderValue || 0}

📊 PERFORMANS:
- Müşteri: ${s.customers || 0} (+${s.customersChange || 0} yeni)
- Dönüşüm oranı: %${s.conversionRate || 0} (${s.conversionChange > 0 ? "+" : ""}${s.conversionChange || 0}%)

🛒 TERK EDİLEN SEPETLER:
- Toplam: ${ac.totalCount || 0} sepet
- Kayıp değer: ₺${Number(ac.totalValue || 0).toLocaleString("tr-TR")}
- Kurtarılan: ${ac.recoveredCount || 0}
- Kurtarma oranı: %${ac.recoveryRate || 0}`;

                if (data.trendData?.length > 0) {
                    const trendLines = data.trendData
                        .slice(-7)
                        .map(
                            (t: { date: string; revenue: number; orders: number }) =>
                                `  ${t.date}: ₺${Number(t.revenue).toLocaleString("tr-TR")} (${t.orders} sipariş)`
                        );
                    result += `\n\n📅 TREND:\n${trendLines.join("\n")}`;
                }

                return result;
            }

            // ── Sipariş Detayı ──
            case "get_order_details": {
                const orderNum = args.orderNumber || "";
                // Try by order number first
                let res = await fetch(
                    `${BASE_URL}/api/orders?orderNumber=${encodeURIComponent(orderNum)}`
                );
                let data = await res.json();
                let order = data.order;

                // If not found, try by ID
                if (!order) {
                    res = await fetch(
                        `${BASE_URL}/api/orders?id=${encodeURIComponent(orderNum)}`
                    );
                    data = await res.json();
                    order = data.order;
                }

                if (!order) return `"${orderNum}" numaralı sipariş bulunamadı.`;

                const items = order.items
                    ?.map(
                        (i: {
                            name: string;
                            quantity: number;
                            price: number;
                            variant?: string;
                        }) =>
                            `  · ${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.quantity} = ₺${(i.price * i.quantity).toLocaleString("tr-TR")}`
                    )
                    .join("\n") || "  Ürün bilgisi yok";

                const addr = order.shippingAddress;
                const address = addr
                    ? `${addr.firstName || ""} ${addr.lastName || ""}, ${addr.address || ""}, ${addr.city || ""}`
                    : "Adres bilgisi yok";

                return `Sipariş Detayı — #${order.orderNumber}:
- Durum: ${order.status}
- Ödeme: ${order.paymentStatus || "?"} (${order.paymentMethod || "?"})
- Tarih: ${new Date(order.createdAt).toLocaleString("tr-TR")}

Ürünler:
${items}

- Alt toplam: ₺${Number(order.subtotal || 0).toLocaleString("tr-TR")}
- Kargo: ₺${Number(order.shippingCost || 0).toLocaleString("tr-TR")}
- İndirim: ₺${Number(order.discount || 0).toLocaleString("tr-TR")}
- TOPLAM: ₺${Number(order.total || 0).toLocaleString("tr-TR")}

Teslimat: ${address}
${order.notes ? `Not: ${order.notes}` : ""}`;
            }

            default:
                return `Bilinmeyen fonksiyon: ${name}`;
        }
    } catch (err) {
        console.error(`Function execution error (${name}):`, err);
        return `${name} çalıştırılırken hata oluştu.`;
    }
}

// ─── POST Handler (Multi-function loop via shared AI utility) ────────────────
export async function POST(req: NextRequest) {
    try {
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

        const finalText = await callAIWithFunctions({
            messages: trimmedMessages,
            functionDeclarations: FUNCTION_DECLARATIONS,
            systemPrompt: systemWithContext,
            executeFunction,
            maxFunctionCalls: MAX_FUNCTION_CALLS,
            temperature: 0.7,
            maxTokens: 4096,
        });

        return NextResponse.json({ text: finalText });
    } catch (err) {
        console.error("Toshi API genel hata:", err);
        return NextResponse.json(
            { error: "Beklenmeyen bir hata oluştu. Lütfen tekrar dene." },
            { status: 500 }
        );
    }
}
