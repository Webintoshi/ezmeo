"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Package,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Sparkles,
    Eye,
    ArrowLeft,
    Search,
    Code,
    HelpCircle,
    Clock,
    Type,
    Bot,
    Lightbulb,
    Tag,
    Loader2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import type { 
    ProductWithSEO, 
    ProductSEOViewModel, 
    ProductFAQ,
    ProductApiResponse 
} from "@/types/product-seo";
import { toProductSEOViewModel } from "@/types/product-seo";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface EditFormState {
    metaTitle: string;
    metaDescription: string;
    faq: ProductFAQ[];
    keyTakeaways: string[];
}

interface MessageState {
    type: "success" | "error";
    text: string;
}

type SectionType = "meta" | "faq" | "geo";

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_GEO_ENTITIES = ["Product", "Offer", "Organization"];

const EMPTY_FORM_STATE: EditFormState = {
    metaTitle: "",
    metaDescription: "",
    faq: [],
    keyTakeaways: []
};

// ============================================================================
// API CLIENT
// ============================================================================

async function fetchProducts(page: number = 1, search: string = ""): Promise<{ products: ProductWithSEO[]; pagination: ProductApiResponse['pagination'] }> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "10");
    if (search) params.set("search", search);
    
    const response = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "Failed to fetch products");
    }

    // Safely map products with null checks
    const products = (data.products || []).map((p: any) => ({
        ...p,
        // Ensure arrays are never null
        images: p.images || [],
        variants: p.variants || [],
        tags: p.tags || [],
        seo_keywords: p.seo_keywords || [],
        faq: p.faq || [],
        geo_data: p.geo_data || { keyTakeaways: [], entities: [] }
    }));

    return { 
        products, 
        pagination: data.pagination 
    };
}

async function updateProduct(
    id: string, 
    slug: string,
    formState: EditFormState
): Promise<ProductWithSEO> {
    const payload = {
        id,
        seo_title: formState.metaTitle,
        seo_description: formState.metaDescription,
        faq: formState.faq,
        geo_data: { 
            keyTakeaways: formState.keyTakeaways, 
            entities: DEFAULT_GEO_ENTITIES 
        }
    };

    const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "Failed to update product");
    }

    if (!data.product) {
        throw new Error("No product returned from server");
    }

    // Normalize response
    const product = {
        ...data.product,
        images: data.product.images || [],
        variants: data.product.variants || [],
        tags: data.product.tags || [],
        seo_keywords: data.product.seo_keywords || [],
        faq: data.product.faq || [],
        geo_data: data.product.geo_data || { keyTakeaways: [], entities: [] }
    };

    // Trigger revalidation
    try {
        await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: `/urunler/${slug}` })
        });
    } catch {
        console.warn("Revalidation failed");
    }

    return product;
}

