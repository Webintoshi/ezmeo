"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import Link from "next/link";
import {
    ShoppingCart, Star, Check, Package, Truck, Shield, Heart,
    Share2, Minus, Plus, ChevronDown, Leaf, Award, Clock,
    MessageCircle, ThumbsUp, Facebook, Twitter, Copy, RefreshCw,
    Loader2
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/product/ImageGallery";
import { Product } from "@/types/product";

// Lazy load heavy components
const ProductCard = lazy(() => import("@/components/product/ProductCard").then(mod => ({ default: mod.ProductCard })));

type TabType = "details" | "nutrition" | "reviews";

interface ProductDetailClientProps {
    slug: string;
    initialProduct: Product | null;
    initialRelatedProducts?: Product[];
    initialVariantIndex?: number;
}

export function ProductDetailClient({
    slug,
    initialProduct,
    initialRelatedProducts = [],
    initialVariantIndex = 0
}: ProductDetailClientProps) {
    const [product, setProduct] = useState<Product | null>(initialProduct);
    const [loading, setLoading] = useState(!initialProduct);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState(initialVariantIndex);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<TabType>("details");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const { addToCart } = useCart();

    // Fetch product from API if initialProduct is invalid
    useEffect(() => {
        // Check if initialProduct is valid
        const isValidProduct = initialProduct && 
            typeof initialProduct === 'object' && 
            'id' in initialProduct &&
            'name' in initialProduct;

        if (!isValidProduct) {
            console.log('Initial product invalid, fetching from API...');
            setLoading(true);
            fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
                .then(res => res.json())
                .then(data => {
                    console.log('API Response:', data);
                    if (data.success && data.product) {
                        // Transform API response to Product type
                        const apiProduct: Product = {
                            id: data.product.id,
                            name: data.product.name,
                            slug: data.product.slug,
                            description: data.product.description || "",
                            shortDescription: data.product.short_description || "",
                            category: data.product.category || "fistik-ezmesi",
                            subcategory: data.product.subcategory || "klasik",
                            images: data.product.images_v2?.map((img: any) => img.url) || 
                                    data.product.images || [],
                            tags: data.product.tags || [],
                            variants: data.product.variants?.map((v: any) => ({
                                id: v.id,
                                name: v.name,
                                weight: v.weight ? parseInt(v.weight) : 250,
                                price: Number(v.price),
                                originalPrice: v.original_price ? Number(v.original_price) : undefined,
                                stock: v.stock,
                                sku: v.sku || "",
                            })) || [],
                            vegan: data.product.vegan,
                            glutenFree: data.product.gluten_free,
                            sugarFree: data.product.sugar_free,
                            highProtein: data.product.high_protein,
                            rating: Number(data.product.rating) || 5,
                            reviewCount: data.product.review_count || 0,
                            featured: data.product.is_featured,
                            new: data.product.is_new,
                        };
                        setProduct(apiProduct);
                    } else {
                        setError("Ürün bulunamadı");
                    }
                })
                .catch(err => {
                    console.error('Fetch error:', err);
                    setError("Ürün yüklenirken hata oluştu");
                })
                .finally(() => setLoading(false));
        }
    }, [slug, initialProduct]);

    // Load wishlist state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && product) {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            setIsWishlisted(wishlist.includes(product.id));
        }
    }, [product]);

    // Update wishlist
    const toggleWishlist = () => {
        if (!product) return;
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const newWishlist = isWishlisted 
            ? wishlist.filter((id: string) => id !== product.id)
            : [...wishlist, product.id];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        setIsWishlisted(!isWishlisted);
    };

    // Lazy load related products if not provided
    useEffect(() => {
        if (initialRelatedProducts.length === 0 && product?.category) {
            setIsLoadingRelated(true);
            fetch(`/api/products?category=${product.category}&limit=4`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.products) {
                        setRelatedProducts(data.products.filter((p: Product) => p.slug !== slug));
                    }
                })
                .finally(() => setIsLoadingRelated(false));
        }
    }, [product?.category, slug, initialRelatedProducts.length]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Ürün yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        {error || "Ürün Bulunamadı"}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Aradığınız ürün mevcut değil veya kaldırılmış olabilir.
                    </p>
                    <a 
                        href="/urunler"
                        className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Tüm Ürünlere Dön
                    </a>
                </div>
            </div>
        );
    }

    // Safety check for variants
    const variants = product.variants || [];
    const variant = variants[selectedVariant] || variants[0] || null;
    
    if (!variant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Varyant Bilgisi Eksik</h1>
                    <p className="text-gray-600 mb-4">Bu ürün için fiyat/stok bilgisi bulunamadı.</p>
                    <div className="mt-4 flex gap-3 justify-center">
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Yeniden Dene
                        </button>
                        <a 
                            href="/urunler"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            Tüm Ürünlere Dön
                        </a>
                    </div>
                </div>
            </div>
        );
    }

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
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap">
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

            {/* Main Product Section */}
            <section className="py-6 lg:py-10">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
                        {/* Left: Image Gallery */}
                        <div className="w-full">
                            <ImageGallery images={product.images} productName={product.name} />

                            {/* Trust badges - Desktop */}
                            <div className="hidden lg:grid grid-cols-3 gap-3 mt-6">
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <Leaf className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">%100 Doğal</p>
                                        <p className="text-xs text-gray-500">Katkısız</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <Award className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">Premium</p>
                                        <p className="text-xs text-gray-500">Kalite</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">Taze</p>
                                        <p className="text-xs text-gray-500">Üretim</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:sticky lg:top-20 lg:self-start">
                            <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100">
                                {/* Badges */}
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

                                {/* Title */}
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                                    {product.name}
                                </h1>

                                {/* Rating */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(product.rating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "fill-gray-200 text-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {product.rating} ({product.reviewCount})
                                    </span>
                                </div>

                                {/* Short Description */}
                                <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                                    {product.shortDescription}
                                </p>

                                {/* Variants */}
                                {variants.length > 1 && (
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Boyut Seçin
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {variants.map((v, index) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setSelectedVariant(index)}
                                                    className={`relative p-3 rounded-xl border-2 transition-all ${selectedVariant === index
                                                            ? "border-primary bg-primary/5"
                                                            : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <p className={`font-semibold text-sm ${selectedVariant === index ? "text-primary" : "text-gray-900"}`}>
                                                        {v.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{v.price} ₺</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price & Quantity */}
                                <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl lg:text-3xl font-bold text-primary">
                                                {variant.price} ₺
                                            </span>
                                            {variant.originalPrice && (
                                                <span className="text-base text-gray-400 line-through">
                                                    {variant.originalPrice} ₺
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {(variant.price / (variant.weight / 100)).toFixed(2)} ₺ / 100g
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-semibold">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                                            disabled={quantity >= 10}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mb-5">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Sepete Ekle
                                    </button>
                                    <button
                                        onClick={toggleWishlist}
                                        className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all active:scale-95 ${isWishlisted
                                                ? "bg-red-50 border-red-200 text-red-500"
                                                : "border-gray-200 text-gray-400 hover:border-gray-300"
                                            }`}
                                    >
                                        <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowShareMenu(!showShareMenu)}
                                            className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-400 hover:border-gray-300 transition-all active:scale-95"
                                        >
                                            <Share2 className="h-5 w-5" />
                                        </button>
                                        {showShareMenu && (
                                            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20 min-w-[140px]">
                                                <button onClick={() => handleShare("facebook")} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg text-sm">
                                                    <Facebook className="w-4 h-4 text-blue-600" />
                                                    Facebook
                                                </button>
                                                <button onClick={() => handleShare("twitter")} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg text-sm">
                                                    <Twitter className="w-4 h-4 text-sky-500" />
                                                    Twitter
                                                </button>
                                                <button onClick={() => handleShare("copy")} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 rounded-lg text-sm">
                                                    <Copy className="w-4 h-4 text-gray-500" />
                                                    Link Kopyala
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="space-y-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                            <Truck className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800 text-sm">500₺ üzeri ücretsiz kargo</p>
                                            <p className="text-xs text-green-600">1-3 iş günü içinde</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                            <Shield className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-green-800 text-sm">14 gün içinde iade</p>
                                            <p className="text-xs text-green-600">Koşulsuz iade garantisi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Details Tabs */}
            <section className="py-10 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                        {[
                            { id: "details", label: "Ürün Detayları" },
                            { id: "nutrition", label: "Besin Değerleri" },
                            { id: "reviews", label: `Yorumlar (${reviews.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab.id
                                        ? "text-primary border-primary"
                                        : "text-gray-500 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-4xl">
                        {activeTab === "details" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm lg:text-base">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="mt-8 grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="font-bold text-gray-900 mb-4">Ürün Özellikleri</h3>
                                        <ul className="space-y-2">
                                            {product.vegan && (
                                                <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    %100 Vegan
                                                </li>
                                            )}
                                            {product.glutenFree && (
                                                <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    Glutensiz
                                                </li>
                                            )}
                                            {product.sugarFree && (
                                                <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    Şeker İçermez
                                                </li>
                                            )}
                                            {product.highProtein && (
                                                <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    Yüksek Protein
                                                </li>
                                            )}
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-5 h-5 text-green-500" />
                                                Koruyucu İçermez
                                            </li>
                                            <li className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Check className="w-5 h-5 text-green-500" />
                                                Palm Yağı İçermez
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="font-bold text-gray-900 mb-4">Saklama Koşulları</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm">
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                <span>Serin ve kuru yerde saklayın</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                <span>Direkt güneş ışığından koruyun</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                <span>Açtıktan sonra buzdolabında saklayın</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Package className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                <span>Açıldıktan sonra 3 ay içinde tüketin</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "nutrition" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-xl">
                                {product.nutritionalInfo ? (
                                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                                        <div className="bg-primary text-white px-5 py-3">
                                            <h3 className="font-bold">Besin Değerleri</h3>
                                            <p className="text-white/80 text-xs">100g başına</p>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {[
                                                { label: "Enerji", value: `${product.nutritionalInfo.calories} kcal` },
                                                { label: "Protein", value: `${product.nutritionalInfo.protein}g` },
                                                { label: "Karbonhidrat", value: `${product.nutritionalInfo.carbs}g` },
                                                { label: "Yağ", value: `${product.nutritionalInfo.fat}g` },
                                                { label: "Lif", value: `${product.nutritionalInfo.fiber}g` },
                                            ].map((item) => (
                                                <div key={item.label} className="flex justify-between px-5 py-3">
                                                    <span className="text-gray-600 text-sm">{item.label}</span>
                                                    <span className="font-semibold text-gray-900 text-sm">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        Bu ürün için besin değeri bilgisi henüz eklenmemiş.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                                        <div className="text-4xl font-bold text-primary mb-2">{product.rating}</div>
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
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="bg-gray-50 rounded-xl p-5">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
                                                        <span className="text-xs text-gray-400">{review.date}</span>
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
                                            <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                                            <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors">
                                                <ThumbsUp className="w-4 h-4" />
                                                Faydalı ({review.helpful})
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-10 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Sık Sorulan Sorular</h2>
                    <div className="max-w-2xl space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-4 text-left"
                                >
                                    <span className="font-semibold text-gray-900 text-sm">{faq.question}</span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}
                                    />
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-4 pb-4">
                                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {(relatedProducts.length > 0 || isLoadingRelated) && (
                <section className="py-10 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Benzer Ürünler</h2>
                        {isLoadingRelated ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                <Suspense fallback={
                                    <>
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
                                        ))}
                                    </>
                                }>
                                    {relatedProducts.slice(0, 4).map((product, index) => (
                                        <ProductCard key={product.id} product={product} index={index} />
                                    ))}
                                </Suspense>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
