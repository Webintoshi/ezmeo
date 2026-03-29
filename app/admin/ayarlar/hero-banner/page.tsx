"use client";

import { useEffect, useState } from "react";
import {
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface HeroSlide {
  id: number;
  desktop: string;
  mobile: string;
  tablet?: string;
  alt: string;
  link?: string;
  transition?: "fade" | "slide" | "zoom" | "blur";
  overlay?: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    position: "left" | "center" | "right";
  };
  video?: {
    desktop: string;
    mobile: string;
    poster: string;
  };
}

interface HeroSettings {
  slides: HeroSlide[];
}

function emptySlide(): HeroSlide {
  return {
    id: Date.now(),
    desktop: "",
    mobile: "",
    alt: "",
    link: "",
    transition: "fade",
    overlay: {
      title: "",
      subtitle: "",
      ctaText: "",
      ctaLink: "",
      position: "left",
    },
  };
}

export default function HeroBannerSettingsPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);

    try {
      const response = await fetch("/api/settings?key=hero_banners", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Hero banner ayarlari yuklenemedi.");
      }

      const settingValue = payload.setting?.value as HeroSettings | null | undefined;
      setSlides(settingValue?.slides || []);
    } catch (error) {
      console.error("Error loading hero banner settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Ayarlar yuklenirken bir hata olustu.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "hero_banners",
          value: { slides },
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Hero banner ayarlari kaydedilemedi.");
      }

      toast.success("Ayarlar basariyla kaydedildi.");
    } catch (error) {
      console.error("Error saving hero banner settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Kaydedilirken bir hata olustu.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleAddSlide() {
    setSlides((current) => [...current, emptySlide()]);
  }

  function handleRemoveSlide(id: number) {
    setSlides((current) => current.filter((slide) => slide.id !== id));
  }

  function handleUpdateSlide(id: number, field: keyof HeroSlide, value: string) {
    setSlides((current) =>
      current.map((slide) => (slide.id === id ? { ...slide, [field]: value } : slide)),
    );
  }

  function handleUpdateOverlay(id: number, field: keyof NonNullable<HeroSlide["overlay"]>, value: string) {
    setSlides((current) =>
      current.map((slide) => {
        if (slide.id !== id) {
          return slide;
        }

        return {
          ...slide,
          overlay: {
            ...slide.overlay,
            [field]: value,
          } as HeroSlide["overlay"],
        };
      }),
    );
  }

  async function uploadAsset(
    file: File,
    slideId: number,
    type: "desktop" | "mobile" | "poster",
    isVideo = false,
  ) {
    const uploadKey = `${slideId}-${type}`;
    setUploading((current) => ({ ...current, [uploadKey]: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "hero-banners");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload.success || !payload.url) {
        throw new Error(payload.error || "Dosya yukleme basarisiz oldu.");
      }

      setSlides((current) =>
        current.map((slide) => {
          if (slide.id !== slideId) {
            return slide;
          }

          if (isVideo) {
            return {
              ...slide,
              video: {
                ...slide.video,
                [type]: payload.url,
              } as HeroSlide["video"],
            };
          }

          return {
            ...slide,
            [type]: payload.url,
          };
        }),
      );

      toast.success(isVideo ? "Video yuklendi." : "Gorsel yuklendi.");
    } catch (error) {
      console.error("Hero banner upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Dosya yuklenirken bir hata olustu.",
      );
    } finally {
      setUploading((current) => ({ ...current, [uploadKey]: false }));
    }
  }

  async function handleVideoUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    slideId: number,
    type: "desktop" | "mobile" | "poster",
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadAsset(file, slideId, type, true);
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    slideId: number,
    type: "desktop" | "mobile",
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadAsset(file, slideId, type, false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Banner Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ana sayfa üst alandaki slayt görsellerini yönetin.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>

      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                  <GripVertical className="h-5 w-5" />
                </div>
                <span className="font-semibold text-gray-700">Slayt {index + 1}</span>
              </div>
              <button
                onClick={() => handleRemoveSlide(slide.id)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Masaustu Gorseli (1920x800px)
                </label>
                <div className="group/upload relative aspect-[16/9] overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-blue-400">
                  {slide.desktop ? (
                    <>
                      <Image src={slide.desktop} alt="Desktop Preview" fill className="object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/upload:opacity-100">
                        <label className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100">
                          Degistir
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(event) => void handleFileUpload(event, slide.id, "desktop")}
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center">
                      {uploading[`${slide.id}-desktop`] ? (
                        <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <ImageIcon className="mb-2 h-8 w-8 text-gray-300" />
                          <span className="text-sm text-gray-500">Gorsel Yukle</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(event) => void handleFileUpload(event, slide.id, "desktop")}
                      />
                    </label>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Veya URL yapistir: https://..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const value = (event.target as HTMLInputElement).value;

                        if (value) {
                          handleUpdateSlide(slide.id, "desktop", value);
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                    onClick={(event) => {
                      const input = (event.target as HTMLElement).previousElementSibling as HTMLInputElement;

                      if (input.value) {
                        handleUpdateSlide(slide.id, "desktop", input.value);
                        input.value = "";
                      }
                    }}
                  >
                    Ekle
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Mobil Gorseli (800x1200px)
                </label>
                <div className="group/upload relative aspect-2/3 max-w-[200px] overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-blue-400 md:aspect-video md:max-w-full">
                  {slide.mobile ? (
                    <>
                      <Image src={slide.mobile} alt="Mobile Preview" fill className="object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/upload:opacity-100">
                        <label className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100">
                          Degistir
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(event) => void handleFileUpload(event, slide.id, "mobile")}
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center">
                      {uploading[`${slide.id}-mobile`] ? (
                        <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Smartphone className="mb-2 h-8 w-8 text-gray-300" />
                          <span className="text-sm text-gray-500">Gorsel Yukle</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(event) => void handleFileUpload(event, slide.id, "mobile")}
                      />
                    </label>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Veya URL yapistir: https://..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const value = (event.target as HTMLInputElement).value;

                        if (value) {
                          handleUpdateSlide(slide.id, "mobile", value);
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                    onClick={(event) => {
                      const input = (event.target as HTMLElement).previousElementSibling as HTMLInputElement;

                      if (input.value) {
                        handleUpdateSlide(slide.id, "mobile", input.value);
                        input.value = "";
                      }
                    }}
                  >
                    Ekle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Alt Metin (SEO)</label>
                  <input
                    type="text"
                    value={slide.alt}
                    onChange={(event) => handleUpdateSlide(slide.id, "alt", event.target.value)}
                    placeholder="Orn: Ezmeo Fistik Ezmesi Kampanyasi"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Yonlendirme Linki (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={slide.link}
                    onChange={(event) => handleUpdateSlide(slide.id, "link", event.target.value)}
                    placeholder="Orn: /urunler/fistik-ezmesi"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Transition Efekti</label>
                <div className="flex flex-wrap gap-2">
                  {(["fade", "slide", "zoom", "blur"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleUpdateSlide(slide.id, "transition", type)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                        slide.transition === type
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">
                  Overlay Icerik (Gorsel Uzerinde Gosterilen Metinler)
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Baslik</label>
                    <input
                      type="text"
                      value={slide.overlay?.title || ""}
                      onChange={(event) => handleUpdateOverlay(slide.id, "title", event.target.value)}
                      placeholder="Dogal Lezzetin"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Alt Baslik</label>
                    <input
                      type="text"
                      value={slide.overlay?.subtitle || ""}
                      onChange={(event) => handleUpdateOverlay(slide.id, "subtitle", event.target.value)}
                      placeholder="Tamamen organik, katkisiz"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Buton Metni</label>
                    <input
                      type="text"
                      value={slide.overlay?.ctaText || ""}
                      onChange={(event) => handleUpdateOverlay(slide.id, "ctaText", event.target.value)}
                      placeholder="Kesfet"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Buton Linki</label>
                    <input
                      type="text"
                      value={slide.overlay?.ctaLink || ""}
                      onChange={(event) => handleUpdateOverlay(slide.id, "ctaLink", event.target.value)}
                      placeholder="/urunler"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Pozisyon</label>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as const).map((position) => (
                        <button
                          key={position}
                          type="button"
                          onClick={() => handleUpdateOverlay(slide.id, "position", position)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                            slide.overlay?.position === position
                              ? "bg-blue-600 text-white"
                              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {position === "left" ? "Sol" : position === "center" ? "Orta" : "Sag"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Opsiyonel Video Alanlari</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {([
                    ["desktop", "Masaustu Video"],
                    ["mobile", "Mobil Video"],
                    ["poster", "Poster Gorseli"],
                  ] as const).map(([type, label]) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 hover:border-blue-400"
                    >
                      <span>{label}</span>
                      {uploading[`${slide.id}-${type}`] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="font-medium text-blue-600">Yukle</span>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept={type === "poster" ? "image/*" : "video/*"}
                        onChange={(event) => void handleVideoUpload(event, slide.id, type)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddSlide}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 font-medium text-gray-500 transition-all hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600"
        >
          <Plus className="h-5 w-5" />
          Yeni Slayt Ekle
        </button>
      </div>
    </div>
  );
}
