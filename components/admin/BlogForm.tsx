"use client";

import { useState } from "react";
import {
    Save,
    ArrowLeft,
    Eye,
    Settings,
    Trash2,
    Image as ImageIcon,
    Type
} from "lucide-react";
import Link from "next/link";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BLOG_CATEGORIES } from "@/lib/blog";

interface BlogFormProps {
    initialData?: BlogPost;
}

export function BlogForm({ initialData }: BlogFormProps) {
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [formData, setFormData] = useState<Partial<BlogPost>>(
        initialData || {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            coverImage: "",
            category: "saglik",
            tags: [],
            featured: false,
            author: {
                name: "Admin",
                role: "Editör",
                avatar: ""
            }
        }
    );

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        alert("Yazı başarıyla kaydedildi.");
    };

    return (
        <div className="space-y-8">
            {/* Top Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/cms/blog"
                        className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {initialData ? "Yazıyı Düzenle" : "Yeni Yazı Ekle"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">İçeriğinizi hazırlayın ve paylaşın.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${showPreview ? "bg-gray-100 border-gray-300 text-gray-900" : "bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 shadow-sm"
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        {showPreview ? "Düzenlemeye Dön" : "Önizleme"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {initialData ? "Değişiklikleri Kaydet" : "Yayınla"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {showPreview ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 min-h-[600px] prose prose-gray max-w-none">
                            <h1 className="text-3xl font-bold mb-6">{formData.title || "Başlıksız Yazı"}</h1>
                            {formData.coverImage && (
                                <img src={formData.coverImage} className="w-full h-64 object-cover rounded-xl mb-8" alt="Kapak" />
                            )}
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {formData.content || "Henüz içerik girilmedi..."}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Main Content Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-gray-500" />
                                        İçerik Editörü
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Yazı Başlığı</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => {
                                                const newTitle = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    title: newTitle,
                                                    slug: !initialData ? generateSlug(newTitle) : prev.slug
                                                }));
                                            }}
                                            placeholder="Örn: 2026'nın En Sağlıklı Ezmeleri"
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm font-medium"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Bağlantı (Slug)</label>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value as BlogCategory })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all bg-white text-sm"
                                            >
                                                {BLOG_CATEGORIES.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Özet</label>
                                        <textarea
                                            rows={2}
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            placeholder="Yazının kısa bir özeti (liste sayfalarında görünür)..."
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
                                        <textarea
                                            rows={12}
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Yazı içeriğini buraya girin (Markdown desteklenir)..."
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm resize-none font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Cover Image Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                Kapak Görseli
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {formData.coverImage ? (
                                <div className="relative group rounded-lg overflow-hidden h-40">
                                    <img src={formData.coverImage} alt="Kapak" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <button
                                            onClick={() => setFormData({ ...formData, coverImage: "" })}
                                            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400">
                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                    <span className="text-xs">Görsel seçilmedi</span>
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Görsel URL yapıştırın..."
                                value={formData.coverImage}
                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:border-gray-900 focus:ring-0"
                            />
                        </div>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                Yazı Ayarları
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Öne Çıkarılan Yazı</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${formData.featured ? "bg-gray-900" : "bg-gray-200"
                                        }`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.featured ? "left-6" : "left-1"
                                        }`} />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Yazar</label>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                        {formData.author?.avatar && <img src={formData.author.avatar} alt="Yazar" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{formData.author?.name}</div>
                                        <div className="text-[10px] text-gray-500">{formData.author?.role}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Etiketler</label>
                                <input
                                    type="text"
                                    placeholder="Virgül ile ayırın..."
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:border-gray-900 focus:ring-0"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const val = (e.currentTarget.value).trim();
                                            if (val && !formData.tags?.includes(val)) {
                                                setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                                                e.currentTarget.value = "";
                                            }
                                        }
                                    }}
                                />
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {formData.tags?.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-600">
                                            {tag}
                                            <button onClick={() => setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) })}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
