"use client";

import { useState } from "react";
import {
    FileText,
    Save,
    ArrowLeft,
    Eye,
    Code,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Globe,
    Home,
    HelpCircle,
    Mail,
    BookOpen,
    Shield,
    FileCheck
} from "lucide-react";
import Link from "next/link";

interface PageSEO {
    id: string;
    name: string;
    slug: string;
    url: string;
    icon: React.ReactNode;
    schemaType: string;
    metaTitle: string;
    metaDescription: string;
}

const PAGES: PageSEO[] = [
    {
        id: "page-home",
        name: "Ana Sayfa",
        slug: "",
        url: "/",
        icon: <Home className="w-5 h-5" />,
        schemaType: "WebSite",
        metaTitle: "Ezmeo | Doğal Fıstık Ezmesi & Kuruyemiş Ezmeleri",
        metaDescription: "Türkiye'nin en kaliteli doğal ezme markası. Fıstık ezmesi, badem ezmesi, fındık ezmesi ve daha fazlası. %100 doğal, şekersiz, katkısız. Ücretsiz kargo!"
    },
    {
        id: "page-products",
        name: "Ürünler",
        slug: "urunler",
        url: "/urunler",
        icon: <Globe className="w-5 h-5" />,
        schemaType: "CollectionPage",
        metaTitle: "Tüm Ürünler | Doğal Ezmeler | Ezmeo",
        metaDescription: "Ezmeo'nun tüm doğal ezme çeşitlerini keşfedin. Fıstık, badem, fındık, Antep fıstığı ezmeleri. Sporcu ezmeleri ve özel karışımlar. Hemen sipariş verin!"
    },
    {
        id: "page-blog",
        name: "Blog",
        slug: "blog",
        url: "/blog",
        icon: <BookOpen className="w-5 h-5" />,
        schemaType: "Blog",
        metaTitle: "Blog | Sağlıklı Yaşam & Tarifler | Ezmeo",
        metaDescription: "Sağlıklı yaşam ipuçları, ezme tarifleri, beslenme önerileri ve daha fazlası. Ezmeo blog ile sağlıklı hayata adım atın!"
    },
    {
        id: "page-contact",
        name: "İletişim",
        slug: "iletisim",
        url: "/iletisim",
        icon: <Mail className="w-5 h-5" />,
        schemaType: "ContactPage",
        metaTitle: "İletişim | Bize Ulaşın | Ezmeo",
        metaDescription: "Sorularınız mı var? Ezmeo müşteri hizmetleri ile iletişime geçin. Sipariş takibi, ürün bilgisi ve önerileriniz için bize yazın. 7/24 destek!"
    },
    {
        id: "page-faq",
        name: "SSS",
        slug: "sss",
        url: "/sss",
        icon: <HelpCircle className="w-5 h-5" />,
        schemaType: "FAQPage",
        metaTitle: "Sıkça Sorulan Sorular | Ezmeo",
        metaDescription: "Ezmeo hakkında en çok sorulan sorular ve cevapları. Kargo, iade, ürün içerikleri ve daha fazlası hakkında bilgi alın."
    },
    {
        id: "page-privacy",
        name: "Gizlilik Politikası",
        slug: "gizlilik",
        url: "/gizlilik",
        icon: <Shield className="w-5 h-5" />,
        schemaType: "WebPage",
        metaTitle: "Gizlilik Politikası | Ezmeo",
        metaDescription: "Ezmeo gizlilik politikası. Kişisel verilerinizin nasıl korunduğu ve kullanıldığı hakkında detaylı bilgi."
    },
    {
        id: "page-terms",
        name: "Kullanım Koşulları",
        slug: "sartlar",
        url: "/sartlar",
        icon: <FileCheck className="w-5 h-5" />,
        schemaType: "WebPage",
        metaTitle: "Kullanım Koşulları | Ezmeo",
        metaDescription: "Ezmeo web sitesi kullanım koşulları ve şartları. Satış sözleşmesi, teslimat ve iade politikaları hakkında bilgi."
    },
];

