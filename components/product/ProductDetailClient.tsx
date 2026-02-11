"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ShoppingCart, Star, Check, Package, Truck, Shield, Heart,
    Share2, Minus, Plus, ChevronDown, Leaf, Award, Clock,
    MessageCircle, ThumbsUp, Facebook, Twitter, Copy, RefreshCw
} from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ImageGallery } from "@/components/product/ImageGallery";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";

type TabType = "details" | "nutrition" | "reviews";

interface ProductDetailClientProps {
    slug: string;
    initialProduct?: Product | null;
    initialRelatedProducts?: Product[];
}

export function ProductDetailClient({ slug, initialProduct, initialRelatedProducts = [] }: ProductDetailClientProps) {
    const [product, setProduct] = useState<Product | null>(initialProduct || null);
    const [loading, setLoading] = useState(!initialProduct);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);

    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<TabType>("details");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const { addToCart } = useCart();

    // Fetch product from API (Supabase) - only if no initial data or for freshness
    useEffect(() => {
        // If we have initial product, no need to show loading
        // Just fetch in background for freshness
        if (initialProduct && loading) {
            setLoading(false);
        }

        async function fetchProduct() {
            try {
                const response = await fetch(`/api/products?slug=${slug}`);
                const data = await response.json();

                if (data.success && data.product) {
                    setProduct(data.product);

                    // Fetch related products
                    const relatedResponse = await fetch(`/api/products?category=${data.product.category}`);
                    const relatedData = await relatedResponse.json();
                    if (relatedData.success && relatedData.products) {
                        setRelatedProducts(
                            relatedData.products
                                .filter((p: Product) => p.slug !== slug)
                                .slice(0, 4)
                        );
                    }
                } else {
                    // Fallback to static data if API fails
                    const staticProduct = getProductBySlug(slug);
                    if (staticProduct) {
                        setProduct(staticProduct);
                        setRelatedProducts(getRelatedProducts(staticProduct, 4));
                    } else {
                        setProduct(null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                // Fallback to static data on error
                const staticProduct = getProductBySlug(slug);
                if (staticProduct) {
                    setProduct(staticProduct);
                    setRelatedProducts(getRelatedProducts(staticProduct, 4));
                } else {
                    setProduct(null);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-gray-600 font-medium">Ürün yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    const variant = product.variants[selectedVariant];
    const discountPercent = variant.originalPrice
        ? Math.round((1 - variant.price / variant.originalPrice) * 100)
        : 0;

    const handleAddToCart = () => {
        addToCart(product, variant, quantity);
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
    };

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = `${product.name} - Ezmeo`;

        switch (platform) {
            case "facebook":
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                break;
            case "twitter":
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                break;
            case "copy":
                navigator.clipboard.writeText(url);
                break;
        }
        setShowShareMenu(false);
    };

    const faqs = [
        {
            question: "Bu ürün ne kadar süre dayanır?",
            answer: "Açılmamış ambalajda son kullanma tarihine kadar saklanabilir. Açıldıktan sonra buzdolabında 3 ay içinde tüketilmesi önerilir."
        },
        {
            question: "Ürünleriniz organik mi?",
            answer: "Ürünlerimiz %100 doğal ve katkı maddesi içermez. Koruyucu, yapay tatlandırıcı veya renklendirici kullanılmamaktadır."
        },
        {
            question: "Alerjen içeriyor mu?",
            answer: "Bu ürün fıstık/fındık içermektedir. Alerji durumunda tüketmeden önce doktorunuza danışmanızı öneririz."
        }
    ];

    const reviews = [
        { id: 1, name: "Ayşe K.", rating: 5, date: "2 gün önce", comment: "Harika bir ürün! Çocuklarım bayıldı, her sabah kahvaltıda yiyoruz.", helpful: 12 },
        { id: 2, name: "Mehmet Y.", rating: 5, date: "1 hafta önce", comment: "Doğal ve lezzetli. Piyasadaki en kaliteli fıstık ezmesi diyebilirim.", helpful: 8 },
        { id: 3, name: "Zeynep A.", rating: 4, date: "2 hafta önce", comment: "Tadı çok güzel, sadece biraz daha akışkan olabilirdi.", helpful: 5 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
                            Ana Sayfa
                        </Link>
                        <span className="text-gray-300">/</span>
                        <Link href="/urunler" className="text-gray-500 hover:text-primary transition-colors">
                            Ürünler
                        </Link>
                        <span className="text-gray-300">/</span>
                        <Link href={`/kategori/${product.category}`} className="text-gray-500 hover:text-primary transition-colors">
                            {product.category === "fistik-ezmesi" && "Fıstık Ezmesi"}
                            {product.category === "findik-ezmesi" && "Fındık Ezmesi"}
                            {product.category === "kuruyemis" && "Kuruyemiş"}
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-primary font-medium truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <section className="py-8 lg:py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ImageGallery images={product.images} productName={product.name} />

                            <div className="hidden lg:grid grid-cols-3 gap-4 mt-6">
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Leaf className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">%100 Doğal</p>
                                        <p className="text-xs text-gray-500">Katkısız Üretim</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Award className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Premium Kalite</p>
                                        <p className="text-xs text-gray-500">A Sınıfı Hammadde</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">Taze Üretim</p>
                                        <p className="text-xs text-gray-500">Sipariş Üzeri</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="lg:sticky lg:top-24 lg:self-start"
                        >
                            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {product.new && (
                                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                            YENİ
                                        </span>
                                    )}
                                    {discountPercent > 0 && (
                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                                            %{discountPercent} İNDİRİM
                                        </span>
                                    )}
                                    {product.sugarFree && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            Şekersiz
                                        </span>
                                    )}
                                    {product.vegan && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            Vegan
                                        </span>
                                    )}
                                    {product.glutenFree && (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                            Glutensiz
                                        </span>
                                    )}
                                    {product.highProtein && (
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                            Yüksek Protein
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < Math.floor(product.rating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {product.rating} ({product.reviewCount} değerlendirme)
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {product.shortDescription}
                                </p>

                                {product.variants.length > 1 && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            Boyut Seçin
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {product.variants.map((v, index) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setSelectedVariant(index)}
                                                    className={`relative p-3 rounded-xl border-2 transition-all ${selectedVariant === index
                                                            ? "border-primary bg-primary/5"
                                                            : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <p className={`font-semibold ${selectedVariant === index ? "text-primary" : "text-gray-900"}`}>
                                                        {v.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{v.price} ₺</p>
                                                    {v.originalPrice && (
                                                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                                                            %{Math.round((1 - v.price / v.originalPrice) * 100)}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-primary">
                                                {variant.price} ₺
                                            </span>
                                            {variant.originalPrice && (
                                                <span className="text-lg text-gray-400 line-through">
                                                    {variant.originalPrice} ₺
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {(variant.price / (variant.weight / 100)).toFixed(2)} ₺ / 100g
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-semibold">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                                            disabled={quantity >= 10}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Sepete Ekle
                                    </button>
                                    <button
                                        onClick={() => setIsWishlisted(!isWishlisted)}
                                        className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all ${isWishlisted
                                                ? "bg-red-50 border-red-200 text-red-500"
                                                : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                                            }`}
                                    >
                                        <Heart className={`h-6 w-6 ${isWishlisted ? "fill-current" : ""}`} />
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowShareMenu(!showShareMenu)}
                                            className="w-14 h-14 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all"
                                        >
                                            <Share2 className="h-6 w-6" />
                                        </button>
                                        <AnimatePresence>
                                            {showShareMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-10"
                                                >
                                                    <button onClick={() => handleShare("facebook")} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 rounded-lg">
                                                        <Facebook className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm">Facebook</span>
                                                    </button>
                                                    <button onClick={() => handleShare("twitter")} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 rounded-lg">
                                                        <Twitter className="w-4 h-4 text-sky-500" />
                                                        <span className="text-sm">Twitter</span>
                                                    </button>
                                                    <button onClick={() => handleShare("copy")} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 rounded-lg">
                                                        <Copy className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm">Link Kopyala</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <Truck className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800">500₺ üzeri ücretsiz kargo</p>
                                            <p className="text-sm text-green-600">1-3 iş günü içinde kargoda</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800">Memnuniyet garantisi</p>
                                            <p className="text-sm text-green-600">14 gün içinde koşulsuz iade</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                        {[
                            { id: "details", label: "Ürün Detayları" },
                            { id: "nutrition", label: "Besin Değerleri" },
                            { id: "reviews", label: `Yorumlar (${reviews.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab.id
                                        ? "text-primary border-primary"
                                        : "text-gray-500 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "details" && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl"
                            >
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="mt-8 grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Ürün Özellikleri</h3>
                                        <ul className="space-y-3">
                                            {product.vegan && (
                                                <li className="flex items-center gap-2 text-gray-600">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    %100 Vegan
                                                </li>
                                            )}
                                            {product.glutenFree && (
                                                <li className="flex items-center gap-2 text-gray-600">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    Glutensiz
                                                </li>
                                            )}
                                            {product.sugarFree && (
                                                <li className="flex items-center gap-2 text-gray-600">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    Şeker İçermez
                                                </li>
                                            )}
                                            {product.highProtein && (
                                                <li className="flex items-center gap-2 text-gray-600">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    Yüksek Protein
                                                </li>
                                            )}
                                            <li className="flex items-center gap-2 text-gray-600">
                                                <Check className="w-5 h-5 text-green-500" />
                                                Koruyucu İçermez
                                            </li>
                                            <li className="flex items-center gap-2 text-gray-600">
                                                <Check className="w-5 h-5 text-green-500" />
                                                Palm Yağı İçermez
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Saklama Koşulları</h3>
                                        <ul className="space-y-3 text-gray-600">
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5" />
                                                <span>Serin ve kuru yerde saklayın</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5" />
                                                <span>Direkt güneş ışığından koruyun</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5" />
                                                <span>Açtıktan sonra buzdolabında saklayın</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5" />
                                                <span>Açıldıktan sonra 3 ay içinde tüketin</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "nutrition" && (
                            <motion.div
                                key="nutrition"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-2xl"
                            >
                                {product.nutritionalInfo ? (
                                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                                        <div className="bg-primary text-white px-6 py-4">
                                            <h3 className="font-bold text-lg">Besin Değerleri</h3>
                                            <p className="text-white/80 text-sm">100g başına</p>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            <div className="flex justify-between px-6 py-4">
                                                <span className="text-gray-600">Enerji</span>
                                                <span className="font-semibold text-gray-900">{product.nutritionalInfo.calories} kcal</span>
                                            </div>
                                            <div className="flex justify-between px-6 py-4">
                                                <span className="text-gray-600">Protein</span>
                                                <span className="font-semibold text-gray-900">{product.nutritionalInfo.protein}g</span>
                                            </div>
                                            <div className="flex justify-between px-6 py-4">
                                                <span className="text-gray-600">Karbonhidrat</span>
                                                <span className="font-semibold text-gray-900">{product.nutritionalInfo.carbs}g</span>
                                            </div>
                                            {product.nutritionalInfo.sugar !== undefined && (
                                                <div className="flex justify-between px-6 py-4 bg-gray-100">
                                                    <span className="text-gray-600 pl-4">- Şeker</span>
                                                    <span className="font-semibold text-gray-900">{product.nutritionalInfo.sugar}g</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between px-6 py-4">
                                                <span className="text-gray-600">Yağ</span>
                                                <span className="font-semibold text-gray-900">{product.nutritionalInfo.fat}g</span>
                                            </div>
                                            <div className="flex justify-between px-6 py-4">
                                                <span className="text-gray-600">Lif</span>
                                                <span className="font-semibold text-gray-900">{product.nutritionalInfo.fiber}g</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        Bu ürün için besin değeri bilgisi henüz eklenmemiş.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "reviews" && (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl"
                            >
                                <div className="grid md:grid-cols-3 gap-8 mb-8">
                                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                                        <div className="text-5xl font-bold text-primary mb-2">{product.rating}</div>
                                        <div className="flex justify-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "fill-gray-200 text-gray-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500">{product.reviewCount} değerlendirme</p>
                                    </div>
                                    <div className="md:col-span-2 bg-gray-50 rounded-xl p-6">
                                        <div className="space-y-2">
                                            {[5, 4, 3, 2, 1].map((star) => (
                                                <div key={star} className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600 w-12">{star} yıldız</span>
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-yellow-400 rounded-full"
                                                            style={{ width: star === 5 ? "70%" : star === 4 ? "20%" : "10%" }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-500 w-10">
                                                        {star === 5 ? "70%" : star === 4 ? "20%" : "10%"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900">{review.name}</span>
                                                        <span className="text-sm text-gray-400">{review.date}</span>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "fill-gray-200 text-gray-200"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 mb-4">{review.comment}</p>
                                            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                                                <ThumbsUp className="w-4 h-4" />
                                                Faydalı ({review.helpful})
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-6 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors">
                                    Tüm Yorumları Gör
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Sık Sorulan Sorular</h2>
                    <div className="max-w-3xl space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === index ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {expandedFaq === index && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-5 pb-5 text-gray-600">{faq.answer}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {relatedProducts.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Benzer Ürünler</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {relatedProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-2xl font-bold text-primary">{variant.price} ₺</p>
                        {variant.originalPrice && (
                            <p className="text-sm text-gray-400 line-through">{variant.originalPrice} ₺</p>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        Sepete Ekle
                    </button>
                </div>
            </div>
            <div className="lg:hidden h-24" />
        </div>
    );
}
