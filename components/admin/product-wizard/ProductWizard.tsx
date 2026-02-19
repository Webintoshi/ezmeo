"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, ChevronRight, ChevronLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProductWizardState, WIZARD_STEPS, WizardStep, ProductStatus, ProductImage } from "@/types/product";

// Adım Component'leri
import { StepBasicInfo } from "./steps/StepBasicInfo";
import { StepImages } from "./steps/StepImages";
import { StepPricing } from "./steps/StepPricing";
import { StepStock } from "./steps/StepStock";
import { StepSEO } from "./steps/StepSEO";
import { StepNutrition } from "./steps/StepNutrition";
import { StepPreview } from "./steps/StepPreview";

// Progress Stepper Component
import { WizardStepper } from "./WizardStepper";

interface ProductWizardProps {
  productId?: string;
}

const INITIAL_STATE: ProductWizardState = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  category: "",
  subcategory: "",
  tags: [],
  brand: "Ezmeo",
  countryOfOrigin: "Türkiye",
  images: [],
  variants: [
    {
      id: `variant-${Date.now()}`,
      name: "Standart Paket - 450g",
      weight: 450,
      price: 0,
      stock: 50,
      sku: `EZM-${Date.now()}`,
      unit: "adet",
    },
  ],
  taxRate: 10,
  discountRules: [],
  trackStock: true,
  lowStockThreshold: 10,
  seo: {
    title: "",
    description: "",
    keywords: [],
    robots: "index,follow",
  },
  nutritionalInfo: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
  },
  nutritionSettings: {
    basis: "per_100g",
    servingSize: 100,
    servingPerContainer: 1,
    allergens: [],
    vitamins: {},
  },
  vegan: true,
  glutenFree: true,
  sugarFree: false,
  highProtein: true,
  status: "draft",
};

