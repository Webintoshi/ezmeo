"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Plus, Save, Trash2, Wand2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { KeywordRule, getSeoRules, saveSeoRules, autoLinkContent, generateDefaultRulesFromProducts } from "@/lib/seo-engine";
import { getAllProducts, updateProduct } from "@/lib/products";

export default function InternalLinkingPage() {
    const [rules, setRules] = useState<KeywordRule[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // New Rule State
    const [newKeyword, setNewKeyword] = useState("");
    const [newUrl, setNewUrl] = useState("");

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = () => {
        const stored = getSeoRules();
        setRules(stored);
    };

    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword || !newUrl) return;

        const newRule: KeywordRule = {
            id: Date.now().toString(),
            keyword: newKeyword,
            url: newUrl,
            active: true,
        };

        const updated = [...rules, newRule];
        setRules(updated);
        saveSeoRules(updated);
        setNewKeyword("");
        setNewUrl("");
        setMessage({ type: "success", text: "Kural eklendi." });
    };

    const handleDeleteRule = (id: string) => {
        const updated = rules.filter(r => r.id !== id);
        setRules(updated);
        saveSeoRules(updated);
    };

    const handleGenerateFromProducts = () => {
        if (!confirm("Mevcut ürün isimlerinden otomatik kural oluşturmak istiyor musunuz?")) return;

        const defaults = generateDefaultRulesFromProducts();
        // Merge avoiding duplicates
        const currentKeywords = new Set(rules.map(r => r.keyword.toLowerCase()));
        const newRules = defaults.filter(r => !currentKeywords.has(r.keyword.toLowerCase()));

        if (newRules.length === 0) {
            setMessage({ type: "error", text: "Eklenecek yeni ürün kuralı bulunamadı." });
            return;
        }

        const updated = [...rules, ...newRules];
        setRules(updated);
        saveSeoRules(updated);
        setMessage({ type: "success", text: `${newRules.length} adet ürün kuralı eklendi.` });
    };

    const handleRunAutoLinker = () => {
        if (!confirm("Tüm ürün açıklamaları taranacak ve anahtar kelimeler linklenecek. Bu işlem geri alınamaz (ancak manuel düzeltebilirsiniz). Devam edilsin mi?")) return;

        setProcessing(true);
        setMessage(null);

        setTimeout(() => {
            try {
                const products = getAllProducts();
                let updateCount = 0;

                products.forEach(product => {
                    const originalDesc = product.description;
                    const newDesc = autoLinkContent(originalDesc, rules);

                    if (originalDesc !== newDesc) {
                        updateProduct(product.id, { description: newDesc });
                        updateCount++;
                    }
                });

                setMessage({ type: "success", text: `İşlem tamamlandı! ${updateCount} ürün güncellendi.` });
            } catch (error) {
                setMessage({ type: "error", text: "Bir hata oluştu." });
            } finally {
                setProcessing(false);
            }
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <LinkIcon className="w-8 h-8 text-blue-600" />
                    İç Linkleme Robotu
                </h1>
                <p className="text-gray-500">
                    Otomatik linkleme kurallarını buradan yönetin.
                </p>
            </div>

            {/* Stats / Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-gray-900">{rules.length}</span>
                        <span className="text-xs text-gray-500">Aktif Kural</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <button
                        onClick={handleGenerateFromProducts}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Ürünlerden Üret
                    </button>
                </div>

                <button
                    onClick={handleRunAutoLinker}
                    disabled={processing || rules.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                    {processing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Wand2 className="w-5 h-5" />
                    )}
                    {processing ? "Taranıyor..." : "Robotu Çalıştır & Linkle"}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rules List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800">Tanımlı Kurallar</h2>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {rules.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    Henüz kural yok. Yeni ekleyin veya ürünlerden oluşturun.
                                </div>
                            )}
                            {rules.map(rule => (
                                <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 bg-blue-50 px-2 py-0.5 rounded text-sm">{rule.keyword}</span>
                                            <span className="text-gray-400">→</span>
                                            <span className="text-gray-600 text-sm truncate max-w-[200px]">{rule.url}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Add Rule Form */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            Yeni Kural Ekle
                        </h2>
                        <form onSubmit={handleAddRule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Anahtar Kelime</label>
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    placeholder="Örn: Fıstık Ezmesi"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef URL</label>
                                <input
                                    type="text"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder="Örn: /urunler/fistik-ezmesi"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newKeyword || !newUrl}
                                className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Kuralı Kaydet
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
