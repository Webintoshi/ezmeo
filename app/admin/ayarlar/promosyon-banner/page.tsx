
"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Loader2, Save, GripVertical, Trash2, Plus, Smartphone } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface PromoBanner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  order: number;
}

export default function PromoBannerSettingsPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "promo_banners")
        .single();

      if (data?.value?.banners) {
        setBanners(data.value.banners);
      } else {
        setBanners([]);
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
          key: "promo_banners",
          value: { banners }
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

  const handleAddBanner = () => {
    const newBanner: PromoBanner = {
      id: Date.now(),
      image: "",
      title: "Yeni Başlık",
      subtitle: "Yeni Alt Başlık",
      buttonText: "İncele",
      buttonLink: "/koleksiyon",
      order: banners.length + 1
    };
    setBanners([...banners, newBanner]);
  };

  const handleRemoveBanner = (id: number) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const handleUpdateBanner = (id: number, field: keyof PromoBanner, value: string | number) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [bannerId]: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "promo-banners");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        handleUpdateBanner(bannerId, "image", data.url);
        toast.success("Görsel yüklendi.");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Görsel yüklenirken hata oluştu.");
    } finally {
      setUploading(prev => ({ ...prev, [bannerId]: false }));
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
          <h1 className="text-2xl font-bold text-gray-900">Promosyon Banner Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Ana sayfa orta alandaki 3'lü banner alanını yönetin. (Önerilen boyut: 9:16 Dikey)</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {banners.map((banner, index) => (
          <div key={banner.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group flex flex-col h-full">
            <div className="bg-gray-50 border-b border-gray-100 p-3 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Banner {index + 1}</span>
              <button
                onClick={() => handleRemoveBanner(banner.id)}
                className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 flex flex-col">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Görsel (9:16 Dikey - Örn: 1080x1920px)</label>
                <div className="relative aspect-[9/16] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors overflow-hidden group/upload">
                  {banner.image ? (
                    <>
                      <Image src={banner.image} alt="Banner Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                          Değiştir
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, banner.id)} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                      {uploading[banner.id] ? (
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-gray-300 mb-2" />
                          <span className="text-xs text-gray-500">Yükle</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, banner.id)} />
                    </label>
                  )}
                </div>
                
                <input
                    type="text"
                    placeholder="veya URL"
                    value={banner.image}
                    onChange={(e) => handleUpdateBanner(banner.id, "image", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
                />
              </div>

              {/* Content Fields */}
              <div className="space-y-3 flex-1">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => handleUpdateBanner(banner.id, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Alt Başlık</label>
                  <input
                    type="text"
                    value={banner.subtitle}
                    onChange={(e) => handleUpdateBanner(banner.id, "subtitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Buton Metni</label>
                    <input
                        type="text"
                        value={banner.buttonText}
                        onChange={(e) => handleUpdateBanner(banner.id, "buttonText", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Link</label>
                    <input
                        type="text"
                        value={banner.buttonLink}
                        onChange={(e) => handleUpdateBanner(banner.id, "buttonLink", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length < 3 && (
            <button
            onClick={handleAddBanner}
            className="border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 font-medium min-h-[400px]"
            >
            <Plus className="w-8 h-8" />
            Yeni Banner Ekle
            </button>
        )}
      </div>
    </div>
  );
}