export default function PagesSEOPage() {
    const [pages, setPages] = useState(PAGES);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ metaTitle: "", metaDescription: "" });
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [generating, setGenerating] = useState(false);

    const handleEdit = (page: PageSEO) => {
        setEditingId(page.id);
        setEditForm({ metaTitle: page.metaTitle, metaDescription: page.metaDescription });
    };

    const generateWithToshiAI = async (page: PageSEO) => {
        setGenerating(true);
        setMessage(null);

        try {
            const res = await fetch("/api/seo/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "page",
                    name: page.name,
                    description: page.metaDescription,
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

    const handleSave = (pageId: string) => {
        setPages(prev => prev.map(p =>
            p.id === pageId
                ? { ...p, metaTitle: editForm.metaTitle, metaDescription: editForm.metaDescription }
                : p
        ));
        setMessage({ type: "success", text: "Sayfa meta bilgileri güncellendi!" });
        setEditingId(null);
    };

    const generateSchemaPreview = (page: PageSEO) => {
        const baseSchema: Record<string, unknown> = {
            "@context": "https://schema.org",
            "@type": page.schemaType,
            "name": page.metaTitle,
            "description": page.metaDescription,
            "url": `https://ezmeo.com${page.url}`,
        };

        if (page.schemaType === "WebSite") {
            baseSchema.potentialAction = {
                "@type": "SearchAction",
                "target": "https://ezmeo.com/arama?q={search_term_string}",
                "query-input": "required name=search_term_string"
            };
        }

        if (page.schemaType === "FAQPage") {
            baseSchema.mainEntity = [
                {
                    "@type": "Question",
                    "name": "Örnek soru?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Örnek cevap..."
                    }
                }
            ];
        }

        return baseSchema;
    };

    const getSchemaColor = (schemaType: string) => {
        switch (schemaType) {
            case "WebSite": return "bg-blue-50 text-blue-700";
            case "CollectionPage": return "bg-purple-50 text-purple-700";
            case "Blog": return "bg-orange-50 text-orange-700";
            case "ContactPage": return "bg-green-50 text-green-700";
            case "FAQPage": return "bg-yellow-50 text-yellow-700";
            default: return "bg-gray-50 text-gray-700";
        }
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
                    <FileText className="w-7 h-7 text-green-600" />
                    Sayfa SEO Yönetimi
                </h1>
                <p className="text-gray-500 mt-1">
                    Statik sayfalar için özel şema türleri (WebSite, FAQPage, ContactPage vb.) ile meta bilgilerini düzenleyin.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Pages List */}
            <div className="space-y-4">
                {pages.map((page) => (
                    <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                    {page.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{page.name}</h3>
                                    <p className="text-sm text-gray-500">{page.url}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSchemaColor(page.schemaType)}`}>
                                    {page.schemaType}
                                </span>
                                {editingId !== page.id && (
                                    <button
                                        onClick={() => handleEdit(page)}
                                        className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        Düzenle
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Edit Form */}
                        {editingId === page.id && (
                            <div className="p-4 space-y-4 bg-gray-50">
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
                                            {editForm.metaTitle || page.name}
                                        </div>
                                        <div className="text-green-700 text-sm">
                                            ezmeo.com{page.url}
                                        </div>
                                        <div className="text-gray-600 text-sm">
                                            {editForm.metaDescription}
                                        </div>
                                    </div>
                                </div>

                                {/* Schema Preview */}
                                <details className="bg-white rounded-lg border border-gray-200">
                                    <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Code className="w-4 h-4" />
                                        Schema.org Önizleme ({page.schemaType})
                                    </summary>
                                    <pre className="p-4 text-xs overflow-x-auto bg-gray-900 text-green-400 rounded-b-lg">
                                        {JSON.stringify(generateSchemaPreview(page), null, 2)}
                                    </pre>
                                </details>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => generateWithToshiAI(page)}
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
                                            onClick={() => handleSave(page.id)}
                                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                        >
                                            <Save className="w-4 h-4" />
                                            Kaydet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
