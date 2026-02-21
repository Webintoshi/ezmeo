"use client";

import { useState } from "react";
import { FileCode, ExternalLink, Download, CheckCircle2, History, Bot, Shield } from "lucide-react";

export default function SitemapManagerPage() {
    const sitemapUrl = typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : 'https://ezmeo.com/sitemap.xml';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileCode className="w-8 h-8 text-orange-600" />
                    Sitemap Yöneticisi
                </h1>
                <p className="text-gray-500">
                    Otomatik oluşturulan site haritanızı görüntüleyin ve yönetin.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Sitemap Durumu</h2>

                    <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 mb-6">
                        <CheckCircle2 className="w-6 h-6" />
                        <div>
                            <span className="block font-semibold">Aktif ve Erişilebilir</span>
                            <span className="text-sm opacity-80">Son güncelleme: {new Date().toLocaleDateString()} (Otomatik)</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sitemap Index (Ana Dosya)</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    readOnly
                                    value={sitemapUrl}
                                    className="flex-1 px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-800 font-mono text-sm font-semibold"
                                />
                                <a
                                    href="/sitemap.xml"
                                    target="_blank"
                                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Ürünler Haritası</label>
                                    <a href="/sitemap-products.xml" target="_blank" className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-xs text-gray-600 font-mono">
                                        <ExternalLink className="w-3 h-3" /> /sitemap-products.xml
                                    </a>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Sayfalar Haritası</label>
                                    <a href="/sitemap-pages.xml" target="_blank" className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-xs text-gray-600 font-mono">
                                        <ExternalLink className="w-3 h-3" /> /sitemap-pages.xml
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-3">
                                Sitemap.xml dosyanız Next.js tarafından <strong>dinamik olarak</strong> üretilmektedir. Ürün eklediğinizde veya güncellediğinizde anında yansır.
                            </p>
                            <a
                                href="/sitemap.xml"
                                download
                                className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
                            >
                                <Download className="w-4 h-4" />
                                Dosya olarak indir
                            </a>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" />
                        İçerik Özeti
                    </h2>

                    <div className="space-y-0 text-sm text-gray-600">
                        <p>Şu an sitemap içerisinde:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                            <li>Ana Sayfa</li>
                            <li>Kurumsal Sayfalar (Hakkımızda, İletişim vb.)</li>
                            <li>Tüm Ürün Sayfaları</li>
                            <li>Tüm Kategori Sayfaları</li>
                            <li>Blog Yazıları (Varsa)</li>
                        </ul>
                    </div>

                    <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-1 text-sm">Google'a Gönderme</h3>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Sitemap'inizi Google Search Console'a eklemek için URL'yi kopyalayın ve Search Console panelindeki "Sitemaps" bölümüne yapıştırın.
                        </p>
                    </div>
                </div>

                {/* AI Bot Kontrolü Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-600" />
                        AI Bot Kontrolü
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-green-600" />
                                <h3 className="font-semibold text-green-800 text-sm">Koruma Durumu</h3>
                            </div>
                            <p className="text-xs text-green-700 leading-relaxed">
                                Robots.txt dosyanız 15+ AI botu için yapılandırılmış. Crawl-delay değerleri ile hız sınırlaması aktif.
                            </p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Bot className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-purple-800 text-sm">Yönetilen Botlar</h3>
                            </div>
                            <p className="text-xs text-purple-700 leading-relaxed">
                                GPTBot, ClaudeBot, PerplexityBot, Google-Extended ve daha fazlası için özel kurallar tanımlı.
                            </p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-2 mb-2">
                                <FileCode className="w-5 h-5 text-orange-600" />
                                <h3 className="font-semibold text-orange-800 text-sm">Robots.txt</h3>
                            </div>
                            <p className="text-xs text-orange-700 leading-relaxed">
                                <a href="/robots.txt" target="_blank" className="hover:underline font-medium">
                                    /robots.txt
                                </a>{" "}
                                dosyası dinamik olarak üretilmektedir. Değişiklikler otomatik uygulanır.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">Engellenen Dizinler (Tüm Botlar İçin)</h4>
                        <div className="flex flex-wrap gap-2">
                            {['/admin/', '/api/', '/giris/', '/kayit/', '/sepet/', '/odeme/'].map((path) => (
                                <span key={path} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-mono">
                                    {path}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                        <p>💡 Not: Robots.txt gönüllü uyum esasına dayanır. Kötü niyetli botları engellemek için ek güvenlik önlemleri (WAF, Rate Limiting) gerekebilir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
