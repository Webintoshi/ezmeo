"use client";

import { CheckCircle, Eye, Save, Globe, Calendar, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductWizardState } from "@/types/product";
import { toast } from "sonner";

interface StepPreviewProps {
  data: ProductWizardState;
  onPublish: () => void;
  onSaveDraft: () => void;
  saving: boolean;
}

export function StepPreview({ data, onPublish, onSaveDraft, saving }: StepPreviewProps) {
  const checklistItems = [
    { id: "name", label: "Ürün adı girilmiş", check: () => data.name.length > 0 },
    { id: "images", label: "En az 1 görsel yüklenmiş", check: () => data.images.length > 0 },
    { id: "price", label: "Fiyat belirlenmiş", check: () => data.variants.some((v) => v.price > 0) },
    { id: "category", label: "Kategori seçilmiş", check: () => !!data.category },
    { id: "variants", label: "Varyantlar oluşturulmuş", check: () => data.variants.length > 0 },
    { id: "seo", label: "SEO skoru yeterli", check: () => data.seo.title.length > 0 && data.seo.description.length > 0 },
  ];

  const completedCount = checklistItems.filter((item) => item.check()).length;
  const progress = (completedCount / checklistItems.length) * 100;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Önizle & Yayınla</h3>
          <p className="text-sm text-gray-500">Son kontrol ve yayınlama</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Checklist */}
        <div className="space-y-6">
          {/* Progress */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-700">Yayınlanma Durumu</span>
              <span className="text-lg font-black text-emerald-600">%{Math.round(progress)}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  progress >= 100 ? "bg-emerald-500" : progress >= 70 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedCount} / {checklistItems.length} kontrol tamamlandı
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-700">Kontrol Listesi</h4>
            {checklistItems.map((item) => {
              const isChecked = item.check();
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all",
                    isChecked
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-gray-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      isChecked ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                    )}
                  >
                    {isChecked ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">○</span>}
                  </div>
                  <span className={cn("text-sm font-medium", isChecked ? "text-emerald-700" : "text-gray-500")}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              Taslak Kaydet
            </button>
            <button
              type="button"
              onClick={() => {
                if (progress < 100) {
                  toast.error("Lütfen önce tüm zorunlu alanları doldurun");
                  return;
                }
                onPublish();
              }}
              disabled={saving}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all disabled:opacity-50",
                progress >= 100
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <Globe className="w-5 h-5" />
              {saving ? "Yayınlanıyor..." : "Yayınla"}
            </button>
          </div>
        </div>

        {/* Right Column - Product Preview */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-gray-700">Ürün Önizlemesi</h4>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Preview Image */}
            <div className="aspect-[4/3] bg-gray-100 relative">
              {data.images[0] ? (
                <img
                  src={data.images[0].url}
                  alt={data.images[0].alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Eye className="w-16 h-16" />
                </div>
              )}
              {data.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium">
                  +{data.images.length - 1} görsel
                </div>
              )}
            </div>

            {/* Preview Content */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                {data.name || "Ürün Adı"}
              </h3>

              {/* Short Description */}
              <p className="text-sm text-gray-500 line-clamp-2">
                {data.shortDescription || "Ürün açıklaması burada görünecek..."}
              </p>

              {/* Tags */}
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {data.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs">
                      +{data.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black text-primary">
                  ₺{data.variants[0]?.price || 0}
                </span>
                {data.variants[0]?.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ₺{data.variants[0].originalPrice}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 pt-2">
                {data.vegan && (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                    VEGAN
                  </span>
                )}
                {data.glutenFree && (
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">
                    GLUTENSİZ
                  </span>
                )}
                {data.sugarFree && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                    ŞEKERSİZ
                  </span>
                )}
                {data.highProtein && (
                  <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">
                    PROTEİN
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-4">
                Sepete Ekle
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Kategori</span>
              <span className="font-medium text-gray-900">
                {data.category ? data.category.replace("-", " ") : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Varyant Sayısı</span>
              <span className="font-medium text-gray-900">{data.variants.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">KDV Oranı</span>
              <span className="font-medium text-gray-900">%{data.taxRate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Stok Takibi</span>
              <span className={cn("font-medium", data.trackStock ? "text-emerald-600" : "text-gray-400")}>
                {data.trackStock ? "Aktif" : "Pasif"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
