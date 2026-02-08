"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCategoryById, addCategory, updateCategory } from "@/lib/categories";
import { CategoryFormData } from "@/types/category";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import Link from "next/link";

interface CategoryFormProps {
  categoryId?: string;
}

export default function CategoryForm({ categoryId }: CategoryFormProps) {
  const router = useRouter();
  const existingCategory = categoryId ? getCategoryById(categoryId) : null;

  const [formData, setFormData] = useState<CategoryFormData>({
    id: existingCategory?.id || "",
    name: existingCategory?.name || "",
    slug: existingCategory?.slug || "",
    description: existingCategory?.description || "",
    image: existingCategory?.image || "",
    icon: existingCategory?.icon || "🥜",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (categoryId) {
      updateCategory(categoryId, formData);
    } else {
      addCategory(formData);
    }

    router.push("/admin/urunler/koleksiyonlar");
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/urunler/koleksiyonlar"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {categoryId ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
          </h1>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
                placeholder="fistik-ezmesi"
              />
              <p className="mt-1 text-xs text-gray-500">
                Örnek: kategori-adi
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Görsel</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Görsel URL
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {formData.image && (
              <div className="relative">
                <img
                  src={formData.image}
                  alt={formData.name}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!formData.image && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-sm text-gray-500">
                  Görsel URL girin veya yükleyin
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İkon</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emoji İkon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-2xl text-center"
                maxLength={2}
                placeholder="🥜"
              />
              <div className="mt-4 grid grid-cols-6 gap-2">
                {["🥜", "🌰", "🥑", "🍫", "🥛", "🌱", "🍯", "🌿", "🎯", "🎨", "💚", "🥗"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`p-2 text-2xl rounded-lg transition-colors ${
                      formData.icon === emoji
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              İpuçları
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Slug URL için kullanılacak, boşluk yerine tire (-) kullanın</li>
              <li>• Görsel boyutu en az 800x600 piksel olmalı</li>
              <li>• Açıklama SEO için önemlidir</li>
              <li>• İkon mobil görünümde kullanılır</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
