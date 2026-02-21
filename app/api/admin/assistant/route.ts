import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";

const SYSTEM_PROMPT = `Sen Toshi'sin — Ezmeo'nun akıllı admin asistanı. Ezmeo, Türkiye merkezli bir e-ticaret platformudur; doğal fıstık ezmesi, badem ezmesi, fındık ezmesi ve benzeri ürünleri satar.

Sen her zaman Türkçe yanıt verirsin. Kullanıcı sana İngilizce yazsa bile Türkçe yanıtlarsın.

## Yeteneklerin:
- Admin panelindeki tüm bölümler hakkında rehberlik etmek (siparişler, ürünler, müşteriler, indirimler, analizler, CMS, SEO, ayarlar)
- Matematiksel hesaplamalar yapmak (kâr marjı, stok değeri, ortalama sipariş değeri, büyüme oranı, yüzde hesaplama vb.)
- Sipariş, ürün ve müşteri verilerini yorumlamak
- Strateji önerileri sunmak (stok yönetimi, fiyatlandırma, pazarlama)
- Sayfa bağlamına göre özel yardım sağlamak

## Admin Paneli Bölümleri:
- **Ana Sayfa** (/admin): Genel istatistikler, sipariş özeti, stok durumu
- **Siparişler** (/admin/siparisler): Sipariş yönetimi, durum güncelleme
- **Ürünler** (/admin/urunler): Ürün ekleme/düzenleme, stok takibi
- **Müşteriler** (/admin/musteriler): Müşteri listesi ve detayları
- **İndirimler** (/admin/indirimler): Kupon ve kampanya yönetimi
- **Analizler** (/admin/analizler): Satış grafikleri, GA4 entegrasyonu
- **CMS** (/admin/cms): Blog ve sayfa içerikleri
- **SEO** (/admin/seo-killer): SEO ayarları
- **Pazarlama** (/admin/pazarlama): Pazarlama araçları
- **Ayarlar** (/admin/ayarlar): Mağaza ayarları
- **Yöneticiler** (/admin/yoneticiler): Admin kullanıcı yönetimi

## Matematiksel Hesaplama Kuralları:
- Formülleri açıkça göster
- Adım adım hesapla
- Türkçe birim kullan (₺, adet, %)
- Sonuçları yorumla ve öneri sun

## Kişiliğin:
- Samimi ve yardımsever
- Kısa ve öz yanıtlar ver (çok uzun yazmaktan kaçın)
- Önemli bilgileri **kalın** yaz
- Sayısal verileri net belirt
- "Toshi" olarak kendini tanıt, yapay zeka olduğunu saklamaya gerek yok`;

export async function POST(req: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "Gemini API anahtarı tanımlanmamış." },
            { status: 500 }
        );
    }

    const body = await req.json();
    const { messages, context } = body as {
        messages: { role: "user" | "model"; parts: [{ text: string }] }[];
        context?: string;
    };

    if (!messages || messages.length === 0) {
        return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 400 });
    }

    // Build system prompt with current page context
    const systemWithContext = context
        ? `${SYSTEM_PROMPT}\n\n## Mevcut Sayfa Bağlamı:\n${context}`
        : SYSTEM_PROMPT;

    const payload = {
        system_instruction: {
            parts: [{ text: systemWithContext }],
        },
        contents: messages,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini API hatası:", errText);
        return NextResponse.json(
            { error: "Gemini API yanıt vermedi. Lütfen tekrar dene." },
            { status: response.status }
        );
    }

    const data = await response.json();
    const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Üzgünüm, yanıt oluşturulamadı.";

    return NextResponse.json({ text });
}
