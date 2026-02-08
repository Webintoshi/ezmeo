"use client";

import { Rocket, Link as LinkIcon, Wand2 } from "lucide-react";
import Link from "next/link";

export default function SEOKillerDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Rocket className="w-8 h-8 text-primary" />
                    SEO Killer Dashboard
                </h1>
                <p className="text-gray-500 mt-2">
                    Sitenizin arama motoru performansını en üst düzeye çıkarmak için tasarlanmış gelişmiş araç seti.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Smart Internal Linking Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <LinkIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">İç Linkleme Robotu</h2>
                    <p className="text-gray-500 mb-6">
                        Ürün açıklamalarındaki anahtar kelimeleri otomatik tarar ve ilgili kategorilere veya ürünlere link verir. Site içi dolaşımı artırır.
                    </p>
                    <Link
                        href="/admin/seo-killer/ic-linkleme"
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Robotu Başlat
                    </Link>
                </div>

                {/* Auto Meta Generator Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Wand2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Meta Sihirbazı</h2>
                    <p className="text-gray-500 mb-6">
                        Eksik veya zayıf meta başlıklarını ve açıklamalarını otomatik analiz eder ve SEO uyumlu şablonlarla yeniden oluşturur.
                    </p>
                    <Link
                        href="/admin/seo-killer/meta-sihirbazi"
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                        Sihirbazı Aç
                    </Link>
                </div>
            </div>

            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Site Sağlık Skoru</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-6xl font-bold">85</span>
                        <span className="text-2xl text-gray-400 mb-2">/100</span>
                    </div>
                    <p className="text-gray-400 mt-2">
                        Siteniz genel olarak iyi durumda ancak iç linkleme yapısında geliştirmeler yapılabilir.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
        </div>
    );
}