async function generateWithAI(product: ProductSEOViewModel): Promise<{metaTitle: string, metaDescription: string, source: string}> {
    const response = await fetch("/api/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "product",
            name: product.name,
            description: product.description || product.short_description,
            category: product.category
        }),
    });

    if (!response.ok) {
        throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "AI generation failed");
    }

    return {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        source: data.source
    };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProductSEOPage() {
    // State
    const [products, setProducts] = useState<ProductSEOViewModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState<EditFormState>(EMPTY_FORM_STATE);
    const [message, setMessage] = useState<MessageState | null>(null);
    const [generating, setGenerating] = useState(false);
    const [activeSection, setActiveSection] = useState<SectionType>("meta");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<ProductApiResponse['pagination']>();

    // Load products
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setMessage(null);

        try {
            const { products: rawProducts, pagination: pag } = await fetchProducts(page, searchQuery);
            const viewModels = rawProducts.map(p => toProductSEOViewModel(p));
            setProducts(viewModels);
            setPagination(pag);
        } catch (error) {
            console.error("Error loading products:", error);
            setMessage({ 
                type: "error", 
                text: error instanceof Error ? error.message : "Ürünler yüklenirken hata oluştu." 
            });
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Handlers
    const handleEdit = useCallback((product: ProductSEOViewModel) => {
        setEditingId(product.id);
        setEditForm({
            metaTitle: product.metaTitle,
            metaDescription: product.metaDescription,
            faq: product.faq || [],
            keyTakeaways: product.geo?.keyTakeaways || []
        });
        setActiveSection("meta");
        setMessage(null);
    }, []);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setEditForm(EMPTY_FORM_STATE);
        setMessage(null);
    }, []);

    const handleSave = useCallback(async (productId: string, productSlug: string) => {
        setSaving(true);
        setMessage(null);

        try {
            const updatedProduct = await updateProduct(productId, productSlug, editForm);
            
            setProducts(prev => prev.map(p =>
                p.id === productId ? toProductSEOViewModel(updatedProduct) : p
            ));
            
            setMessage({ type: "success", text: "Ürün SEO bilgileri kaydedildi! Sayfa cache'i temizlendi." });
            setEditingId(null);
            setEditForm(EMPTY_FORM_STATE);
        } catch (error) {
            console.error("Save error:", error);
            setMessage({ 
                type: "error", 
                text: error instanceof Error ? error.message : "Kayıt başarısız oldu." 
            });
        } finally {
            setSaving(false);
        }
    }, [editForm]);

    const handleGenerateAI = useCallback(async (product: ProductSEOViewModel) => {
        setGenerating(true);
        setMessage(null);

        try {
            // Show thinking state
            setEditForm(prev => ({
                ...prev,
                metaTitle: "🔍 Ürün analiz ediliyor...",
                metaDescription: "Hedef kitle ve anahtar kelimeler belirleniyor..."
            }));

            const generated = await generateWithAI(product);
            
            // Direkt atama (typewriter kaldırıldı - sorun çıkarıyordu)
            setEditForm(prev => ({
                ...prev,
                metaTitle: generated.metaTitle,
                metaDescription: generated.metaDescription
            }));
            
            const isAI = generated.source.includes("zai");
            setMessage({ 
                type: "success", 
                text: isAI 
                    ? `✨ Z.AI (${generated.source}) ile başarıyla oluşturuldu!` 
                    : `⚠️ Şablon kullanıldı (${generated.source})`
            });
        } catch (error) {
            console.error("AI generation failed:", error);
            setMessage({ 
                type: "error", 
                text: error instanceof Error ? error.message : "AI oluşturma başarısız oldu." 
            });
        } finally {
            setGenerating(false);
        }
    }, []);

    // Form handlers
    const updateMetaTitle = useCallback((value: string) => {
        setEditForm(prev => ({ ...prev, metaTitle: value }));
    }, []);

    const updateMetaDescription = useCallback((value: string) => {
        setEditForm(prev => ({ ...prev, metaDescription: value }));
    }, []);

    const addFAQ = useCallback(() => {
        setEditForm(prev => ({
            ...prev,
            faq: [...prev.faq, { question: "", answer: "" }]
        }));
    }, []);

    const updateFAQ = useCallback((index: number, field: keyof ProductFAQ, value: string) => {
        setEditForm(prev => ({
            ...prev,
            faq: prev.faq.map((f, i) => i === index ? { ...f, [field]: value } : f)
        }));
    }, []);

    const removeFAQ = useCallback((index: number) => {
        setEditForm(prev => ({
            ...prev,
            faq: prev.faq.filter((_, i) => i !== index)
        }));
    }, []);

    const addKeyTakeaway = useCallback(() => {
        setEditForm(prev => ({
            ...prev,
            keyTakeaways: [...prev.keyTakeaways, ""]
        }));
    }, []);

    const updateKeyTakeaway = useCallback((index: number, value: string) => {
        setEditForm(prev => ({
            ...prev,
            keyTakeaways: prev.keyTakeaways.map((k, i) => i === index ? value : k)
        }));
    }, []);

    const removeKeyTakeaway = useCallback((index: number) => {
        setEditForm(prev => ({
            ...prev,
            keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== index)
        }));
    }, []);

    // Schema generator
    const generateSchemaPreview = (product: ProductSEOViewModel) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.metaDescription,
        "image": product.images?.[0] || "",
        "offers": {
            "@type": "Offer",
            "price": product.variants?.[0]?.price || 0,
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock"
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/admin/seo-killer" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    SEO Merkezi
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-7 h-7 text-purple-600" />
                    Ürün SEO Yönetimi
                </h1>
                <p className="text-gray-500 mt-1">
                    Her ürün için Product şeması ile meta bilgilerini düzenleyin.
                </p>
            </div>

            {/* Search */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                        placeholder="Ürün ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <button
                    onClick={() => { setPage(1); loadProducts(); }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-3 text-gray-600">Ürünler yükleniyor...</span>
                </div>
            )}

            {/* Products List */}
            {!loading && products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                {product.images?.[0] ? (
                                    <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">/urunler/{product.slug}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.score >= 80 ? 'bg-green-100 text-green-700' : product.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            SEO: {product.score}/100
                                        </span>
                                        {product.issues.length > 0 && (
                                            <span className="text-xs text-orange-600">
                                                {product.issues.length} sorun
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                                    Product
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
                    </div>

                    {/* Edit Form */}
                    {editingId === product.id && (
                        <div className="p-4 space-y-4 bg-gray-50">
                            {/* Tabs */}
                            <div className="flex gap-2 border-b border-gray-200">
                                <TabButton active={activeSection === "meta"} onClick={() => setActiveSection("meta")} label="Meta Bilgileri" />
                                <TabButton active={activeSection === "faq"} onClick={() => setActiveSection("faq")} label="FAQ Schema" badge={editForm.faq.length} icon={<HelpCircle className="w-4 h-4" />} />
                                <TabButton active={activeSection === "geo"} onClick={() => setActiveSection("geo")} label="GEO/LLM" icon={<Bot className="w-4 h-4" />} />
                            </div>

                            {/* Meta Section */}
                            {activeSection === "meta" && (
                                <MetaSection
                                    product={product}
                                    editForm={editForm}
                                    isGenerating={generating}
                                    isSaving={saving}
                                    onUpdateMetaTitle={updateMetaTitle}
                                    onUpdateMetaDescription={updateMetaDescription}
                                    onGenerateAI={() => handleGenerateAI(product)}
                                    onSave={() => handleSave(product.id, product.slug)}
                                    onCancel={handleCancel}
                                />
                            )}

                            {/* FAQ Section */}
                            {activeSection === "faq" && (
                                <FAQSection
                                    faq={editForm.faq}
                                    onAdd={addFAQ}
                                    onUpdate={updateFAQ}
                                    onRemove={removeFAQ}
                                />
                            )}

                            {/* GEO Section */}
                            {activeSection === "geo" && (
                                <GEOSection
                                    keyTakeaways={editForm.keyTakeaways}
                                    onAdd={addKeyTakeaway}
                                    onUpdate={updateKeyTakeaway}
                                    onRemove={removeKeyTakeaway}
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" /> Önceki
                    </button>
                    <span className="text-sm text-gray-600">
                        Sayfa {page} / {pagination.totalPages} ({pagination.total} ürün)
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages!, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                        Sonraki <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TabButton({ active, onClick, label, badge, icon }: { active: boolean; onClick: () => void; label: string; badge?: number; icon?: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? "border-primary text-primary" : "border-transparent text-gray-600 hover:text-gray-900"}`}
        >
            <span className="flex items-center gap-1">
                {icon}
                {label}
                {badge !== undefined && badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{badge}</span>
                )}
            </span>
        </button>
    );
}

function MetaSection({ product, editForm, isGenerating, isSaving, onUpdateMetaTitle, onUpdateMetaDescription, onGenerateAI, onSave, onCancel }: any) {
    const titleLength = editForm.metaTitle.length;
    const descLength = editForm.metaDescription.length;
    
    const generateSchemaPreview = (p: any) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "description": editForm.metaDescription || p.description,
        "image": p.images?.[0] || "",
        "offers": {
            "@type": "Offer",
            "price": p.variants?.[0]?.price || 0,
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock"
        }
    });
    
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Başlık
                        <span className={`ml-2 text-xs ${titleLength >= 30 && titleLength <= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                            ({titleLength}/60)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={editForm.metaTitle}
                        onChange={(e) => onUpdateMetaTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        maxLength={60}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Açıklama
                        <span className={`ml-2 text-xs ${descLength >= 120 && descLength <= 160 ? 'text-green-600' : 'text-orange-600'}`}>
                            ({descLength}/160)
                        </span>
                    </label>
                    <textarea
                        value={editForm.metaDescription}
                        onChange={(e) => onUpdateMetaDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        rows={3}
                        maxLength={160}
                    />
                </div>
            </div>

            {/* Google Preview */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Google Önizleme
                </div>
                <div className="space-y-1">
                    <div className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                        {editForm.metaTitle || product.name}
                    </div>
                    <div className="text-green-700 text-sm">ezmeo.com › urunler › {product.slug}</div>
                    <div className="text-gray-600 text-sm line-clamp-2">{editForm.metaDescription}</div>
                </div>
            </div>

            {/* Schema Preview */}
            <details className="bg-white rounded-lg border border-gray-200">
                <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Code className="w-4 h-4" /> Schema.org Önizleme
                </summary>
                <pre className="p-4 text-xs overflow-x-auto bg-gray-900 text-green-400 rounded-b-lg max-h-64">
                    {JSON.stringify(generateSchemaPreview(product), null, 2)}
                </pre>
            </details>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <button onClick={onGenerateAI} disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium disabled:opacity-50">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGenerating ? "🤖 SEO Uzmanı Düşünüyor..." : "✨ AI SEO Uzmanı ile Oluştur"}
                </button>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">İptal</button>
                    <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </div>
        </>
    );
}

function FAQSection({ faq, onAdd, onUpdate, onRemove }: any) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-900">Sıkça Sorulan Sorular</h4>
                    <p className="text-sm text-gray-500">Google FAQ rich snippet için</p>
                </div>
                <button onClick={onAdd} className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20">+ Soru Ekle</button>
            </div>
            <div className="space-y-3">
                {faq.map((item: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                        <input
                            type="text"
                            value={item.question}
                            onChange={(e) => onUpdate(index, "question", e.target.value)}
                            placeholder="Soru"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <textarea
                            value={item.answer}
                            onChange={(e) => onUpdate(index, "answer", e.target.value)}
                            placeholder="Cevap"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                        />
                        <button onClick={() => onRemove(index)} className="text-xs text-red-600">Kaldır</button>
                    </div>
                ))}
            </div>
            {faq.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm bg-gray-100 rounded-lg">Henüz FAQ eklenmemiş.</div>
            )}
        </div>
    );
}

function GEOSection({ keyTakeaways, onAdd, onUpdate, onRemove }: any) {
    return (
        <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">GEO / LLM Optimizasyonu</h4>
                </div>
                <p className="text-sm text-purple-700">ChatGPT, Perplexity ve AI sistemlerinin ürününüzü anlamasına yardımcı olun.</p>
            </div>
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Önemli Çıkarımlar</h4>
                    <button onClick={onAdd} className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg">+ Ekle</button>
                </div>
                <div className="space-y-2">
                    {keyTakeaways.map((takeaway: string, index: number) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={takeaway}
                                onChange={(e) => onUpdate(index, e.target.value)}
                                placeholder={`Çıkarım ${index + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                            <button onClick={() => onRemove(index)} className="px-2 text-red-600">×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
