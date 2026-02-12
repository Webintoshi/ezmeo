"use client";

import { useState, useEffect } from "react";
import { Save, Info, Globe, Mail, Phone, MapPin, Store } from "lucide-react";
import { toast } from "sonner";

interface StoreInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    timezone: string;
    socialInstagram?: string;
    socialTwitter?: string;
}

const DEFAULT_STORE_INFO: StoreInfo = {
    name: "Ezmeo",
    email: "iletisim@ezmeo.com",
    phone: "+90 555 123 4567",
    address: "",
    currency: "TRY",
    timezone: "Europe/Istanbul",
    socialInstagram: "",
    socialTwitter: "",
};

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<StoreInfo>(DEFAULT_STORE_INFO);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/settings?type=store");
            const data = await res.json();
            
            if (data.success && data.storeInfo) {
                setFormData({
                    ...DEFAULT_STORE_INFO,
                    ...data.storeInfo,
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            toast.error("Ayarlar yüklenirken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "store",
                    storeInfo: formData,
                }),
            });
            
            const data = await res.json();
            
            if (data.success) {
                toast.success("Ayarlar başarıyla kaydedildi");
            } else {
                throw new Error(data.error || "Kaydetme başarısız");
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Ayarlar kaydedilirken hata oluştu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Genel Ayarlar</h1>
                    <p className="text-sm text-gray-500 mt-1">Mağazanızın temel bilgilerini düzenleyin.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Kaydet
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Store className="w-4 h-4 text-gray-400" />
                                Mağaza Bilgileri
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mağaza Adı</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">İletişim E-posta</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea
                                        rows={3}
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-500" />
                                Bölgesel Ayarlar
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all bg-white text-sm"
                                    >
                                        <option value="TRY">Türk Lirası (₺)</option>
                                        <option value="USD">Amerikan Doları ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zaman Dilimi</label>
                                    <select
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all bg-white text-sm"
                                    >
                                        <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                                        <option value="UTC">UTC (GMT+0)</option>
                                        <option value="Europe/London">Europe/London (GMT+1)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4" />
                            İpucu
                        </h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Mağaza bilgileriniz e-postalarınızda ve faturalarınızda görünür. Müşterilerinizle güven oluşturmak için doğru bilgileri girdiğinizden emin olun.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Sosyal Medya</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Instagram</label>
                                <input
                                    type="text"
                                    name="socialInstagram"
                                    value={formData.socialInstagram || ""}
                                    onChange={handleChange}
                                    placeholder="https://instagram.com/ezmeo"
                                    className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:border-gray-900 focus:ring-0"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500">Twitter / X</label>
                                <input
                                    type="text"
                                    name="socialTwitter"
                                    value={formData.socialTwitter || ""}
                                    onChange={handleChange}
                                    placeholder="https://twitter.com/ezmeo"
                                    className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:border-gray-900 focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
