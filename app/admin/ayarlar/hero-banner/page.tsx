"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Loader2, Save, GripVertical, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface HeroSlide {
    id: number;
    desktop: string;
    mobile: string;
    alt: string;
    link?: string;
}

interface HeroSettings {
    slides: HeroSlide[];
}

export default function HeroBannerSettingsPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});


    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "hero_banners")
                .single();

            if (data?.value) {
                setSlides((data.value as HeroSettings).slides || []);
            } else {
                // Initialize with empty or default if needed, but better empty
                setSlides([]);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Ayarlar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("settings")
                .upsert({
                    key: "hero_banners",
                    value: { slides }
                }, { onConflict: "key" });

            if (error) throw error;
            toast.success("Ayarlar başarıyla kaydedildi.");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Kaydedilirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSlide = () => {
        const newSlide: HeroSlide = {
            id: Date.now(),
            desktop: "",
            mobile: "",
            alt: "",
            link: ""
        };
        setSlides([...slides, newSlide]);
    };

    const handleRemoveSlide = (id: number) => {
        setSlides(slides.filter(s => s.id !== id));
    };

    const handleUpdateSlide = (id: number, field: keyof HeroSlide, value: string) => {
        setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: number, type: "desktop" | "mobile") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadKey = `${slideId}-${type}`;
        setUploading(prev => ({ ...prev, [uploadKey]: true }));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "hero-banners");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                handleUpdateSlide(slideId, type, data.url);
                toast.success("Görsel yüklendi.");
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Görsel yüklenirken hata oluştu.");
        } finally {
            setUploading(prev => ({ ...prev, [uploadKey]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hero Banner Yönetimi</h1>
                    <p className="text-gray-500 text-sm mt-1">Ana sayfa üst alandaki slayt görsellerini yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Kaydet
                </button>
            </div>

            <div className="space-y-6">
                {slides.map((slide, index) => (
                    <div key={slide.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-gray-700">Slayt {index + 1}</span>
                            </div>
                            <button
                                onClick={() => handleRemoveSlide(slide.id)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Desktop Image */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">Masaüstü Görseli (1920x800px)</label>
                                <div className="relative aspect-[16/9] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors overflow-hidden group/upload">
                                    {slide.desktop ? (
                                        <>
                                            <Image src={slide.desktop} alt="Desktop Preview" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                                    Değiştir
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, slide.id, "desktop")} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                            {uploading[`${slide.id}-desktop`] ? (
                                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                                    <span className="text-sm text-gray-500">Görsel Yükle</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, slide.id, "desktop")} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Image */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">Mobil Görseli (800x1200px)</label>
                                <div className="relative aspect-[2/3] md:aspect-[16/9] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors overflow-hidden group/upload max-w-[200px] md:max-w-full">
                                    {slide.mobile ? (
                                        <>
                                            <Image src={slide.mobile} alt="Mobile Preview" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                                    Değiştir
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, slide.id, "mobile")} />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                            {uploading[`${slide.id}-mobile`] ? (
                                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                            ) : (
                                                <>
                                                    <Smartphone className="w-8 h-8 text-gray-300 mb-2" />
                                                    <span className="text-sm text-gray-500">Görsel Yükle</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, slide.id, "mobile")} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Metin (SEO)</label>
                                    <input
                                        type="text"
                                        value={slide.alt}
                                        onChange={(e) => handleUpdateSlide(slide.id, "alt", e.target.value)}
                                        placeholder="Örn: Ezmeo Fıstık Ezmesi Kampanyası"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yönlendirme Linki (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={slide.link}
                                        onChange={(e) => handleUpdateSlide(slide.id, "link", e.target.value)}
                                        placeholder="Örn: /urunler/fistik-ezmesi"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddSlide}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Slayt Ekle
                </button>
            </div>
        </div>
    );
}

function Smartphone(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
        </svg>
    )
}
