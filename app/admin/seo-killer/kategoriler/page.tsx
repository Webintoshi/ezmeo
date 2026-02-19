"use client";

import { useState } from "react";
import {
    FolderOpen,
    Save,
    ArrowLeft,
    Eye,
    Code,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    Bot,
    Lightbulb,
    Type,
    Clock,
    LayoutGrid
} from "lucide-react";
import Link from "next/link";

interface CategoryFAQ {
    question: string;
    answer: string;
}

interface CategoryGEO {
    keyTakeaways: string[];
    entities: string[];
}

interface CategorySEO {
    id: string;
    name: string;
    slug: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    // SEO Hub özellikleri
    faq: CategoryFAQ[];
    geo: CategoryGEO;
    wordCount: number;
    readingTime: number;
    clusterCount: number; // Alt kategori/içerik sayısı
}

const CATEGORY_CONTENT: Record<string, { description: string; clusters: string[] }> = {
    "fistik-ezmesi": {
        description: "Doğal fıstık ezmesi, sporcu besini olarak idealdir. Protein deposu, doğal enerji kaynağı.",
        clusters: ["Sporcu Fıstık Ezmesi", "Kakaolu Fıstık Ezmesi", "Sade Fıstık Ezmesi", "Organik Fıstık Ezmesi"]
    },
    "badem-ezmesi": {
        description: "Premium badem ezmesi, vegan ve glutensiz seçenekler. Taze öğütülmüş.",
        clusters: ["Sade Badem Ezmesi", "Kakaolu Badem Ezmesi", "Ballı Badem Ezmesi"]
    },
    "findik-ezmesi": {
        description: "Karadeniz fındığından üretilen doğal fındık ezmesi.",
        clusters: ["Sade Fındık Ezmesi", "Kakaolu Fındık Ezmesi"]
    },
    "antep-fistigi-ezmesi": {
        description: "Gaziantep'in eşsiz lezzeti, premium Antep fıstığı ezmesi.",
        clusters: ["Antep Fıstığı Ezmesi", "Çifte Kavrulmuş"]
    },
    "karma-ezmeler": {
        description: "Farklı kuruyemişlerin mükemmel uyumu.",
        clusters: ["Fıstık-Badem Mix", "Süper Karışım"]
    }
};

