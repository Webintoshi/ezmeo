"use client";

import { useState, useEffect } from "react";
import { Wand2, Search, RotateCcw, Save, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { getAllProducts, updateProduct } from "@/lib/products";
import { Product } from "@/types/product";
import { generateMetaTags } from "@/lib/seo-engine";

export default function MetaWizardPage() {
    // ... (rest of the file until the error area)
    // We need to target specific areas.
    // Let's do imports first.

    const [products, setProducts] = useState<Product[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [previewUpdates, setPreviewUpdates] = useState<{ id: string, name: string, oldTitle?: string, newTitle: string, oldDesc?: string, newDesc: string }[]>([]);

    useEffect(() => {
        // Load products initially
        setProducts(getAllProducts());
    }, []);

    const handleAnalyze = () => {
        setAnalyzing(true);
        setMessage(null);
        setPreviewUpdates([]);

        setTimeout(() => {
            const allProducts = getAllProducts();
            const updates: typeof previewUpdates = [];

            allProducts.forEach(product => {
                // Check if meta tags are missing or weak (simple logic: empty or too short)
                const needsUpdate = !product.seoTitle || !product.seoDescription || product.seoDescription.length < 50;

                if (needsUpdate) {
                    const { title, description } = generateMetaTags(product);

                    // Only add if different
                    if (title !== product.seoTitle || description !== product.seoDescription) {
                        updates.push({
                            id: product.id,
                            name: product.name,
                            oldTitle: product.seoTitle,
                            newTitle: title,
                            oldDesc: product.seoDescription,
                            newDesc: description
                        });
                    }
                }
            });

            setPreviewUpdates(updates);
            setAnalyzing(false);

            if (updates.length === 0) {
                setMessage({ type: "success", text: "Harika! Tüm ürünlerin meta etiketleri eksiksiz görünüyor." });
            } else {
                setMessage({ type: "success", text: `${updates.length} ürün için iyileştirme önerisi bulundu.` });
            }
        }, 800);
    };

    const handleApplyUpdates = () => {
        if (!confirm(`${previewUpdates.length} ürünün meta etiketleri güncellenecek. Onaylıyor musunuz?`)) return;

        setProcessing(true);
        let count = 0;

        try {
            previewUpdates.forEach(update => {
                updateProduct(update.id, {
                    seoTitle: update.newTitle,
                    seoDescription: update.newDesc
                });
                count++;
            });

            setMessage({ type: "success", text: `${count} ürün başarıyla güncellendi!` });
            setPreviewUpdates([]);
            setProducts(getAllProducts()); // Refresh local state
        } catch (e) {
            setMessage({ type: "error", text: "Güncelleme sırasında bir hata oluştu." });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Wand2 className="w-8 h-8 text-purple-600" />
                    Meta Sihirbazı
                </h1>
                <p className="text-gray-500">
                    Eksik veya zayıf meta etiketlerini otomatik olarak tespit edin ve düzeltin.
                </p>
            </div>

            {/* Control Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        {products.length} Ürün Tarandı
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || processing}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        {analyzing ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        {analyzing ? "Analiz Ediliyor..." : "Tekrar Analiz Et"}
                    </button>

                    <button
                        onClick={handleApplyUpdates}
                        disabled={previewUpdates.length === 0 || processing}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                    >
                        {processing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {processing ? "Uygulanıyor..." : "Tümünü Uygula"}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Results List */}
            <div className="space-y-4">
                {previewUpdates.length > 0 && (
                    <h2 className="font-semibold text-gray-800 ml-1">Önerilen Değişiklikler ({previewUpdates.length})</h2>
                )}

                {previewUpdates.map((update) => (
                    <div key={update.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <span className="font-semibold text-gray-900">{update.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">ID: {update.id}</span>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Old State */}
                            <div className="space-y-2 opacity-60">
                                <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                                    <FileText className="w-4 h-4" /> Eski Meta
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-sm">
                                    <p className="font-medium text-gray-700 mb-1">Başlık:</p>
                                    <p className="text-gray-600 mb-2 truncate">{update.oldTitle || "(Boş)"}</p>
                                    <p className="font-medium text-gray-700 mb-1">Açıklama:</p>
                                    <p className="text-gray-600 line-clamp-2">{update.oldDesc || "(Boş)"}</p>
                                </div>
                            </div>

                            {/* New State */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                    <Wand2 className="w-4 h-4" /> Yeni Meta (Öneri)
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm">
                                    <p className="font-medium text-gray-700 mb-1">Başlık:</p>
                                    <p className="text-gray-900 mb-2">{update.newTitle}</p>
                                    <p className="font-medium text-gray-700 mb-1">Açıklama:</p>
                                    <p className="text-gray-800">{update.newDesc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {!analyzing && previewUpdates.length === 0 && !message && (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed p-12 text-center">
                        <Wand2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Analiz Bekleniyor</h3>
                        <p className="text-gray-500">Ürünlerinizi taramak ve SEO önerileri almak için &quot;Tekrar Analiz Et&quot; butonuna tıklayın.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Icon wrapper to avoid lint errors if needed, but standard import should work.
function RefreshCw({ className }: { className?: string }) {
    return <RotateCcw className={className} />;
}
