"use client";

import { useState } from "react";
import { Package, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductWizardState, ProductCategory, ProductSubcategory } from "@/types/product";

const CATEGORIES: { value: ProductCategory; label: string; subcategories: { value: ProductSubcategory; label: string }[] }[] = [
  {
    value: "fistik-ezmesi",
    label: "Fıstık Ezmesi",
    subcategories: [
      { value: "sekersiz", label: "Şekersiz" },
      { value: "hurmalı", label: "Hurmalı" },
      { value: "balli", label: "Ballı" },
      { value: "klasik", label: "Klasik" },
    ],
  },
  {
    value: "findik-ezmesi",
    label: "Fındık Ezmesi",
    subcategories: [
      { value: "sutlu-findik-kremasi", label: "Sütlü Fındık Kreması" },
      { value: "kakaolu", label: "Kakaolu" },
    ],
  },
  {
    value: "kuruyemis",
    label: "Kuruyemiş",
    subcategories: [
      { value: "cig", label: "Çiğ" },
      { value: "kavrulmus", label: "Kavrulmuş" },
    ],
  },
];

const PREDEFINED_TAGS = [
  "doğal", "vegan", "glutensiz", "sekersiz", "organik", "sporcu", "enerji",
  "kalp dostu", "bağışıklık", "kahvaltı", "atıştırmalık", "kavrulmuş",
  "çiğ", "balli", "hurmalı", "kakaolu", "sütlü", "keto",
  "yüksek protein", "antioksidan", "omega-3", "E vitamini"
];

interface StepBasicInfoProps {
  data: ProductWizardState;
  onChange: (updates: Partial<ProductWizardState>) => void;
  errors: Record<string, string>;
}

export function StepBasicInfo({ data, onChange, errors }: StepBasicInfoProps) {
  const [tagInput, setTagInput] = useState("");

  const categoryOptions = CATEGORIES.find(c => c.value === data.category)?.subcategories || [];

  const generateSlug = (name: string) => {
    const turkishToEnglish: Record<string, string> = {
      'ş': 's', 'Ş': 's',
      'ı': 'i', 'İ': 'i',
      'ğ': 'g', 'Ğ': 'g',
      'ü': 'u', 'Ü': 'u',
      'ö': 'o', 'Ö': 'o',
      'ç': 'c', 'Ç': 'c',
    };
    
    return name
      .split('')
      .map(char => turkishToEnglish[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    const updates: Partial<ProductWizardState> = { name: value };
    
    // Auto-generate slug if not manually edited
    if (!data.slug || data.slug === generateSlug(data.name)) {
      updates.slug = generateSlug(value);
    }
    
    onChange(updates);
  };

  const toggleTag = (tag: string) => {
    const newTags = data.tags.includes(tag)
      ? data.tags.filter(t => t !== tag)
      : [...data.tags, tag];
    onChange({ tags: newTags });
  };

  const addCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !data.tags.includes(tag)) {
        onChange({ tags: [...data.tags, tag] });
      }
      setTagInput("");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Package className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Temel Bilgiler</h3>
          <p className="text-xs md:text-sm text-gray-500">Ürünün temel tanımlayıcı bilgileri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Product Info */}
        <div className="space-y-5">
          {/* Product Name */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Ürün Adı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Örn: Şekersiz Fıstık Ezmesi 450g"
              className={cn(
                "w-full px-3 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm",
                errors.name ? "border-rose-300 bg-rose-50/30" : "border-gray-200"
              )}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* URL Slug */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs md:text-sm">
                /urunler/
              </span>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => onChange({ slug: e.target.value })}
                placeholder="sekersiz-fistik-ezmesi-450g"
                className={cn(
                  "w-full pl-16 pr-3 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs md:text-sm font-mono",
                  errors.slug ? "border-rose-300 bg-rose-50/30" : "border-gray-200"
                )}
              />
            </div>
            {errors.slug && (
              <p className="text-xs text-rose-500 font-medium">{errors.slug}</p>
            )}
          </div>

          {/* Short Description */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Kısa Açıklama <span className="text-rose-500">*</span>
              </label>
              <span className={cn(
                "text-xs font-medium",
                data.shortDescription.length > 150 ? "text-amber-500" : "text-gray-400"
              )}>
                {data.shortDescription.length}/160
              </span>
            </div>
            <textarea
              value={data.shortDescription}
              onChange={(e) => {
                if (e.target.value.length <= 160) {
                  onChange({ shortDescription: e.target.value });
                }
              }}
              placeholder="Arama sonuçlarında görünecek kısa özet..."
              rows={2}
              className={cn(
                "w-full px-3 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm",
                errors.shortDescription ? "border-rose-300 bg-rose-50/30" : "border-gray-200"
              )}
            />
            {errors.shortDescription && (
              <p className="text-xs text-rose-500 font-medium">{errors.shortDescription}</p>
            )}
          </div>

          {/* Full Description */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Ürün Açıklaması <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Ürün hakkında detaylı bilgi, içindekiler, kullanım önerileri..."
              rows={5}
              className={cn(
                "w-full px-3 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm",
                errors.description ? "border-rose-300 bg-rose-50/30" : "border-gray-200"
              )}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Right Column - Category & Details */}
        <div className="space-y-5">
          {/* Category & Subcategory */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={data.category}
                    onChange={(e) => onChange({ 
                      category: e.target.value as ProductCategory,
                      subcategory: "" 
                    })}
                    className={cn(
                      "w-full appearance-none px-3 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer text-sm",
                      errors.category ? "border-rose-300 bg-rose-50/30" : "border-gray-200"
                    )}
                  >
                    <option value="">Seçin</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.category && (
                  <p className="text-xs text-rose-500 font-medium">{errors.category}</p>
                )}
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Alt Kategori <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={data.subcategory}
                    onChange={(e) => onChange({ subcategory: e.target.value as ProductSubcategory })}
                    disabled={!data.category}
                    className={cn(
                      "w-full appearance-none px-3 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer text-sm",
                      !data.category && "opacity-50 cursor-not-allowed",
                      errors.subcategory ? "border-rose-300 bg-rose-50/30" : "border-gray-200"
                    )}
                  >
                    <option value="">
                      {data.category ? "Seçin" : "Önce kategori"}
                    </option>
                    {categoryOptions.map(sub => (
                      <option key={sub.value} value={sub.value}>{sub.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.subcategory && (
                  <p className="text-xs text-rose-500 font-medium">{errors.subcategory}</p>
                )}
              </div>
            </div>
          </div>

          {/* Brand & Origin */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Marka</label>
                <input
                  type="text"
                  value={data.brand}
                  onChange={(e) => onChange({ brand: e.target.value })}
                  placeholder="Ezmeo"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Menşei</label>
                <input
                  type="text"
                  value={data.countryOfOrigin}
                  onChange={(e) => onChange({ countryOfOrigin: e.target.value })}
                  placeholder="Türkiye"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Etiketler
            </label>
            
            {/* Custom Tag Input */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={addCustomTag}
              placeholder="Etiket ekle ve Enter'a bas..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            />

            {/* Predefined Tags */}
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {PREDEFINED_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-medium transition-all",
                    data.tags.includes(tag)
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Selected Tags */}
            {data.tags.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Seçilen:</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="hover:text-blue-900 text-sm leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
