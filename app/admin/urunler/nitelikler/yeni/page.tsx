"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Check,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ValueInput {
  id: string;
  value: string;
  colorCode: string;
}

export default function NewVariantAttributePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [values, setValues] = useState<ValueInput[]>([
    { id: "1", value: "", colorCode: "" },
  ]);
  const [hasColorCodes, setHasColorCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addValue = () => {
    setValues((prev) => [
      ...prev,
      { id: Date.now().toString(), value: "", colorCode: "" },
    ]);
  };

  const removeValue = (id: string) => {
    if (values.length <= 1) {
      toast.error("En az bir değer olmalıdır");
      return;
    }
    setValues((prev) => prev.filter((v) => v.id !== id));
  };

  const updateValue = (id: string, field: keyof ValueInput, value: string) => {
    setValues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nitelik adı gereklidir";
    }

    const validValues = values.filter((v) => v.value.trim());
    if (validValues.length === 0) {
      newErrors.values = "En az bir değer girilmelidir";
    }

    // Aynı değer kontrolü
    const valueSet = new Set<string>();
    let hasDuplicate = false;
    for (const v of values) {
      if (v.value.trim()) {
        if (valueSet.has(v.value.trim().toLowerCase())) {
          hasDuplicate = true;
          break;
        }
        valueSet.add(v.value.trim().toLowerCase());
      }
    }
    if (hasDuplicate) {
      newErrors.values = "Aynı değer birden fazla kez eklenemez";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const validValues = values
        .filter((v) => v.value.trim())
        .map((v) => v.value.trim());

      const colorCodes: Record<string, string> = {};
      if (hasColorCodes) {
        values.forEach((v) => {
          if (v.value.trim() && v.colorCode) {
            colorCodes[v.value.trim()] = v.colorCode;
          }
        });
      }

      const response = await fetch("/api/admin/variant-attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          values: validValues,
          colorCodes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Nitelik başarıyla oluşturuldu");
        router.push("/admin/urunler/nitelikler");
      } else {
        toast.error(data.error || "Nitelik oluşturulamadı");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/urunler/nitelikler"
          className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Nitelik</h1>
          <p className="text-sm text-gray-500">
            Ürün varyantları için yeni bir nitelik grubu oluşturun
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nitelik Adı */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Nitelik Bilgileri</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nitelik Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Renk, Beden, Gramaj"
              className={cn(
                "w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all",
                errors.name ? "border-red-300" : "border-gray-200"
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Renk Kodu Seçeneği */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">Renk kodu kullan?</span>
            </div>
            <button
              type="button"
              onClick={() => setHasColorCodes(!hasColorCodes)}
              className={cn(
                "ml-auto relative w-12 h-6 rounded-full transition-colors",
                hasColorCodes ? "bg-primary" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                  hasColorCodes ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>
          {hasColorCodes && (
            <p className="text-xs text-gray-500">
              Her değer için renk seçici görüntülenecektir.
            </p>
          )}
        </div>

        {/* Değerler */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Değerler</h2>
            <span className="text-sm text-gray-500">
              {values.filter((v) => v.value.trim()).length} değer
            </span>
          </div>

          {errors.values && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errors.values}
            </div>
          )}

          <div className="space-y-3">
            {values.map((value, index) => (
              <div
                key={value.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-sm text-gray-400 w-6">{index + 1}</span>

                {hasColorCodes && (
                  <div className="relative">
                    <input
                      type="color"
                      value={value.colorCode || "#000000"}
                      onChange={(e) =>
                        updateValue(value.id, "colorCode", e.target.value)
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                  </div>
                )}

                <input
                  type="text"
                  value={value.value}
                  onChange={(e) =>
                    updateValue(value.id, "value", e.target.value)
                  }
                  placeholder={`Değer ${index + 1}`}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />

                <button
                  type="button"
                  onClick={() => removeValue(value.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addValue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Değer Ekle
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/urunler/nitelikler"
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
