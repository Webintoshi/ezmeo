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
    AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface CategorySEO {
    id: string;
    name: string;
    slug: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
}

const CATEGORIES: CategorySEO[] = [
    {
        id: "cat-fistik-ezmesi",
        name: "Fıstık Ezmesi",
        slug: "fistik-ezmesi",
        description: "Doğal fıstık ezmesi çeşitleri",
        metaTitle: "Fıstık Ezmesi Çeşitleri | Doğal & Şekersiz | Ezmeo",
        metaDescription: "En kaliteli doğal fıstık ezmesi çeşitleri. %100 fıstık, şekersiz, katkısız. Sporcu fıstık ezmesi, kakaolu ve sade seçenekler. Hemen sipariş verin!"
    },
    {
        id: "cat-badem-ezmesi",
        name: "Badem Ezmesi",
        slug: "badem-ezmesi",
        description: "Doğal badem ezmesi çeşitleri",
        metaTitle: "Badem Ezmesi Çeşitleri | Doğal & Katkısız | Ezmeo",
        metaDescription: "Premium kalite badem ezmesi. Taze öğütülmüş, doğal, şekersiz badem ezmesi seçenekleri. Vegan ve glutensiz. Türkiye geneli ücretsiz kargo."
    },
    {
        id: "cat-findik-ezmesi",
        name: "Fındık Ezmesi",
        slug: "findik-ezmesi",
        description: "Doğal fındık ezmesi çeşitleri",
        metaTitle: "Fındık Ezmesi Çeşitleri | Karadeniz Fındığı | Ezmeo",
        metaDescription: "Gerçek Karadeniz fındığından hazırlanan doğal fındık ezmesi. Şekersiz, katkısız, %100 fındık. Kahvaltı ve atıştırmalık için ideal."
    },
    {
        id: "cat-antep-fistigi",
        name: "Antep Fıstığı Ezmesi",
        slug: "antep-fistigi-ezmesi",
        description: "Doğal Antep fıstığı ezmesi",
        metaTitle: "Antep Fıstığı Ezmesi | Premium Kalite | Ezmeo",
        metaDescription: "Gaziantep'in ünlü Antep fıstığından hazırlanan premium ezme. Yeşil fıstık, doğal, katkısız. Tatlı ve tuzlu tarifler için mükemmel."
    },
    {
        id: "cat-karma",
        name: "Karma Ezmeler",
        slug: "karma-ezmeler",
        description: "Farklı ezme karışımları",
        metaTitle: "Karma Ezme Çeşitleri | Mix & Blend | Ezmeo",
        metaDescription: "Farklı kuruyemişlerin birbirleriyle mükemmel uyumu. Karma ezmeler: fıstık-badem, fındık-kakao ve daha fazlası. Yeni tatlar keşfedin!"
    },
];

export default function CategorySEOPage() {
    const [categories, setCategories] = useState(CATEGORIES);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ metaTitle: "", metaDescription: "" });
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [generating, setGenerating] = useState(false);

    const handleEdit = (cat: CategorySEO) => {
        setEditingId(cat.id);
        setEditForm({ metaTitle: cat.metaTitle, metaDescription: cat.metaDescription });
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
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