const CATEGORIES: CategorySEO[] = [
    {
        id: "cat-fistik-ezmesi",
        name: "Fıstık Ezmesi",
        slug: "fistik-ezmesi",
        description: CATEGORY_CONTENT["fistik-ezmesi"].description,
        metaTitle: "Fıstık Ezmesi Çeşitleri | Doğal & Şekersiz | Ezmeo",
        metaDescription: "En kaliteli doğal fıstık ezmesi çeşitleri. %100 fıstık, şekersiz, katkısız. Sporcu fıstık ezmesi, kakaolu ve sade seçenekler. Hemen sipariş verin!",
        faq: [
            { question: "Fıstık ezmesi sağlıklı mı?", answer: "Evet, doğal fıstık ezmesi protein ve sağlıklı yağlar açısından zengindir. Katkısız ürünlerimiz sağlıklı beslenmenin vazgeçilmezidir." },
            { question: "Sporcu fıstık ezmesi nedir?", answer: "Yüksek protein içeriğiyle sporcular için özel formüle edilmiş fıstık ezmesi çeşididir." }
        ],
        geo: {
            keyTakeaways: [
                "Ezmeo fıstık ezmesi %100 doğal içerir.",
                "Şeker ilavesiz ve katkısız üretim.",
                "Sporcular için ideal protein kaynağı."
            ],
            entities: ["ProductCategory", "Food", "HealthFood"]
        },
        wordCount: CATEGORY_CONTENT["fistik-ezmesi"].description.split(/\s+/).length,
        readingTime: 1,
        clusterCount: CATEGORY_CONTENT["fistik-ezmesi"].clusters.length
    },
    {
        id: "cat-badem-ezmesi",
        name: "Badem Ezmesi",
        slug: "badem-ezmesi",
        description: CATEGORY_CONTENT["badem-ezmesi"].description,
        metaTitle: "Badem Ezmesi Çeşitleri | Doğal & Katkısız | Ezmeo",
        metaDescription: "Premium kalite badem ezmesi. Taze öğütülmüş, doğal, şekersiz badem ezmesi seçenekleri. Vegan ve glutensiz. Türkiye geneli ücretsiz kargo.",
        faq: [
            { question: "Badem ezmesi vegan mı?", answer: "Evet, tüm badem ezmesi ürünlerimiz vegan dostudur. Hayvansal içerik içermez." }
        ],
        geo: {
            keyTakeaways: [
                "Vegan ve glutensiz seçenekler.",
                "Taze öğütülmüş premium kalite.",
                "E vitamini ve antioksidan deposu."
            ],
            entities: ["ProductCategory", "VeganFood", "HealthFood"]
        },
        wordCount: CATEGORY_CONTENT["badem-ezmesi"].description.split(/\s+/).length,
        readingTime: 1,
        clusterCount: CATEGORY_CONTENT["badem-ezmesi"].clusters.length
    },
    {
        id: "cat-findik-ezmesi",
        name: "Fındık Ezmesi",
        slug: "findik-ezmesi",
        description: CATEGORY_CONTENT["findik-ezmesi"].description,
        metaTitle: "Fındık Ezmesi Çeşitleri | Karadeniz Fındığı | Ezmeo",
        metaDescription: "Gerçek Karadeniz fındığından hazırlanan doğal fındık ezmesi. Şekersiz, katkısız, %100 fındık. Kahvaltı ve atıştırmalık için ideal.",
        faq: [],
        geo: {
            keyTakeaways: [
                "Gerçek Karadeniz fındığı kullanılır.",
                "Kahvaltı ve atıştırmalık için ideal."
            ],
            entities: ["ProductCategory", "Food"]
        },
        wordCount: CATEGORY_CONTENT["findik-ezmesi"].description.split(/\s+/).length,
        readingTime: 1,
        clusterCount: CATEGORY_CONTENT["findik-ezmesi"].clusters.length
    },
    {
        id: "cat-antep-fistigi",
        name: "Antep Fıstığı Ezmesi",
        slug: "antep-fistigi-ezmesi",
        description: CATEGORY_CONTENT["antep-fistigi-ezmesi"].description,
        metaTitle: "Antep Fıstığı Ezmesi | Premium Kalite | Ezmeo",
        metaDescription: "Gaziantep'in ünlü Antep fıstığından hazırlanan premium ezme. Yeşil fıstık, doğal, katkısız. Tatlı ve tuzlu tarifler için mükemmel.",
        faq: [],
        geo: {
            keyTakeaways: [
                "Gaziantep'in orijinal Antep fıstığı.",
                "Tatlı ve tuzlu tarifler için ideal."
            ],
            entities: ["ProductCategory", "PremiumFood"]
        },
        wordCount: CATEGORY_CONTENT["antep-fistigi-ezmesi"].description.split(/\s+/).length,
        readingTime: 1,
        clusterCount: CATEGORY_CONTENT["antep-fistigi-ezmesi"].clusters.length
    },
    {
        id: "cat-karma",
        name: "Karma Ezmeler",
        slug: "karma-ezmeler",
        description: CATEGORY_CONTENT["karma-ezmeler"].description,
        metaTitle: "Karma Ezme Çeşitleri | Mix & Blend | Ezmeo",
        metaDescription: "Farklı kuruyemişlerin birbirleriyle mükemmel uyumu. Karma ezmeler: fıstık-badem, fındık-kakao ve daha fazlası. Yeni tatlar keşfedin!",
        faq: [],
        geo: {
            keyTakeaways: [
                "Farklı kuruyemişlerin uyumu.",
                "Benzersiz tat deneyimi."
            ],
            entities: ["ProductCategory", "MixedFood"]
        },
        wordCount: CATEGORY_CONTENT["karma-ezmeler"].description.split(/\s+/).length,
        readingTime: 1,
        clusterCount: CATEGORY_CONTENT["karma-ezmeler"].clusters.length
    },
];

