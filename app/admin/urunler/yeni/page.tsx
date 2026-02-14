"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Upload, 
  X, 
  Plus, 
  Minus, 
  Save, 
  Loader2,
  Image as ImageIcon,
  Tag,
  Scale,
  FileText,
  Check,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "fistik-ezmesi", label: "Fıstık Ezmesi", emoji: "🥜" },
  { value: "findik-ezmesi", label: "Fındık Ezmesi", emoji: "🌰" },
  { value: "kuruyemis", label: "Kuruyemiş", emoji: "🥔" },
];

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  weight: string;
  stock: string;
  images: { url: string; file?: File }[];
}

const INITIAL_DATA: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  category: "fistik-ezmesi",
  price: "",
  weight: "450",
  stock: "100",
  images: [],
};

export default function SimpleProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_DATA);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          images: [{ url: reader.result as string, file }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, images: [] }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Ürün adı zorunlu";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Geçerli fiyat girin";
    }
    if (!formData.category) {
      newErrors.category = "Kategori seçin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Lütfen hataları düzeltin");
      return;
    }

    setLoading(true);

    try {
      const variantId = `variant-${Date.now()}`;
      
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        short_description: formData.description?.slice(0, 100) || "",
        category: formData.category,
        tags: [],
        brand: "Ezmeo",
        country_of_origin: "Türkiye",
        images: formData.images.map(img => img.url),
        images_v2: formData.images.map((img, idx) => ({
          url: img.url,
          alt: formData.name,
          is_primary: idx === 0,
          sort_order: idx,
        })),
        variants: [
          {
            id: variantId,
            name: `${formData.weight}g`,
            weight: formData.weight,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0,
            sku: `EZM-${Date.now()}`,
            unit: "adet",
          }
        ],
        tax_rate: 10,
        track_stock: true,
        low_stock_threshold: 10,
        status: "published",
        is_draft: false,
        published_at: new Date().toISOString(),
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Ürün başarıyla eklendi! 🎉");
        router.push("/admin/urunler");
        router.refresh();
      } else {
        toast.error(result.error || "Ürün eklenirken hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.value === formData.category);

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ürün Görseli - Büyük ve Merkezi */}
        <div className="text-center">
          <label className="block">
            <div className={cn(
              "relative w-full h-64 rounded-3xl border-3 border-dashed transition-all cursor-pointer overflow-hidden",
              imagePreview 
                ? "border-primary bg-primary/5" 
                : "border-gray-300 hover:border-primary hover:bg-gray-50"
            )}>
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Ürün" 
                    className="w-full h-full object-contain p-4"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">Ürün Fotoğrafı Ekle</p>
                  <p className="text-sm text-gray-400 mt-1">Fotoğraf sürükle veya tıkla</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Kategori - Büyük Butonlar */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Kategori Seç
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 min-h-[100px] justify-center",
                  formData.category === cat.value
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <span className="text-4xl">{cat.emoji}</span>
                <span className={cn(
                  "font-semibold text-sm",
                  formData.category === cat.value ? "text-primary" : "text-gray-600"
                )}>
                  {cat.label}
                </span>
                {formData.category === cat.value && (
                  <Check className="w-5 h-5 text-primary absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.category}
            </p>
          )}
        </div>

        {/* Ürün Adı */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ürün Adı
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Örn: Kakaolu Fındık Ezmesi"
            className={cn(
              "w-full h-14 px-5 rounded-2xl border-2 text-lg font-medium transition-all",
              errors.name 
                ? "border-red-300 bg-red-50 focus:border-red-500" 
                : "border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
            )}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.name}
            </p>
          )}
        </div>

        {/* Fiyat ve Ağırlık - Yan Yana */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fiyat (₺)
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.01"
                className={cn(
                  "w-full h-14 pl-12 pr-4 rounded-2xl border-2 text-lg font-medium transition-all",
                  errors.price 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                )}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ağırlık (g)
            </label>
            <div className="relative">
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="450"
                min="0"
                className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-200 bg-white text-lg font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stok */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Stok Adedi
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                stock: String(Math.max(0, parseInt(prev.stock || "0") - 10)) 
              }))}
              className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-6 h-6 text-gray-600" />
            </button>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              className="w-24 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                stock: String(Math.max(0, parseInt(prev.stock || "0") + 10)) 
              }))}
              className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Açıklama - Kısa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kısa Açıklama (Opsiyonel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Ürün hakkında kısa bir açıklama..."
            rows={3}
            maxLength={200}
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white text-base focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {formData.description.length}/200
          </p>
        </div>

        {/* Kaydet Butonu - Büyük ve Yeşil */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-16 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xl font-bold rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-green-600 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              <span>Ürünü Kaydet</span>
            </>
          )}
        </button>

        {/* Preview */}
        {formData.name && (
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Önizleme</h3>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-white rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-4xl">{selectedCategory?.emoji}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase">{selectedCategory?.label}</p>
                <h4 className="font-bold text-gray-900 text-lg">{formData.name || "Ürün Adı"}</h4>
                <p className="text-primary font-bold text-xl">{formData.price ? `${formData.price}₺` : "0₺"}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
