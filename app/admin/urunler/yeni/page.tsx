"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Upload, 
  X, 
  Save, 
  Loader2,
  Tag,
  Scale,
  Check,
  AlertCircle,
  ChevronDown,
  Loader2 as LoadingIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCategories } from "@/lib/categories";

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  productCount: number;
}

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
  category: "",
  price: "",
  weight: "450",
  stock: "100",
  images: [],
};

export default function SimpleProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_DATA);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, category: cats[0].slug }));
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

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
      newErrors.name = "Ürün adı zorunludur";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Geçerli bir fiyat girin";
    }
    if (!formData.category) {
      newErrors.category = "Bir kategori seçin";
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
      const selectedCategory = categories.find(c => c.slug === formData.category);
      
      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        short_description: formData.description?.slice(0, 100) || "",
        category: formData.category,
        category_name: selectedCategory?.name || "",
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

  const selectedCategory = categories.find(c => c.slug === formData.category);

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ürün Görseli */}
        <div className="text-center">
          <label className="block">
            <div className={cn(
              "relative w-full h-56 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
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
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload className="w-10 h-10 mb-2" />
                  <p className="text-sm font-medium">Fotoğraf ekle</p>
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

        {/* Kategori - Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kategori
          </label>
          <div className="relative">
            {loadingCategories ? (
              <div className="w-full h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                <LoadingIcon className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Kategoriler yükleniyor...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="w-full h-12 border-2 border-red-300 bg-red-50 rounded-xl flex items-center justify-center text-red-500 text-sm">
                Önce kategori ekleyin
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={cn(
                  "w-full h-12 px-4 rounded-xl border-2 flex items-center justify-between transition-all",
                  errors.category 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-200 bg-white hover:border-primary"
                )}
              >
                <span className={formData.category ? "text-gray-900" : "text-gray-400"}>
                  {selectedCategory?.name || "Kategori seçin"}
                </span>
                <ChevronDown className={cn(
                  "w-5 h-5 text-gray-400 transition-transform",
                  categoryDropdownOpen && "rotate-180"
                )} />
              </button>
            )}
            
            {categoryDropdownOpen && categories.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: cat.slug }));
                      setCategoryDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left",
                      formData.category === cat.slug && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                    {formData.category === cat.slug && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
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
              "w-full h-12 px-4 rounded-xl border-2 text-base transition-all",
              errors.name 
                ? "border-red-300 bg-red-50 focus:border-red-500" 
                : "border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/10"
            )}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.name}
            </p>
          )}
        </div>

        {/* Fiyat ve Ağırlık */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fiyat (₺)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.01"
                className={cn(
                  "w-full h-12 pl-10 pr-4 rounded-xl border-2 text-base transition-all",
                  errors.price 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/10"
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
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="450"
                min="0"
                className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-gray-200 bg-white text-base focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stok */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Stok Adedi
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            min="0"
            className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-white text-base focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Açıklama (Opsiyonel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Ürün açıklaması..."
            rows={3}
            maxLength={200}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-base focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {formData.description.length}/200
          </p>
        </div>

        {/* Kaydet Butonu */}
        <button
          type="submit"
          disabled={loading || loadingCategories || categories.length === 0}
          className="w-full h-14 bg-primary text-white text-lg font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Ürünü Kaydet</span>
            </>
          )}
        </button>

        {/* Önizleme */}
        {formData.name && (
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 mb-3">Önizleme</h3>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-3xl">{selectedCategory?.icon || "📦"}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase">{selectedCategory?.name || "Kategori"}</p>
                <h4 className="font-bold text-gray-900">{formData.name || "Ürün Adı"}</h4>
                <p className="text-primary font-bold">{formData.price ? `${formData.price}₺` : "0₺"}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
