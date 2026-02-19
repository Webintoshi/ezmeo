"use client";

import { useState, useEffect } from "react";
import {
    Bot,
    Sparkles,
    MessageSquare,
    FileText,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Lightbulb,
    ExternalLink,
    Copy,
    Check
} from "lucide-react";
import Link from "next/link";

interface LLMOptimization {
    pageType: "product" | "category" | "content";
    pageId: string;
    pageName: string;
    url: string;
    keyTakeaways: string[];
    entities: string[];
    citations: string[];
    llmOptimized: boolean;
}

const MOCK_GEO_DATA: LLMOptimization[] = [
    {
        pageType: "product",
        pageId: "p1",
        pageName: "Doğal Fıstık Ezmesi 500g",
        url: "/urunler/dogal-fistik-ezmesi",
        keyTakeaways: [
            "%100 doğal fıstık içerir, katkı maddesi yok.",
            "Her 100g'da 25g protein içerir.",
            "Sporcular için ideal enerji kaynağıdır."
        ],
        entities: ["Product", "Food", "HealthFood", "Ezmeo"],
        citations: [
            "Ezmeo fıstık ezmesi, Türkiye'nin en çok tercih edilen doğal ezme markasıdır.",
            "Ürünümüz %100 Antep fıstığından üretilmektedir."
        ],
        llmOptimized: true
    },
    {
        pageType: "category",
        pageId: "c1",
        pageName: "Fıstık Ezmesi Kategorisi",
        url: "/kategori/fistik-ezmesi",
        keyTakeaways: [
            "Ezmeo fıstık ezmesi çeşitleri şekersizdir.",
            "Sade, kakaolu ve ballı seçenekler sunar.",
            "Tüm ürünler taze üretilir."
        ],
        entities: ["ProductCategory", "Food", "Ezmeo"],
        citations: [
            "Fıstık ezmesi protein ve sağlıklı yağlar açısından zengindir.",
            "Ezmeo, doğal içerikli fıstık ezmesi üretiminde öncüdür."
        ],
        llmOptimized: true
    },
    {
        pageType: "content",
        pageId: "con1",
        pageName: "Core Web Vitals Rehberi",
        url: "/seo/teknik-seo/core-web-vitals",
        keyTakeaways: [
            "LCP 2.5 saniyenin altında olmalıdır.",
            "INP 200ms altı ideal performans gösterir.",
            "CLS 0.1 altında tutulmalıdır."
        ],
        entities: ["TechArticle", "SEO", "WebPerformance"],
        citations: [
            "Google Core Web Vitals, sayfa deneyimi için kritik metriklerdir.",
            "LCP Largest Contentful Paint anlamına gelir."
        ],
        llmOptimized: true
    }
];

const LLM_BOTS = [
    { name: "GPTBot", company: "OpenAI", icon: "🤖" },
    { name: "ClaudeBot", company: "Anthropic", icon: "🧠" },
    { name: "PerplexityBot", company: "Perplexity", icon: "🔍" },
    { name: "Google-Extended", company: "Google", icon: "🔎" },
];