export default function CategorySEOPage() {
    const [categories, setCategories] = useState(CATEGORIES);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ 
        metaTitle: "", 
        metaDescription: "",
        faq: [] as CategoryFAQ[],
        keyTakeaways: [] as string[]
    });
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [generating, setGenerating] = useState(false);
    const [activeSection, setActiveSection] = useState<"meta" | "faq" | "geo">("meta");

    const handleEdit = (cat: CategorySEO) => {
        setEditingId(cat.id);
        setEditForm({ 
            metaTitle: cat.metaTitle, 
            metaDescription: cat.metaDescription,
            faq: cat.faq || [],
            keyTakeaways: cat.geo?.keyTakeaways || []
        });
    };

    // FAQ işlemleri
    const addFAQ = () => {
        setEditForm(prev => ({ ...prev, faq: [...prev.faq, { question: "", answer: "" }] }));
    };

    const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
        setEditForm(prev => ({
            ...prev,
            faq: prev.faq.map((f, i) => i === index ? { ...f, [field]: value } : f)
        }));
    };

    const removeFAQ = (index: number) => {
        setEditForm(prev => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));
    };

    // Key Takeaways işlemleri
    const addKeyTakeaway = () => {
        setEditForm(prev => ({ ...prev, keyTakeaways: [...prev.keyTakeaways, ""] }));
    };

    const updateKeyTakeaway = (index: number, value: string) => {
        setEditForm(prev => ({
            ...prev,
            keyTakeaways: prev.keyTakeaways.map((k, i) => i === index ? value : k)
        }));
    };

    const removeKeyTakeaway = (index: number) => {
        setEditForm(prev => ({ ...prev, keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== index) }));
    };

    const generateWithToshiAI = async (cat: CategorySEO) => {
        setGenerating(true);
        setMessage(null);

        try {
            const res = await fetch("/api/seo/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "category",
                    name: cat.name,
                    description: cat.description,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setEditForm({
                    metaTitle: data.metaTitle || "",
                    metaDescription: data.metaDescription || "",
                });
                setMessage({
                    type: "success",
                    text: data.source === "ai" ? "Toshi AI ile oluşturuldu!" : "Şablon ile oluşturuldu."
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("AI generation failed:", error);
            setMessage({ type: "error", text: "AI oluşturma başarısız oldu." });
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = (catId: string) => {
        setCategories(prev => prev.map(c =>
            c.id === catId
                ? { ...c, metaTitle: editForm.metaTitle, metaDescription: editForm.metaDescription }
                : c
        ));
        setMessage({ type: "success", text: "Kategori meta bilgileri güncellendi!" });
        setEditingId(null);
    };

    const generateSchemaPreview = (cat: CategorySEO) => {
        return {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": cat.name,
            "description": cat.metaDescription,
            "url": `https://ezmeo.com/kategori/${cat.slug}`,
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://ezmeo.com" },
                    { "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://ezmeo.com/kategori/${cat.slug}` }
                ]
            }
        };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/admin/seo-killer" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    SEO Merkezi
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FolderOpen className="w-7 h-7 text-purple-600" />
                    Kategori SEO Yönetimi
                </h1>
                <p className="text-gray-500 mt-1">
                    Her kategori için CollectionPage şeması ile meta bilgilerini düzenleyin.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Categories List */}
            <div className="space-y-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                                <p className="text-sm text-gray-500">/kategori/{cat.slug}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
                                    CollectionPage
                                </span>
                                {editingId !== cat.id && (
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        Düzenle
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Edit Form */}
                        {editingId === cat.id && (
                            <div className="p-4 space-y-4 bg-gray-50">
                                {/* Section Tabs */}
                                <div className="flex gap-2 border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveSection("meta")}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                            activeSection === "meta"
                                                ? "border-primary text-primary"
                                                : "border-transparent text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        Meta Bilgileri
                                    </button>
                                    <button
                                        onClick={() => setActiveSection("faq")}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                            activeSection === "faq"
                                                ? "border-primary text-primary"
                                                : "border-transparent text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        <span className="flex items-center gap-1">
                                            <HelpCircle className="w-4 h-4" />
                                            FAQ Schema
                                            {editForm.faq.length > 0 && (
                                                <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                    {editForm.faq.length}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveSection("geo")}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                            activeSection === "geo"
                                                ? "border-primary text-primary"
                                                : "border-transparent text-gray-600 hover:text-gray-900"
                                        }`}
                                    >
                                        <span className="flex items-center gap-1">
                                            <Bot className="w-4 h-4" />
                                            GEO/LLM
                                        </span>
                                    </button>
                                </div>

                                {activeSection === "meta" && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Meta Başlık
                                            <span className={`ml-2 text-xs ${editForm.metaTitle.length >= 30 && editForm.metaTitle.length <= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                                                ({editForm.metaTitle.length}/60)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.metaTitle}
                                            onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            maxLength={60}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Meta Açıklama
                                            <span className={`ml-2 text-xs ${editForm.metaDescription.length >= 120 && editForm.metaDescription.length <= 160 ? 'text-green-600' : 'text-orange-600'}`}>
                                                ({editForm.metaDescription.length}/160)
                                            </span>
                                        </label>
                                        <textarea
                                            value={editForm.metaDescription}
                                            onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                            rows={3}
                                            maxLength={160}
                                        />
                                    </div>
                                </div>

                                {/* Google Preview */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        Google Önizleme
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-blue-700 text-lg hover:underline cursor-pointer">
                                            {editForm.metaTitle || cat.name}
                                        </div>
                                        <div className="text-green-700 text-sm">
                                            ezmeo.com › kategori › {cat.slug}
                                        </div>
                                        <div className="text-gray-600 text-sm">
                                            {editForm.metaDescription || cat.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Schema Preview */}
                                <details className="bg-white rounded-lg border border-gray-200">
                                    <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Code className="w-4 h-4" />
                                        Schema.org Önizleme (JSON-LD)
                                    </summary>
                                    <pre className="p-4 text-xs overflow-x-auto bg-gray-900 text-green-400 rounded-b-lg">
                                        {JSON.stringify(generateSchemaPreview(cat), null, 2)}
                                    </pre>
                                </details>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => generateWithToshiAI(cat)}
                                        disabled={generating}
                                        className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all text-sm font-medium disabled:opacity-50 border border-purple-200"
                                    >
                                        {generating ? (
                                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        {generating ? "Oluşturuluyor..." : "Toshi AI ile Oluştur"}
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={() => handleSave(cat.id)}
                                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                        >
                                            <Save className="w-4 h-4" />
                                            Kaydet
                                        </button>
                                    </div>
                                </div>
                                )}

                                {activeSection === "faq" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Sıkça Sorulan Sorular</h4>
                                            <p className="text-sm text-gray-500">Google FAQ rich snippet için soru-cevap ekleyin</p>
                                        </div>
                                        <button
                                            onClick={addFAQ}
                                            className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                        >
                                            + Soru Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {editForm.faq.map((faq, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Soru</label>
                                                    <input
                                                        type="text"
                                                        value={faq.question}
                                                        onChange={(e) => updateFAQ(index, "question", e.target.value)}
                                                        placeholder="Örn: Bu ürün vegan mı?"
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Cevap</label>
                                                    <textarea
                                                        value={faq.answer}
                                                        onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                                                        placeholder="Cevabı yazın..."
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                                        rows={2}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeFAQ(index)}
                                                    className="text-xs text-red-600 hover:text-red-700"
                                                >
                                                    Kaldır
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {editForm.faq.length === 0 && (
                                        <div className="text-center py-6 text-gray-500 text-sm bg-gray-100 rounded-lg">
                                            Henüz FAQ eklenmemiş. "Soru Ekle" butonuna tıklayın.
                                        </div>
                                    )}
                                </div>
                                )}

                                {activeSection === "geo" && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className="w-5 h-5 text-purple-600" />
                                            <h4 className="font-medium text-purple-900">GEO / LLM Optimizasyonu</h4>
                                        </div>
                                        <p className="text-sm text-purple-700">
                                            Bu alan ChatGPT, Perplexity ve diğer AI sistemlerinin kategorinizi anlamasına yardımcı olur.
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Önemli Çıkarımlar (Key Takeaways)</h4>
                                                <p className="text-sm text-gray-500">AI'ların kategoriniz hakkında vurgulaması gereken ana noktalar</p>
                                            </div>
                                            <button
                                                onClick={addKeyTakeaway}
                                                className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                            >
                                                + Ekle
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {editForm.keyTakeaways.map((takeaway, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={takeaway}
                                                        onChange={(e) => updateKeyTakeaway(index, e.target.value)}
                                                        placeholder={`Çıkarım ${index + 1}`}
                                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    <button
                                                        onClick={() => removeKeyTakeaway(index)}
                                                        className="px-2 text-red-600 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Öneriler</h5>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li>• Her çıkarım kısa ve öz olmalı (max 100 karakter)</li>
                                            <li>• Kategorinin temel faydalarını vurgulayın</li>
                                            <li>• Müşterilerin aradığı cevapları ekleyin</li>
                                        </ul>
                                    </div>
                                </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
