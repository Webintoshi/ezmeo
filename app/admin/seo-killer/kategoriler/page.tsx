"use client";

import { useState, useEffect, useCallback } from "react";
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
    Loader2,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import type { 
    Category, 
    CategorySEOViewModel, 
    CategoryFAQ, 
    CategoryApiResponse 
} from "@/types/category";
import { toCategorySEOViewModel, toCategoryInput } from "@/types/category";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface EditFormState {
    metaTitle: string;
    metaDescription: string;
    faq: CategoryFAQ[];
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

const DEFAULT_GEO_ENTITIES = ["ProductCategory", "Food", "HealthFood"];

const EMPTY_FORM_STATE: EditFormState = {
    metaTitle: "",
    metaDescription: "",
    faq: [],
    keyTakeaways: []
};

// ============================================================================
// SCHEMA GENERATOR
// ============================================================================

function generateSchemaPreview(cat: CategorySEOViewModel): object {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": cat.name,
        "description": cat.metaDescription,
        "url": `https://ezmeo.com/koleksiyon/${cat.slug}`,
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://ezmeo.com" },
                { "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://ezmeo.com/koleksiyon/${cat.slug}` }
            ]
        },
        ...(cat.faq && cat.faq.length > 0 ? {
            "mainEntity": cat.faq.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        } : {})
    };
}

// ============================================================================
// API CLIENT
// ============================================================================

async function fetchCategories(): Promise<Category[]> {
    const response = await fetch("/api/categories", {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store" // Admin panel always fetches fresh data
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CategoryApiResponse = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "Failed to fetch categories");
    }

    return data.categories || [];
}

async function updateCategory(
    id: string, 
    formState: EditFormState
): Promise<Category> {
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

    const response = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: CategoryApiResponse = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "Failed to update category");
    }

    return data.category!;
}