export default function ProductWizard({ productId }: ProductWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState<ProductWizardState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ürün verisini yükle (düzenleme modu)
  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  const loadProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`);
      const data = await res.json();

      if (data.success && data.product) {
        const p = data.product;
        setFormData({
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || "",
          shortDescription: p.short_description || "",
          category: p.category || "",
          subcategory: p.subcategory || "",
          tags: p.tags || [],
          brand: p.brand || "Ezmeo",
          countryOfOrigin: p.country_of_origin || "Türkiye",
          images: (p.images_v2 || []).map((img: any) => ({
            url: img.url || img,
            alt: img.alt || "",
            isPrimary: img.is_primary || false,
            sortOrder: img.sort_order || 0,
          })),
          variants: (p.variants || []).map((v: any) => ({
            id: v.id,
            name: v.name,
            weight: parseInt(v.weight) || 0,
            price: Number(v.price),
            originalPrice: v.original_price ? Number(v.original_price) : undefined,
            cost: v.cost ? Number(v.cost) : undefined,
            stock: v.stock,
            sku: v.sku || "",
            barcode: v.barcode,
            groupName: v.group_name,
            unit: v.unit || "adet",
            images: v.images || [],
            maxPurchaseQuantity: v.max_purchase_quantity,
            warehouseLocation: v.warehouse_location,
          })),
          taxRate: p.tax_rate || 10,
          discountRules: p.discount_rules || [],
          trackStock: p.track_stock !== false,
          lowStockThreshold: p.low_stock_threshold || 10,
          seo: {
            title: p.seo_title || "",
            description: p.seo_description || "",
            keywords: p.seo_keywords || [],
            focusKeyword: p.seo_focus_keyword,
            ogImage: p.og_image,
            canonicalUrl: p.canonical_url,
            robots: p.seo_robots || "index,follow",
          },
          nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
          },
          nutritionSettings: {
            basis: p.nutrition_basis || "per_100g",
            servingSize: p.serving_size || 100,
            servingPerContainer: p.serving_per_container || 1,
            allergens: p.allergens || [],
            vitamins: p.vitamins || {},
            ingredients: p.ingredients,
            storageConditions: p.storage_conditions,
            shelfLifeDays: p.shelf_life_days,
          },
          vegan: p.vegan || false,
          glutenFree: p.gluten_free || false,
          sugarFree: p.sugar_free || false,
          highProtein: p.high_protein || false,
          status: p.status || "draft",
          publishedAt: p.published_at,
        });
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Ürün yüklenirken hata oluştu");
    }
  };

  // Form değişikliklerini takip et
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<ProductWizardState>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Ürün adı gereklidir";
        if (!formData.slug.trim()) newErrors.slug = "URL slug gereklidir";
        if (!formData.description.trim()) newErrors.description = "Açıklama gereklidir";
        if (!formData.shortDescription.trim()) newErrors.shortDescription = "Kısa açıklama gereklidir";
        if (!formData.category) newErrors.category = "Kategori seçilmelidir";
        break;
      case 2:
        if (formData.images.length === 0) newErrors.images = "En az 1 görsel yüklenmelidir";
        break;
      case 3:
        // Varyantlar artık opsiyonel - kontrolü kaldırıldı
        // if (formData.variants.length === 0) {
        //   newErrors.variants = "En az bir varyant gerekli";
        // } else {
        //   formData.variants.forEach((v, i) => {
        //     if (!v.name.trim()) newErrors[`variant_${i}_name`] = "Varyant adı gerekli";
        //     if (!v.price || v.price <= 0) newErrors[`variant_${i}_price`] = "Geçerli fiyat girin";
        //   });
        // }
        break;
      case 5:
        if (!formData.seo.title.trim()) newErrors.seoTitle = "Meta başlık gereklidir";
        if (!formData.seo.description.trim()) newErrors.seoDescription = "Meta açıklama gereklidir";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Lütfen zorunlu alanları doldurun");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (stepId: number) => {
    // Sadece geriye gitmeye veya tamamlanmış adımlara ilerlemeye izin ver
    if (stepId < currentStep || validateStep(currentStep)) {
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async (publish = false) => {
    if (!validateStep(currentStep)) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    // Varyant validasyonu - en az bir varyant zorunlu
    if (!formData.variants || formData.variants.length === 0) {
      toast.error("En az bir varyant eklemelisiniz");
      return;
    }

    // Her varyantın zorunlu alanlarını kontrol et
    const invalidVariant = formData.variants.find(
      v => !v.name || !v.name.trim() || !v.sku || !v.sku.trim() || v.price === undefined || v.price === null || v.stock === undefined || v.stock === null
    );

    if (invalidVariant) {
      toast.error("Tüm varyantların isim, SKU, fiyat ve stok bilgisi olmalıdır");
      return;
    }

    // Varyantların geçerliliğini kontrol et
    for (const variant of formData.variants) {
      if (variant.price < 0) {
        toast.error("Varyant fiyatı negatif olamaz");
        return;
      }
      if (variant.stock < 0) {
        toast.error("Varyant stoğu negatif olamaz");
        return;
      }
    }

    setSaving(true);

    try {
      const productData = {
        id: productId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.shortDescription,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags,
        brand: formData.brand,
        country_of_origin: formData.countryOfOrigin,
        images: formData.images.map((img) => img.url),
        images_v2: formData.images.map((img, idx) => ({
          url: img.url,
          alt: img.alt,
          is_primary: img.isPrimary,
          sort_order: idx,
        })),
        variants: formData.variants.map((v) => ({
          id: v.id,
          name: v.name,
          weight: String(v.weight),
          price: v.price,
          original_price: v.originalPrice,
          cost: v.cost,
          stock: v.stock,
          sku: v.sku,
          barcode: v.barcode,
          group_name: v.groupName,
          unit: v.unit,
          images: v.images,
          max_purchase_quantity: v.maxPurchaseQuantity,
          warehouse_location: v.warehouseLocation,
        })),
        tax_rate: formData.taxRate,
        discount_rules: formData.discountRules,
        track_stock: formData.trackStock,
        low_stock_threshold: formData.lowStockThreshold,
        seo_title: formData.seo.title,
        seo_description: formData.seo.description,
        seo_keywords: formData.seo.keywords,
        seo_focus_keyword: formData.seo.focusKeyword,
        og_image: formData.seo.ogImage,
        canonical_url: formData.seo.canonicalUrl,
        seo_robots: formData.seo.robots,
        vegan: formData.vegan,
        gluten_free: formData.glutenFree,
        sugar_free: formData.sugarFree,
        high_protein: formData.highProtein,
        nutrition_basis: formData.nutritionSettings.basis,
        serving_size: formData.nutritionSettings.servingSize,
        serving_per_container: formData.nutritionSettings.servingPerContainer,
        allergens: formData.nutritionSettings.allergens,
        vitamins: formData.nutritionSettings.vitamins,
        ingredients: formData.nutritionSettings.ingredients,
        storage_conditions: formData.nutritionSettings.storageConditions,
        shelf_life_days: formData.nutritionSettings.shelfLifeDays,
        // Makro besin değerleri
        calories: formData.nutritionalInfo.calories,
        protein: formData.nutritionalInfo.protein,
        carbs: formData.nutritionalInfo.carbs,
        fat: formData.nutritionalInfo.fat,
        fiber: formData.nutritionalInfo.fiber,
        sugar: formData.nutritionalInfo.sugar,
        status: publish ? "published" : formData.status,
        is_draft: !publish,
        published_at: publish ? new Date().toISOString() : formData.publishedAt,
      };

      const url = "/api/products";
      const method = productId ? "PUT" : "POST";

      console.log("Sending product data:", JSON.stringify(productData, null, 2));
      console.log("formData.images:", formData.images);
      console.log("productData.images:", productData.images);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const result = await response.json();
      console.log("API Response:", result);

      if (!result.success) {
        console.error("API Error:", result.error, result.code);
        throw new Error(result.error || "Ürün kaydedilemedi");
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast.success(
        publish 
          ? "Ürün başarıyla yayınlandı!" 
          : productId 
            ? "Ürün başarıyla güncellendi!" 
            : "Ürün başarıyla oluşturuldu!"
      );

      if (publish || !productId) {
        router.push("/admin/urunler");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Bir hata oluştu";
      toast.error(`Hata: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save (taslak)
  useEffect(() => {
    if (!productId || !hasUnsavedChanges) return;

    const timer = setTimeout(async () => {
      try {
        // Draft save logic here
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 60000); // 60 saniyede bir

    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges, productId]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBasicInfo
            data={formData}
            onChange={updateFormData}
            errors={errors}
          />
        );
      case 2:
        return (
          <StepImages
            images={formData.images}
            onChange={(images) => updateFormData({ images })}
            errors={errors}
          />
        );
      case 3:
        return (
          <StepPricing
            variants={formData.variants}
            taxRate={formData.taxRate}
            discountRules={formData.discountRules}
            onVariantsChange={(variants) => updateFormData({ variants })}
            onTaxRateChange={(taxRate) => updateFormData({ taxRate })}
            onDiscountRulesChange={(discountRules) => updateFormData({ discountRules })}
            errors={errors}
          />
        );
      case 4:
        return (
          <StepStock
            trackStock={formData.trackStock}
            lowStockThreshold={formData.lowStockThreshold}
            variants={formData.variants}
            onTrackStockChange={(trackStock) => updateFormData({ trackStock })}
            onLowStockThresholdChange={(lowStockThreshold) => updateFormData({ lowStockThreshold })}
            onVariantsChange={(variants) => updateFormData({ variants })}
          />
        );
      case 5:
        return (
          <StepSEO
            seo={formData.seo}
            productName={formData.name}
            productDescription={formData.shortDescription}
            onChange={(seo) => updateFormData({ seo })}
            errors={errors}
          />
        );
      case 6:
        return (
          <StepNutrition
            nutritionalInfo={formData.nutritionalInfo}
            nutritionSettings={formData.nutritionSettings}
            vegan={formData.vegan}
            glutenFree={formData.glutenFree}
            sugarFree={formData.sugarFree}
            highProtein={formData.highProtein}
            onNutritionalInfoChange={(nutritionalInfo) => updateFormData({ nutritionalInfo })}
            onNutritionSettingsChange={(nutritionSettings) => updateFormData({ nutritionSettings })}
            onFeaturesChange={(features) => updateFormData(features)}
          />
        );
      case 7:
        return (
          <StepPreview
            data={formData}
            onPublish={() => handleSave(true)}
            onSaveDraft={() => handleSave(false)}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/urunler"
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {productId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                </h1>
                {lastSaved && (
                  <p className="text-xs text-gray-500">
                    Son kayıt: {lastSaved.toLocaleTimeString("tr-TR")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 7 && (
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Taslak Kaydet"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <WizardStepper
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Step Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">
                {currentStep}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {WIZARD_STEPS[currentStep - 1].title}
                </h2>
                <p className="text-gray-500">
                  {WIZARD_STEPS[currentStep - 1].description}
                </p>
              </div>
            </div>
            {WIZARD_STEPS[currentStep - 1].isRequired && (
              <p className="text-xs text-rose-500 font-medium ml-13">
                * Bu adımdaki tüm alanlar zorunludur
              </p>
            )}
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Geri
            </button>

            {currentStep < 7 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                İleri
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Taslak Kaydet
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Yayınla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
