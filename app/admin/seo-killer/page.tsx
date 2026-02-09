"use client";

import { useState, useEffect } from "react";
import {
    Rocket,
    Search,
    FileText,
    Tag,
    Package,
    FolderOpen,
    Globe,
    AlertTriangle,
    CheckCircle2,
    Wand2,
    Save,
    RefreshCw,
    Eye,
    ExternalLink,
    MoreHorizontal,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

interface SEOItem {
    id: string;
    type: "product" | "category" | "page";
    name: string;
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    schemaType?: string;
    url: string;
    score: number;
    issues: string[];
}

interface SEOStats {
    totalItems: number;
    withMeta: number;
    withSchema: number;
    avgScore: number;
}

export default function SEOKillerDashboard() {
    const [items, setItems] = useState<SEOItem[]>([]);
    const [stats, setStats] = useState<SEOStats>({ totalItems: 0, withMeta: 0, withSchema: 0, avgScore: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "product" | "category" | "page">("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadSEOData();
    }, []);

    const loadSEOData = async () => {
        setLoading(true);
        try {
            // Fetch products from API
            const productsRes = await fetch("/api/products");
            const productsData = await productsRes.json();
            const products = productsData.products || [];

            const seoItems: SEOItem[] = [];

            // Process products
            products.forEach((product: Record<string, unknown>) => {
                const issues: string[] = [];
                let score = 100;

                // Check meta title
                if (!product.meta_title && !product.seo_title) {
                    issues.push("Meta başlık eksik");
                    score -= 20;
                } else if ((product.meta_title as string || "").length < 30 || (product.meta_title as string || "").length > 60) {
                    issues.push("Meta başlık uzunluğu ideal değil (30-60 karakter)");
                    score -= 10;
                }

                // Check meta description
                if (!product.meta_description && !product.seo_description) {
                    issues.push("Meta açıklama eksik");
                    score -= 20;
                } else if ((product.meta_description as string || "").length < 120 || (product.meta_description as string || "").length > 160) {
                    issues.push("Meta açıklama uzunluğu ideal değil (120-160 karakter)");
                    score -= 10;
                }

                // Check schema
                if (!product.schema_type) {
                    issues.push("Şema türü tanımlanmamış");
                    score -= 15;
                }

                // Check images
                if (!product.images || (product.images as string[]).length === 0) {
                    issues.push("Ürün görseli yok");
                    score -= 15;
                }

                // Check description
                if (!product.description || (product.description as string).length < 100) {
                    issues.push("Ürün açıklaması yetersiz");
                    score -= 10;
                }

                seoItems.push({
                    id: product.id as string,
                    type: "product",
                    name: product.name as string || "",
                    slug: product.slug as string || "",
                    metaTitle: (product.meta_title || product.seo_title) as string,
                    metaDescription: (product.meta_description || product.seo_description) as string,
                    schemaType: (product.schema_type as string) || "Product",
                    url: `/urunler/${product.slug}`,
                    score: Math.max(0, score),
                    issues,
                });
            });

            // Add static pages
            const staticPages = [
                { name: "Ana Sayfa", slug: "", url: "/" },
                { name: "Ürünler", slug: "urunler", url: "/urunler" },
                { name: "Blog", slug: "blog", url: "/blog" },
                { name: "İletişim", slug: "iletisim", url: "/iletisim" },
                { name: "Hakkımızda", slug: "hakkimizda", url: "/hakkimizda" },
                { name: "SSS", slug: "sss", url: "/sss" },
                { name: "Gizlilik Politikası", slug: "gizlilik", url: "/gizlilik" },
                { name: "Şartlar ve Koşullar", slug: "sartlar", url: "/sartlar" },
            ];

            staticPages.forEach((page) => {
                seoItems.push({
                    id: `page-${page.slug || "home"}`,
                    type: "page",
                    name: page.name,
                    slug: page.slug,
                    url: page.url,
                    schemaType: page.slug === "" ? "WebSite" : "WebPage",
                    score: 70, // Base score for static pages
                    issues: ["Manuel inceleme gerekli"],
                });
            });

            // Add categories
            const categories = [
                { name: "Fıstık Ezmesi", slug: "fistik-ezmesi" },
                { name: "Badem Ezmesi", slug: "badem-ezmesi" },
                { name: "Fındık Ezmesi", slug: "findik-ezmesi" },
                { name: "Antep Fıstığı Ezmesi", slug: "antep-fistigi-ezmesi" },
                { name: "Kuruyemiş", slug: "kuruyemis" },
            ];

            categories.forEach((cat) => {
                seoItems.push({
                    id: `cat-${cat.slug}`,
                    type: "category",
                    name: cat.name,
                    slug: cat.slug,
                    url: `/kategori/${cat.slug}`,
                    schemaType: "CollectionPage",
                    score: 65,
                    issues: ["Kategori meta bilgisi güncellenmeli"],
                });
            });

            setItems(seoItems);

            // Calculate stats
            const withMeta = seoItems.filter(i => i.metaTitle && i.metaDescription).length;
            const withSchema = seoItems.filter(i => i.schemaType).length;
            const avgScore = Math.round(seoItems.reduce((acc, i) => acc + i.score, 0) / seoItems.length);

            setStats({
                totalItems: seoItems.length,
                withMeta,
                withSchema,
                avgScore,
            });

        } catch (error) {
            console.error("Failed to load SEO data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items
        .filter(item => filter === "all" || item.type === filter)
        .filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "product": return <Package className="w-4 h-4" />;
            case "category": return <FolderOpen className="w-4 h-4" />;
            case "page": return <FileText className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "product": return "Ürün";
            case "category": return "Kategori";
            case "page": return "Sayfa";
            default: return type;
        }
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Rocket className="w-8 h-8 text-primary" />
                    SEO Yönetim Merkezi
                </h1>
                <p className="text-gray-500 mt-2">
                    Tüm sayfalarınızın SEO durumunu tek bir yerden yönetin.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
                    <div className="text-sm text-gray-500">Toplam Sayfa</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-green-600">{stats.withMeta}</div>
                    <div className="text-sm text-gray-500">Meta Tamamlanmış</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-2xl font-bold text-blue-600">{stats.withSchema}</div>
                    <div className="text-sm text-gray-500">Şema Tanımlı</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className={`text-2xl font-bold ${stats.avgScore >= 80 ? 'text-green-600' : stats.avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {stats.avgScore}/100
                    </div>
                    <div className="text-sm text-gray-500">Ortalama Skor</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/admin/seo-killer/urunler"
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Ürün SEO</h3>
                                <p className="text-sm text-gray-500">Schema.org Product yapısı</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    href="/admin/seo-killer/kategoriler"
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FolderOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Kategori SEO</h3>
                                <p className="text-sm text-gray-500">CollectionPage yapısı</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    href="/admin/seo-killer/sayfalar"
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Sayfa SEO</h3>
                                <p className="text-sm text-gray-500">WebPage & BreadcrumbList</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Sayfa ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { key: "all", label: "Tümü" },
                        { key: "product", label: "Ürünler" },
                        { key: "category", label: "Kategoriler" },
                        { key: "page", label: "Sayfalar" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as typeof filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.key
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={loadSEOData}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sayfa</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tür</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Şema</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Skor</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sorunlar</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.url}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            {getTypeIcon(item.type)}
                                            {getTypeLabel(item.type)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono">
                                            {item.schemaType || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getScoreColor(item.score)}`}></div>
                                            <span className="font-medium text-gray-900">{item.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.issues.length > 0 ? (
                                            <div className="flex items-center gap-1 text-sm text-orange-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                {item.issues.length} sorun
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm text-green-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Tamamlandı
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/seo-killer/${item.type === "product" ? "urunler" : item.type === "category" ? "kategoriler" : "sayfalar"}/${item.slug || item.id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            Düzenle
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
