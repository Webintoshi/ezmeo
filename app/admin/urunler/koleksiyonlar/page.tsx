"use client";

import { useState } from "react";
import { getCategories, deleteCategory } from "@/lib/categories";
import { CategoryInfo } from "@/types/product";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>(getCategories());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      deleteCategory(id);
      setCategories(getCategories());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Koleksiyonlar</h1>
        <Link
          href="/admin/urunler/koleksiyonlar/yeni"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Koleksiyon
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Koleksiyon ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCategories.map((category) => (
            <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl">${category.icon}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {category.icon}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {category.productCount} ürün
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-mono">
                        /{category.slug}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/kategori/${category.slug}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sayfada Görüntüle"
                  >
                    <Package className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/urunler/koleksiyonlar/${category.id}/duzenle`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            {searchQuery ? (
              <p>Arama kriterlerinize uygun koleksiyon bulunamadı.</p>
            ) : (
              <p>
                Henüz koleksiyon eklenmemiş. İlk koleksiyonu oluşturmak için{" "}
                <Link
                  href="/admin/urunler/koleksiyonlar/yeni"
                  className="text-primary hover:underline"
                >
                  buraya tıklayın
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
