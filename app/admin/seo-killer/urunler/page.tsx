"use client";

import { useState, useEffect } from "react";
import {
    Package,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Wand2,
    Eye,
    ArrowLeft,
    Search,
    ExternalLink,
    Code,
    FileText
} from "lucide-react";
import Link from "next/link";

interface ProductSEO {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    price: number;
    metaTitle: string;
    metaDescription: string;
    schemaType: string;
    score: number;
    issues: string[];
}

export default function ProductSEOPage() {
    const [products, setProducts] = useState<ProductSEO[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ metaTitle: "", metaDescription: "" });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            const prods = data.products || [];

            const seoProducts: ProductSEO[] = prods.map((p: Record<string, unknown>) => {
                const issues: string[] = [];
                let score = 100;

                const metaTitle = (p.meta_title || p.seo_title || "") as string;
                const metaDescription = (p.meta_description || p.seo_description || "") as string;

                if (!metaTitle) {
                    issues.push("Meta başlık eksik");
                    score -= 20;
                } else if (metaTitle.length < 30 || metaTitle.length > 60) {
                    issues.push("Meta başlık uzunluğu ideal değil");
                    score -= 10;
                }

                if (!metaDescription) {
                    issues.push("Meta açıklama eksik");
                    score -= 20;
                } else if (metaDescription.length < 120 || metaDescription.length > 160) {
                    issues.push("Meta açıklama uzunluğu ideal değil");
                    score -= 10;
                }

                if (!p.images || (p.images as string[]).length === 0) {
                    issues.push("Ürün görseli yok");
                    score -= 15;
                }

                const variants = (p.variants || []) as Array<{ price?: number }>;
                const price = variants.length > 0 ? Number(variants[0]?.price || 0) : 0;

                return {
                    id: p.id as string,
                    name: p.name as string || "",
                    slug: p.slug as string || "",
                    description: (p.description || "") as string,
                    images: (p.images || []) as string[],
                    price,
                    metaTitle,
                    metaDescription,
                    schemaType: "Product",
                    score: Math.max(0, score),
                    issues,
                };
            });

            setProducts(seoProducts);
        } catch (error) {
            console.error("Failed to load products:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateAIMeta = (product: ProductSEO) => {
        // Simple AI-like meta generation based on product info
        const name = product.name;
        const desc = product.description.slice(0, 80);

        const title = `${name} | Doğal & Katkısız | Ezmeo`;
        const description = `${name} - ${desc}... Türkiye'nin en kaliteli doğal ezmeleri. Şekersiz, katkısız, %100 doğal. Hemen sipariş verin!`;

        return { title, description };
    };

    const handleEdit = (product: ProductSEO) => {
        setEditingId(product.id);
        setEditForm({
            metaTitle: product.metaTitle,
            metaDescription: product.metaDescription,
        });
    };

    const handleAutoGenerate = (product: ProductSEO) => {
        const { title, description } = generateAIMeta(product);
        setEditForm({
            metaTitle: title.slice(0, 60),
            metaDescription: description.slice(0, 160),
        });
    };

    const handleSave = async (productId: string) => {
        setSaving(productId);
        setMessage(null);

        try {
            const res = await fetch("/api/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: productId,
                    meta_title: editForm.metaTitle,
                    meta_description: editForm.metaDescription,
                }),
            });

            if (res.ok) {
                setMessage({ type: "success", text: "Meta bilgileri güncellendi!" });
                setEditingId(null);
                loadProducts();
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            setMessage({ type: "error", text: "Güncelleme başarısız oldu." });
        } finally {
            setSaving(null);
        }
    };

    const generateSchemaPreview = (product: ProductSEO) => {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.metaDescription || product.description.slice(0, 160),
            "image": product.images[0] || "",
            "brand": {
                "@type": "Brand",
                "name": "Ezmeo"
            },
            "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "TRY",
                "availability": "https://schema.org/InStock"
            }
        };
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-50";
        if (score >= 60) return "text-yellow-600 bg-yellow-50";
        return "text-red-600 bg-red-50";
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/seo-killer" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                        <ArrowLeft className="w-4 h-4" />
                        SEO Merkezi
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-7 h-7 text-blue-600" />
                        Ürün SEO Yönetimi
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Her ürün için Schema.org Product yapısı ile meta bilgilerini düzenleyin.
                    </p>
                </div>
                <button
                    onClick={loadProducts}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ürün ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            {/* Products List */}
            <div className="space-y-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {product.images[0] && (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">/urunler/{product.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(product.score)}`}>
                                    {product.score}/100
                                </span>
                                {editingId !== product.id && (
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        Düzenle
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Issues */}
                        {product.issues.length > 0 && editingId !== product.id && (
                            <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
                                <div className="flex items-center gap-2 text-sm text-orange-700">
                                    <AlertTriangle className="w-4 h-4" />
                                    {product.issues.join(" • ")}
                                </div>
                            </div>
                        )}

                        {/* Edit Form */}
                        {editingId === product.id && (
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
                                            placeholder="SEO dostu başlık..."
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
                                            placeholder="Ürün açıklaması..."
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
                                            {editForm.metaTitle || product.name}
                                        </div>
                                        <div className="text-green-700 text-sm">
                                            ezmeo.com › urunler › {product.slug}
                                        </div>
                                        <div className="text-gray-600 text-sm">
                                            {editForm.metaDescription || product.description.slice(0, 160)}
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
                                        {JSON.stringify(generateSchemaPreview(product), null, 2)}
                                    </pre>
                                </details>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => handleAutoGenerate(product)}
                                        className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                        Otomatik Oluştur
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={() => handleSave(product.id)}
                                            disabled={saving === product.id}
                                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            {saving === product.id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
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