async function generateWithAI(category: CategorySEOViewModel): Promise<Partial<EditFormState>> {
    const response = await fetch("/api/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "category",
            name: category.name,
            description: category.description,
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
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
    };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CategorySEOPage() {
    // ------------------------------------------------------------------------
    // STATE MANAGEMENT
    // ------------------------------------------------------------------------
    const [categories, setCategories] = useState<CategorySEOViewModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<EditFormState>(EMPTY_FORM_STATE);
    const [message, setMessage] = useState<MessageState | null>(null);
    const [generating, setGenerating] = useState<boolean>(false);
    const [activeSection, setActiveSection] = useState<SectionType>("meta");
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // ------------------------------------------------------------------------
    // DATA LOADING
    // ------------------------------------------------------------------------
    const loadCategories = useCallback(async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        else setLoading(true);
        
        setMessage(null);

        try {
            const rawCategories = await fetchCategories();
            
            // Transform to View Models
            const viewModels = rawCategories.map(cat => toCategorySEOViewModel(cat));
            
            setCategories(viewModels);
        } catch (error) {
            console.error("Error loading categories:", error);
            setMessage({ 
                type: "error", 
                text: error instanceof Error ? error.message : "Kategoriler yüklenirken hata oluştu." 
            });
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // ------------------------------------------------------------------------
    // EVENT HANDLERS
    // ------------------------------------------------------------------------
    const handleEdit = useCallback((category: CategorySEOViewModel) => {
        setEditingId(category.id);
        setEditForm({
            metaTitle: category.metaTitle,
            metaDescription: category.metaDescription,
            faq: category.faq || [],
            keyTakeaways: category.geo?.keyTakeaways || []
        });
        setActiveSection("meta");
        setMessage(null);
    }, []);

    const handleCancel = useCallback(() => {
        setEditingId(null);
        setEditForm(EMPTY_FORM_STATE);
        setMessage(null);
    }, []);

    const handleSave = useCallback(async (categoryId: string, categorySlug: string) => {
        setSaving(true);
        setMessage(null);

        try {
            const updatedCategory = await updateCategory(categoryId, editForm);
            
            // Update local state with transformed data
            setCategories(prev => prev.map(c =>
                c.id === categoryId
                    ? toCategorySEOViewModel(updatedCategory, c.clusterCount)
                    : c
            ));
            
            // Trigger on-demand revalidation for the collection page
            try {
                const revalidateRes = await fetch("/api/revalidate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: `/koleksiyon/${categorySlug}` })
                });
                
                if (!revalidateRes.ok) {
                    console.warn("Revalidation failed, will update on next request");
                }
            } catch (revError) {
                console.warn("Revalidation error:", revError);
            }
            
            setMessage({ type: "success", text: "Kategori SEO bilgileri başarıyla kaydedildi! Sayfa cache'i temizlendi." });
            setEditingId(null);
            setEditForm(EMPTY_FORM_STATE);
        } catch (error) {
            console.error("Save error:", error);
            setMessage({ 
                type: "error", 
                text: error instanceof Error ? error.message : "Kayıt başarısız oldu. Lütfen tekrar deneyin." 
            });
        } finally {
            setSaving(false);
        }
    }, [editForm]);

    const handleGenerateAI = useCallback(async (category: CategorySEOViewModel) => {
        setGenerating(true);
        setMessage(null);

        try {
            const generated = await generateWithAI(category);
            
            setEditForm(prev => ({
                ...prev,
                metaTitle: generated.metaTitle || prev.metaTitle,
                metaDescription: generated.metaDescription || prev.metaDescription,
            }));
            
            setMessage({
                type: "success",
                text: "Toshi AI ile başarıyla oluşturuldu!"
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

    // ------------------------------------------------------------------------
    // FORM HANDLERS
    // ------------------------------------------------------------------------
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

    const updateFAQ = useCallback((index: number, field: keyof CategoryFAQ, value: string) => {
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

    // ------------------------------------------------------------------------
    // RENDER HELPERS
    // ------------------------------------------------------------------------
    const renderLoading = () => (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Kategoriler yükleniyor...</span>
        </div>
    );

    const renderEmptyState = () => (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kategori Bulunamadı</h3>
            <p className="text-gray-500 mb-4">Veritabanında aktif kategori bulunmuyor.</p>
            <button
                onClick={() => loadCategories(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                Yenile
            </button>
        </div>
    );

    // ------------------------------------------------------------------------
    // MAIN RENDER
    // ------------------------------------------------------------------------
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
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
                <button
                    onClick={() => loadCategories(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Yenile
                </button>
            </div>

            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && renderLoading()}

            {/* Empty State */}
            {!loading && categories.length === 0 && renderEmptyState()}

            {/* Categories List */}
            {!loading && categories.length > 0 && (
                <div className="space-y-4">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            isEditing={editingId === category.id}
                            isSaving={saving}
                            isGenerating={generating}
                            activeSection={activeSection}
                            editForm={editForm}
                            onEdit={() => handleEdit(category)}
                            onSave={() => handleSave(category.id, category.slug)}
                            onCancel={handleCancel}
                            onGenerateAI={() => handleGenerateAI(category)}
                            onSectionChange={setActiveSection}
                            onUpdateMetaTitle={updateMetaTitle}
                            onUpdateMetaDescription={updateMetaDescription}
                            onAddFAQ={addFAQ}
                            onUpdateFAQ={updateFAQ}
                            onRemoveFAQ={removeFAQ}
                            onAddKeyTakeaway={addKeyTakeaway}
                            onUpdateKeyTakeaway={updateKeyTakeaway}
                            onRemoveKeyTakeaway={removeKeyTakeaway}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// SUB-COMPONENT: Category Card
// ============================================================================

interface CategoryCardProps {
    category: CategorySEOViewModel;
    isEditing: boolean;
    isSaving: boolean;
    isGenerating: boolean;
    activeSection: SectionType;
    editForm: EditFormState;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onGenerateAI: () => void;
    onSectionChange: (section: SectionType) => void;
    onUpdateMetaTitle: (value: string) => void;
    onUpdateMetaDescription: (value: string) => void;
    onAddFAQ: () => void;
    onUpdateFAQ: (index: number, field: keyof CategoryFAQ, value: string) => void;
    onRemoveFAQ: (index: number) => void;
    onAddKeyTakeaway: () => void;
    onUpdateKeyTakeaway: (index: number, value: string) => void;
    onRemoveKeyTakeaway: (index: number) => void;
}

function CategoryCard({
    category,
    isEditing,
    isSaving,
    isGenerating,
    activeSection,
    editForm,
    onEdit,
    onSave,
    onCancel,
    onGenerateAI,
    onSectionChange,
    onUpdateMetaTitle,
    onUpdateMetaDescription,
    onAddFAQ,
    onUpdateFAQ,
    onRemoveFAQ,
    onAddKeyTakeaway,
    onUpdateKeyTakeaway,
    onRemoveKeyTakeaway
}: CategoryCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">/koleksiyon/{category.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
                        CollectionPage
                    </span>
                    {!isEditing && (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            Düzenle
                        </button>
                    )}
                </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
                <div className="p-4 space-y-4 bg-gray-50">
                    {/* Section Tabs */}
                    <div className="flex gap-2 border-b border-gray-200">
                        <TabButton
                            active={activeSection === "meta"}
                            onClick={() => onSectionChange("meta")}
                            label="Meta Bilgileri"
                        />
                        <TabButton
                            active={activeSection === "faq"}
                            onClick={() => onSectionChange("faq")}
                            label="FAQ Schema"
                            badge={editForm.faq.length > 0 ? editForm.faq.length : undefined}
                            icon={<HelpCircle className="w-4 h-4" />}
                        />
                        <TabButton
                            active={activeSection === "geo"}
                            onClick={() => onSectionChange("geo")}
                            label="GEO/LLM"
                            icon={<Bot className="w-4 h-4" />}
                        />
                    </div>

                    {/* Meta Section */}
                    {activeSection === "meta" && (
                        <MetaSection
                            category={category}
                            editForm={editForm}
                            isGenerating={isGenerating}
                            isSaving={isSaving}
                            onUpdateMetaTitle={onUpdateMetaTitle}
                            onUpdateMetaDescription={onUpdateMetaDescription}
                            onGenerateAI={onGenerateAI}
                            onSave={onSave}
                            onCancel={onCancel}
                        />
                    )}

                    {/* FAQ Section */}
                    {activeSection === "faq" && (
                        <FAQSection
                            faq={editForm.faq}
                            onAdd={onAddFAQ}
                            onUpdate={onUpdateFAQ}
                            onRemove={onRemoveFAQ}
                        />
                    )}

                    {/* GEO Section */}
                    {activeSection === "geo" && (
                        <GEOSection
                            keyTakeaways={editForm.keyTakeaways}
                            onAdd={onAddKeyTakeaway}
                            onUpdate={onUpdateKeyTakeaway}
                            onRemove={onRemoveKeyTakeaway}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function TabButton({ 
    active, 
    onClick, 
    label, 
    badge,
    icon 
}: { 
    active: boolean; 
    onClick: () => void; 
    label: string;
    badge?: number;
    icon?: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                active
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
            <span className="flex items-center gap-1">
                {icon}
                {label}
                {badge !== undefined && badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {badge}
                    </span>
                )}
            </span>
        </button>
    );
}

function MetaSection({
    category,
    editForm,
    isGenerating,
    isSaving,
    onUpdateMetaTitle,
    onUpdateMetaDescription,
    onGenerateAI,
    onSave,
    onCancel
}: {
    category: CategorySEOViewModel;
    editForm: EditFormState;
    isGenerating: boolean;
    isSaving: boolean;
    onUpdateMetaTitle: (value: string) => void;
    onUpdateMetaDescription: (value: string) => void;
    onGenerateAI: () => void;
    onSave: () => void;
    onCancel: () => void;
}) {
    const titleLength = editForm.metaTitle.length;
    const descLength = editForm.metaDescription.length;
    const isTitleOptimal = titleLength >= 30 && titleLength <= 60;
    const isDescOptimal = descLength >= 120 && descLength <= 160;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Başlık
                        <span className={`ml-2 text-xs ${isTitleOptimal ? 'text-green-600' : 'text-orange-600'}`}>
                            ({titleLength}/60)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={editForm.metaTitle}
                        onChange={(e) => onUpdateMetaTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        maxLength={60}
                        placeholder="Sayfa başlığı..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Açıklama
                        <span className={`ml-2 text-xs ${isDescOptimal ? 'text-green-600' : 'text-orange-600'}`}>
                            ({descLength}/160)
                        </span>
                    </label>
                    <textarea
                        value={editForm.metaDescription}
                        onChange={(e) => onUpdateMetaDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        rows={3}
                        maxLength={160}
                        placeholder="Sayfa açıklaması..."
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
                    <div className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                        {editForm.metaTitle || category.name}
                    </div>
                    <div className="text-green-700 text-sm">
                        ezmeo.com › koleksiyon › {category.slug}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-2">
                        {editForm.metaDescription || category.description || "Açıklama bulunmuyor..."}
                    </div>
                </div>
            </div>

            {/* Schema Preview */}
            <details className="bg-white rounded-lg border border-gray-200">
                <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Schema.org Önizleme (JSON-LD)
                </summary>
                <pre className="p-4 text-xs overflow-x-auto bg-gray-900 text-green-400 rounded-b-lg max-h-64 overflow-y-auto">
                    {JSON.stringify(generateSchemaPreview(category), null, 2)}
                </pre>
            </details>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={onGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all text-sm font-medium disabled:opacity-50 border border-purple-200"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    {isGenerating ? "Oluşturuluyor..." : "Toshi AI ile Oluştur"}
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>
            </div>
        </>
    );
}

function FAQSection({
    faq,
    onAdd,
    onUpdate,
    onRemove
}: {
    faq: CategoryFAQ[];
    onAdd: () => void;
    onUpdate: (index: number, field: keyof CategoryFAQ, value: string) => void;
    onRemove: (index: number) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-900">Sıkça Sorulan Sorular</h4>
                    <p className="text-sm text-gray-500">Google FAQ rich snippet için soru-cevap ekleyin</p>
                </div>
                <button
                    onClick={onAdd}
                    className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                    + Soru Ekle
                </button>
            </div>
            
            <div className="space-y-3">
                {faq.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Soru</label>
                            <input
                                type="text"
                                value={item.question}
                                onChange={(e) => onUpdate(index, "question", e.target.value)}
                                placeholder="Örn: Bu ürün vegan mı?"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Cevap</label>
                            <textarea
                                value={item.answer}
                                onChange={(e) => onUpdate(index, "answer", e.target.value)}
                                placeholder="Cevabı yazın..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            />
                        </div>
                        <button
                            onClick={() => onRemove(index)}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Kaldır
                        </button>
                    </div>
                ))}
            </div>
            
            {faq.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm bg-gray-100 rounded-lg">
                    Henüz FAQ eklenmemiş. "Soru Ekle" butonuna tıklayın.
                </div>
            )}
        </div>
    );
}

function GEOSection({
    keyTakeaways,
    onAdd,
    onUpdate,
    onRemove
}: {
    keyTakeaways: string[];
    onAdd: () => void;
    onUpdate: (index: number, value: string) => void;
    onRemove: (index: number) => void;
}) {
    return (
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
                        onClick={onAdd}
                        className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        + Ekle
                    </button>
                </div>
                
                <div className="space-y-2">
                    {keyTakeaways.map((takeaway, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={takeaway}
                                onChange={(e) => onUpdate(index, e.target.value)}
                                placeholder={`Çıkarım ${index + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                onClick={() => onRemove(index)}
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
    );
}
