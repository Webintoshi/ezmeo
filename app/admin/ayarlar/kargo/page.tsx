"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Truck, Map, Trash2, Edit2 } from "lucide-react";
import { getShippingZones, deleteShippingZone } from "@/lib/shipping";
import { ShippingZone, ShippingRate } from "@/lib/shipping-storage";

export default function ShippingSettingsPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);

    useEffect(() => {
        setZones(getShippingZones());
    }, []);

    const handleDeleteZone = (id: string) => {
        if (confirm("Bu bölgeyi silmek istediğinizden emin misiniz?")) {
            deleteShippingZone(id);
            setZones(getShippingZones());
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kargo ve Teslimat</h1>
                    <p className="text-sm text-gray-500 mt-1">Kargo bölgelerini ve ücretlerini yönetin.</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Bölge Ekle
                </button>
            </div>

            <div className="space-y-6">
                {zones.map((zone) => (
                    <div key={zone.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
                                    <Map className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{zone.countries.join(", ")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition-colors">
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => handleDeleteZone(zone.id)}
                                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/30 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Kargo Seçeneği</th>
                                        <th className="px-6 py-3 font-medium">Koşul</th>
                                        <th className="px-6 py-3 font-medium text-right">Ücret</th>
                                        <th className="px-6 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {zone.rates.map((rate: ShippingRate) => (
                                        <tr key={rate.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-gray-400" />
                                                {rate.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{rate.condition}</td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                {rate.price === 0 ? "Ücretsiz" : `₺${rate.price.toFixed(2)}`}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all p-1">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <Plus className="w-4 h-4" />
                                    Yeni Ücret Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Basit Kargo Integration */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            B
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-900">Basit Kargo Entegrasyonu</h3>
                            <p className="text-xs text-gray-500">API anahtarlarınızı girerek kargo süreçlerinizi otomatikleştirin.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktif
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        defaultValue="61FCA4B2-501A-490C-9584-CA5A6294C404"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                    />
                                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Basit Kargo panelinden alacağınız API anahtarı.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gönderici Profili</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option>Ezmeo</option>
                                        <option>Depo 1</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres Tercihi</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option>Home Ofis</option>
                                        <option>Depo Adresi</option>
                                        <option>Mağaza Adresi</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-2">Entegrasyon Durumu</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700">Bağlantı Testi</span>
                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        Başarılı
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700">Son Eşitleme</span>
                                    <span className="text-blue-900 font-medium">Az önce</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-700">Bakiye</span>
                                    <span className="text-blue-900 font-medium font-mono">0.65 TL</span>
                                </div>

                                <div className="pt-4 mt-2 border-t border-blue-200">
                                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                        Ayarları Kaydet ve Test Et
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Promo */}
            <div className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <Truck className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900">Kargo Entegrasyonları</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
                    Yurtiçi Kargo, Aras Kargo veya MNG Kargo entegrasyonlarını etkinleştirerek siparişlerinizi otomatik olarak iletin ve takip numaralarını alın.
                </p>
                <button className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-colors text-sm">
                    Entegrasyonları Keşfet
                </button>
            </div>
        </div>
    );
}