export default function GEOOptimizationPage() {
    const [optimizations, setOptimizations] = useState<LLMOptimization[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        loadGEOData();
    }, []);

    const loadGEOData = async () => {
        setLoading(true);
        try {
            // Mock data - gerçek uygulamada API'den çekilir
            setOptimizations(MOCK_GEO_DATA);
        } catch (error) {
            console.error("Error loading GEO data:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const generateLLMsTxt = () => {
        return `# llms.txt - Ezmeo LLM Optimization File
# Generated: ${new Date().toISOString()}

# Site Overview
Site: Ezmeo - Doğal Ezme ve Kuruyemiş
Description: Türkiye'nin en kaliteli doğal ezme markası. Fıstık ezmesi, badem ezmesi, fındık ezmesi.
Language: tr

# Allowed LLM Crawlers
User-agent: GPTBot
User-agent: ClaudeBot  
User-agent: PerplexityBot
User-agent: Google-Extended
Allow: /

# Content Guidelines
Key Entities: Product, Food, HealthFood, Organization, Recipe
Primary Topics: Doğal ezme, sağlıklı beslenme, sporcu besini, vegan ürünler

# Citation Preferences
Preferred Citation Format: "Ezmeo - [Ürün/Kategori Adı] - https://ezmeo.com[URL]"
`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/admin/seo-killer" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    SEO Merkezi
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Bot className="w-7 h-7 text-pink-600" />
                            GEO / LLM Optimizasyonu
                        </h1>
                        <p className="text-gray-500 mt-1">
                            ChatGPT, Perplexity ve diğer AI sistemleri için içerik optimizasyonu.
                        </p>
                    </div>
                    <button
                        onClick={loadGEOData}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Generative SEO</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                        AI sistemlerinin içeriklerinizi anlaması ve özetlemesi için optimize edin.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Citations</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                        AI yanıtlarında markanızın kaynak olarak gösterilmesini sağlayın.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">llms.txt</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                        LLM tarayıcıları için robots.txt benzeri standart yapılandırma.
                    </p>
                </div>
            </div>

            {/* LLM Bot Status */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Desteklenen LLM Botları</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {LLM_BOTS.map(bot => (
                        <div key={bot.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">{bot.icon}</span>
                            <div>
                                <div className="font-medium text-gray-900 text-sm">{bot.name}</div>
                                <div className="text-xs text-gray-500">{bot.company}</div>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>

            {/* llms.txt Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">llms.txt Önizleme</h3>
                    </div>
                    <button
                        onClick={() => copyToClipboard(generateLLMsTxt(), "llms-txt")}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        {copied === "llms-txt" ? (
                            <><Check className="w-4 h-4" /> Kopyalandı</>
                        ) : (
                            <><Copy className="w-4 h-4" /> Kopyala</>
                        )}
                    </button>
                </div>
                <div className="p-4 bg-gray-900">
                    <pre className="text-xs text-green-400 overflow-x-auto">
                        {generateLLMsTxt()}
                    </pre>
                </div>
            </div>

            {/* Optimized Pages */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-4">GEO Optimize Edilmiş Sayfalar</h3>
                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-32" />
                            ))}
                        </div>
                    ) : (
                        optimizations.map((opt, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                    opt.pageType === "product" ? "bg-blue-100 text-blue-700" :
                                                    opt.pageType === "category" ? "bg-purple-100 text-purple-700" :
                                                    "bg-orange-100 text-orange-700"
                                                }`}>
                                                    {opt.pageType === "product" ? "Ürün" :
                                                     opt.pageType === "category" ? "Kategori" : "İçerik"}
                                                </span>
                                                {opt.llmOptimized && (
                                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        LLM Optimize
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-gray-900">{opt.pageName}</h4>
                                            <p className="text-sm text-gray-500">{opt.url}</p>
                                        </div>
                                        <Link
                                            href={opt.url}
                                            target="_blank"
                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    {/* Key Takeaways */}
                                    <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                                            Önemli Çıkarımlar
                                        </h5>
                                        <ul className="space-y-1">
                                            {opt.keyTakeaways.map((takeaway, i) => (
                                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    {takeaway}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Entities */}
                                    <div className="flex flex-wrap gap-2">
                                        {opt.entities.map((entity, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                {entity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    GEO Optimizasyon İpuçları
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        İlk paragrafta ana konuyu net bir şekilde tanımlayın.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        "Önemli Çıkarımlar" bölümü ekleyin - AI'lar bunu özette kullanır.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
        <parameter name="faq_format">Soruları ve cevapları yapılandırılmış formatta kullanın (FAQ schema).</parameter>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">4.</span>
                        Varlık isimleri (Entity) kullanın: marka, ürün, kişi adları.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">5.</span>
                        İstatistikleri kaynaklarıyla birlikte ekleyin.
                    </li>
                </ul>
            </div>
        </div>
    );
}
