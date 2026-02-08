"use client";

import { useState } from "react";
import { Save, Info, Globe, Mail, Phone, MapPin, Store } from "lucide-react";

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: "Ezmeo",
        storeEmail: "iletisim@ezmeo.com",
        storePhone: "+90 555 123 4567",
        currency: "TRY",
        timezone: "Europe/Istanbul",
        address: "Organize Sanayi Bölgesi, 1. Cadde, No: 5, Gaziantep",
        socialInstagram: "https://instagram.com/ezmeo",
        socialTwitter: "https://twitter.com/ezmeo",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        alert("Ayarlar başarıyla kaydedildi.");
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Genel Ayarlar</h1>
                    <p className="text-sm text-gray-500 mt-1">Mağazanızın temel bilgilerini düzenleyin.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Kaydet
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Section */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Store Details Card */}
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
                                        name="storeName"
                                        value={formData.storeName}
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
                                            name="storeEmail"
                                            value={formData.storeEmail}
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
                                        name="storePhone"
                                        value={formData.storePhone}
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

                    {/* Regional Settings Card */}
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


                {/* Right Column: Info & Tips */}
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
                                    value={formData.socialInstagram}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:border-gray-900 focus:ring-0"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500">Twitter / X</label>
                                <input
                                    type="text"
                                    name="socialTwitter"
                                    value={formData.socialTwitter}
                                    onChange={handleChange}
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

