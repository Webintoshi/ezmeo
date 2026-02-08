"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  X,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Package,
  Sparkles,
  Zap,
  Leaf,
  Check,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Product, ProductVariant, NutritionalInfo, ProductCategory, ProductSubcategory } from "@/types/product";
import { addProduct, updateProduct, getProductById } from "@/lib/products";

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

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    category: "" as ProductCategory | "",
    subcategory: "" as ProductSubcategory | "",
    tags: [] as string[],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    } as NutritionalInfo,
    vegan: true,
    glutenFree: true,
    sugarFree: true,
    highProtein: true,
    rating: 5,
    reviewCount: 0,
    featured: false,
    new: true,
  });

  // Use a stable ID for the initial variant to avoid hydration mismatch
  const [variants, setVariants] = useState<ProductVariant[]>(() => [
    {
      id: `variant-${Date.now()}`,
      name: "1 Adet - 450g",
      weight: 450,
      price: 0,
      stock: 50,
      sku: `EZM-${Date.now()}`,
    },
  ]);

  const [images, setImages] = useState<string[]>([]);

  const loadProductData = useCallback(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          category: product.category,
          subcategory: product.subcategory,
          tags: product.tags,
          nutritionalInfo: product.nutritionalInfo || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
          },
          vegan: product.vegan,
          glutenFree: product.glutenFree,
          sugarFree: product.sugarFree,
          highProtein: product.highProtein,
          rating: product.rating,
          reviewCount: product.reviewCount,
          featured: product.featured || false,
          new: product.new || false,
        });
        setVariants(product.variants);
        setImages(product.images);
      }
    }
  }, [productId]);

  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  const categoryOptions = CATEGORIES.find(c => c.value === formData.category)?.subcategories || [];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);

    fileArray.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages(prev => {
            if (prev.length < 6) {
              return [...prev, result];
            }
            return prev;
          });
          setUploadProgress(Math.min(((index + 1) / fileArray.length) * 100, 100));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, {
      id: `variant-${Date.now()}`,
      name: `${prev.length + 1} Adet - 450g`,
      weight: 450,
      price: 0,
      stock: 50,
      sku: `EZM-${Date.now()}`,
    }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    ));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Only generate slug if creating new product or if user hasn't manually edited slug yet (simplification)
    // For now, let's only auto-generate slug if it's not a productId present
    if (!productId) {
      setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      const tag = input.value.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      input.value = '';
      e.preventDefault(); // Prevent form submission
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug gereklidir';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama gereklidir';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçilmelidir';
    }

    if (!formData.subcategory) {
      newErrors.subcategory = 'Alt kategori seçilmelidir';
    }

    if (variants.length === 0) {
      newErrors.variants = 'En az bir varyant gerekli';
    } else {
      variants.forEach((v, i) => {
        if (!v.name.trim()) {
          newErrors[`variant_${i}_name`] = 'Varyant adı gereklidir';
        }
        if (!v.price || v.price <= 0) {
          newErrors[`variant_${i}_price`] = 'Fiyat geçersiz';
        }
        if (!v.weight || v.weight <= 0) {
          newErrors[`variant_${i}_weight`] = 'Ağırlık geçersiz';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const productData: Partial<Product> = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      shortDescription: formData.shortDescription,
      category: formData.category as ProductCategory,
      subcategory: formData.subcategory as ProductSubcategory,
      variants: variants,
      // If images changed, use them. For new products we might auto-generate paths if not provided
      images: images.length > 0 ? images : images.map((_, i) => `/images/products/${formData.slug}-${i + 1}.jpg`),
      tags: formData.tags,
      nutritionalInfo: formData.nutritionalInfo,
      vegan: formData.vegan,
      glutenFree: formData.glutenFree,
      sugarFree: formData.sugarFree,
      highProtein: formData.highProtein,
      rating: formData.rating,
      reviewCount: formData.reviewCount,
      featured: formData.featured,
      new: formData.new,
    };

    if (productId) {
      updateProduct(productId, productData);
    } else {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        ...productData as Omit<Product, "id">,
        // Explicitly handle images for new products if empty to match previous logic or keep what's uploaded
        images: images
      };
      addProduct(newProduct);
    }

    setSaving(false);
    router.push('/admin/urunler');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <form onSubmit={handleSubmit} className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <Link
              href="/admin/urunler"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ürün Listesine Dön
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {productId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </h1>
            <p className="text-gray-500 font-medium">
              Katalogunuza yeni bir ürün ekleyin veya mevcut olanı güncelleyin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/urunler"
              className="px-6 py-3 bg-white border border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              Vazgeç
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  KAYDEDİLİYOR...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  DEĞİŞİKLİKLERİ KAYDET
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-10">

            {/* Basic Information Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">Temel Bilgiler</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Gerekli Bilgileri Doldurun</p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Ürün Adı <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Örn: Şekersiz Fıstık Ezmesi"
                      className={cn(
                        "w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium shadow-sm",
                        errors.name && "border-rose-200 bg-rose-50/30"
                      )}
                      required
                    />
                    {errors.name && (
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      URL Slug <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="sekersiz-fistik-ezmesi"
                      className={cn(
                        "w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-mono shadow-sm",
                        errors.slug && "border-rose-200 bg-rose-50/30"
                      )}
                      required
                    />
                    {errors.slug && (
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.slug}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Kısa Açıklama <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Ürünün arama sonuçlarında görünecek kısa özeti..."
                    rows={2}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium resize-none shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Ürün Açıklaması <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ürün hakkında detaylı bilgi, içindekiler ve kullanım önerileri..."
                    rows={6}
                    className={cn(
                      "w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium resize-none shadow-sm",
                      errors.description && "border-rose-200 bg-rose-50/30"
                    )}
                    required
                  />
                  {errors.description && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Kategori <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProductCategory | "", subcategory: "" }))}
                        className={cn(
                          "w-full appearance-none px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold cursor-pointer shadow-sm",
                          errors.category && "border-rose-200 bg-rose-50/30"
                        )}
                        required
                      >
                        <option value="">Kategori Seçin</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    {errors.category && (
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Alt Kategori <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <select
                        value={formData.subcategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value as ProductSubcategory | "" }))}
                        disabled={!formData.category}
                        className={cn(
                          "w-full appearance-none px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-bold cursor-pointer shadow-sm",
                          !formData.category && "opacity-50 cursor-not-allowed",
                          errors.subcategory && "border-rose-200 bg-rose-50/30"
                        )}
                        required
                      >
                        <option value="">{formData.category ? "Alt Kategori Seçin" : "Önce kategori seçin"}</option>
                        {categoryOptions.map(sub => (
                          <option key={sub.value} value={sub.value}>{sub.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    {errors.subcategory && (
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.subcategory}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Etiketler
                  </label>
                  <div className="relative group">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="Yeni etiket ekle ve Enter'a bas..."
                      onKeyPress={addCustomTag}
                      className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium shadow-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                          formData.tags.includes(tag)
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {formData.tags.includes(tag) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 opacity-50" />}
                        {tag.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Image Upload Section */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-none">Ürün Görselleri</h2>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Görsel Yönetimi</p>
                    </div>
                  </div>

                  <div className="p-8">
                    <div
                      onDragOver={handleDrag}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-[24px] p-12 transition-all cursor-pointer group/upload overflow-hidden",
                        dragActive ? "border-amber-500 bg-amber-50/50" : "border-gray-100 hover:border-amber-200 hover:bg-gray-50/50"
                      )}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        multiple
                        accept="image/*"
                      />

                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-500">
                          <Upload className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-gray-900">Görselleri Sürükleyin veya Tıklayın</p>
                          <p className="text-sm text-gray-400 font-medium">PNG, JPG veya WebP (Max. 5MB)</p>
                        </div>
                      </div>

                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100">
                          <div
                            className="h-full bg-amber-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {images.map((img, idx) => (
                          <div key={idx} className="group/img relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-xl transition-all">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-rose-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Variants Section */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-none">Varyantlar</h2>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Ebat ve Fiyat Yönetimi</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 inline-block mr-1" />
                      YENİ EKLE
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="group/variant relative p-6 bg-gray-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all">
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-white text-rose-500 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover/variant:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          <div className="md:col-span-4 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Varyant Adı</label>
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => updateVariant(index, 'name', e.target.value)}
                              placeholder="Örn: 2'li Avantaj Paketi"
                              className={cn(
                                "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold shadow-sm",
                                errors[`variant_${index}_name`] && "border-rose-200 bg-rose-50/30"
                              )}
                              required
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gramaj</label>
                            <input
                              type="number"
                              value={variant.weight}
                              onChange={(e) => updateVariant(index, 'weight', parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-mono shadow-sm"
                              required
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fiyat (₺)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-bold text-indigo-600 shadow-sm"
                              required
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stok</label>
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm font-mono shadow-sm"
                              required
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Barkod/SKU</label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-[10px] font-mono shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="xl:col-span-4 space-y-10">
            {/* Status & Properties */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">Ürün Durumu</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Görünürlük Ayarları</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group/toggle"
                  onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", formData.featured ? "bg-purple-600 animate-pulse" : "bg-gray-300")} />
                    <span className="text-sm font-bold text-gray-700">Öne Çıkar</span>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.featured ? "bg-purple-600 shadow-inner" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      formData.featured ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group/toggle"
                  onClick={() => setFormData(prev => ({ ...prev, new: !prev.new }))}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", formData.new ? "bg-blue-600 animate-pulse" : "bg-gray-300")} />
                    <span className="text-sm font-bold text-gray-700">Yeni Ürün</span>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.new ? "bg-blue-600 shadow-inner" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      formData.new ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Features */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">Özellikler</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Ürün Nitelikleri</p>
                </div>
              </div>
              <div className="p-8 grid grid-cols-2 gap-4">
                {[
                  { id: 'vegan', label: 'VEGAN' },
                  { id: 'glutenFree', label: 'GLUTENSİZ' },
                  { id: 'sugarFree', label: 'ŞEKERSİZ' },
                  { id: 'highProtein', label: 'YÜKSEK PROTEİN' }
                ].map((feat) => (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, [feat.id]: !prev[feat.id as keyof typeof prev] }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2",
                      formData[feat.id as keyof typeof formData]
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm"
                        : "bg-white border-gray-100 text-gray-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    )}
                  >
                    <Check className={cn("w-4 h-4 transition-all", formData[feat.id as keyof typeof formData] ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{feat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nutritional Info */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
                <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">Besin Bilgileri</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">100g Değerleri</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { id: 'calories', label: 'KALORİ' },
                    { id: 'protein', label: 'PROTEİN (g)' },
                    { id: 'carbs', label: 'KARB (g)' },
                    { id: 'fat', label: 'YAĞ (g)' },
                    { id: 'fiber', label: 'LİF (g)' },
                    { id: 'sugar', label: 'ŞEKER (g)' }
                  ].map((item) => (
                    <div key={item.id} className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{item.label}</label>
                      <input
                        type="number"
                        value={formData.nutritionalInfo[item.id as keyof NutritionalInfo]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          nutritionalInfo: { ...prev.nutritionalInfo, [item.id]: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-50 outline-none transition-all text-sm font-bold shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ratings Summary */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
                <div className="w-10 h-10 bg-amber-400 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none">Değerlendirme</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Müşteri Geri Bildirimi</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yıldız Puanı (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5 }))}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all text-lg font-black text-amber-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yorum Sayısı</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviewCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-50 outline-none transition-all text-sm font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
