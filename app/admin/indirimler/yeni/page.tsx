"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDiscount } from "@/lib/discounts";
import { DiscountFormData, DiscountType, DiscountStatus, DiscountScope, DiscountVisibility, DiscountLimitType } from "@/types/discount";
import {
  Percent,
  DollarSign,
  Package,
  Gift,
  Tag,
  Lock,
  Settings,
  Plus,
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Yüzde İndirim", description: "Siparişin yüzdesi kadar indirim", icon: Percent },
  { value: "fixed", label: "Sabit İndirim", description: "Sabit miktar indirim", icon: DollarSign },
  { value: "shipping", label: "Kargo Ücreti İndirimi", description: "Kargo ücretini kaldır", icon: Package },
  { value: "bogo", label: "Biri Al Birini Bedava", description: "Belirli ürünlerde özel", icon: Gift },
];

const DISCOUNT_STATUSES = [
  { value: "active", label: "Aktif", color: "bg-green-100 text-green-700" },
  { value: "scheduled", label: "Planlandı", color: "bg-blue-100 text-blue-700" },
  { value: "expired", label: "Süresi Doldu", color: "bg-red-100 text-red-700" },
  { value: "draft", label: "Taslak", color: "bg-gray-100 text-gray-700" },
];

const DISCOUNT_SCOPES = [
  { value: "all", label: "Tüm Siparişler", description: "Tüm siparişlerde geçerli" },
  { value: "products", label: "Seçili Ürünler", description: "Belirli ürünlerde geçerli" },
  { value: "collections", label: "Koleksiyonlar", description: "Belirli kategorilerde geçerli" },
  { value: "customers", label: "Seçili Müşteriler", description: "Belirli müşterilere özel" },
];

const DISCOUNT_VISIBILITYS = [
  { value: "public", label: "Herkese Açık", description: "Herkes kullanabilir" },
  { value: "private", label: "Özel", description: "Sadece seçili müşteriler" },
  { value: "password", label: "Parola Korumalı", description: "Parola ile kullanılabilir" },
];

const DISCOUNT_LIMIT_TYPES = [
  { value: "once", label: "Tek Kullanım", description: "Sadece bir kez kullanılabilir" },
  { value: "once_per_customer", label: "Müşteri Başı Bir Kez", description: "Her müşteri bir kez" },
  { value: "unlimited", label: "Sınırsız", description: "Sınırsız kullanım" },
];

const PREDEFINED_TAGS = ["yilbasi", "yeni-musteri", "satis", "sporcu", "kadinlar", "cocuklar", "hafta-sonu", "velil"];

export default function NewDiscountPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<DiscountFormData>(() => ({
    name: "",
    description: "",
    code: "",
    type: "percentage",
    status: "active",
    value: 10,
    minValue: 0,
    maxValue: 0,
    currency: "TRY",
    scope: "all",
    visibility: "public",
    password: "",
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
    products: [],
    collections: [],
    customers: [],
    rules: {
      minimumOrderAmount: 0,
      maximumDiscountAmount: 0,
      minimumQuantity: 0,
      requireCoupon: true,
      excludeSaleItems: false,
    },
    limitType: "unlimited",
    usageLimit: 0,
    tags: [],
    notes: "",
  }));

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "EZM";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "İsim gereklidir";
    }

    if (!formData.code.trim()) {
      newErrors.code = "İndirim kodu gereklidir";
    }

    if (formData.value <= 0) {
      newErrors.value = "İndirim değeri 0'dan büyük olmalıdır";
    }

    if (formData.type === "percentage" && formData.value > 100) {
      newErrors.value = "Yüzde indirim 100% den fazla olamaz";
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.date = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
    }

    if (formData.visibility === "password" && !formData.password?.trim()) {
      newErrors.password = "Parola gereklidir";
    }

    if (formData.limitType !== "unlimited" && !formData.usageLimit) {
      newErrors.usageLimit = "Kullanım limiti gereklidir";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSaving(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    addDiscount(formData);

    setSaving(false);
    router.push("/admin/indirimler");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/indirimler"
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Yeni İndirim Oluştur</h1>
              <p className="text-sm text-gray-500 mt-1">Müşterileriniz için özel bir indirim kampanyası oluşturun</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 text-sm"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Kaydet
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <h2 className="font-semibold">Temel Bilgiler</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        İndirim Adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Örn: Yeni Yıl İndirimi"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                        required
                      />
                      {errors.name && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <span>{errors.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        İndirim Kodu <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="ÖRN: YILBASI2026"
                          className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-mono text-sm ${errors.code ? 'border-red-300' : 'border-gray-200'
                            }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={generateCode}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                          title="Rastgele Kod Oluştur"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      {errors.code && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <span>{errors.code}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="İndirim kodu açıklaması..."
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Durum
                      </label>
                      <div className="flex gap-2">
                        {DISCOUNT_STATUSES.map((status) => (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, status: status.value as DiscountStatus })}
                            className={`flex-1 px-4 py-2 border rounded-lg text-xs font-medium transition-all ${formData.status === status.value
                              ? `${status.color} border-current shadow-sm`
                              : 'border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                              }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Görünürlük
                      </label>
                      <div className="flex gap-2">
                        {DISCOUNT_VISIBILITYS.map((visibility) => (
                          <button
                            key={visibility.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, visibility: visibility.value as DiscountVisibility })}
                            className={`flex-1 px-4 py-2 border rounded-lg text-xs font-medium transition-all ${formData.visibility === visibility.value
                              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                              : 'border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                              }`}
                          >
                            {visibility.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Percent className="w-4 h-4 text-gray-500" />
                    <h2 className="font-semibold">İndirim Detayları</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      İndirim Tipi
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {DISCOUNT_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value as DiscountType })}
                            className={`p-4 border rounded-xl text-center transition-all ${formData.type === type.value
                              ? 'bg-gray-900/5 border-gray-900 shadow-sm'
                              : 'border-gray-200 hover:border-gray-900'
                              }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${formData.type === type.value ? 'text-gray-900' : 'text-gray-400'}`} />
                            <div className="text-xs font-semibold mb-1">{type.label}</div>
                            <div className="text-[10px] text-gray-500 leading-tight">{type.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      İndirim Değeri <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                          placeholder="10"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm ${errors.value ? 'border-red-300' : 'border-gray-200'
                            }`}
                          required
                        />
                      </div>
                      <div className="w-40">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none bg-white cursor-pointer text-sm"
                        >
                          <option value="percentage">Yüzde (%)</option>
                          <option value="fixed">Sabit (₺)</option>
                        </select>
                      </div>
                    </div>
                    {errors.value && (
                      <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                        <span>{errors.value}</span>
                      </div>
                    )}
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tarih Aralığı <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Başlangıç Tarihi</label>
                        <input
                          type="date"
                          value={format(formData.startDate, "yyyy-MM-dd")}
                          onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Bitiş Tarihi</label>
                        <input
                          type="date"
                          value={format(formData.endDate, "yyyy-MM-dd")}
                          onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                    {errors.date && (
                      <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                        <span>{errors.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Scope */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Kapsam
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DISCOUNT_SCOPES.map((scope) => (
                        <button
                          key={scope.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, scope: scope.value as DiscountScope })}
                          className={`px-3 py-2 border rounded-lg text-xs font-medium transition-all ${formData.scope === scope.value
                            ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                            : 'border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                            }`}
                        >
                          {scope.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <h2 className="font-semibold">Kurallar</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Minimum Sipariş Tutarı
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₺</span>
                        <input
                          type="number"
                          value={formData.rules.minimumOrderAmount}
                          onChange={(e) => setFormData({
                            ...formData,
                            rules: { ...formData.rules, minimumOrderAmount: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Maksimum İndirim Tutarı
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₺</span>
                        <input
                          type="number"
                          value={formData.rules.maximumDiscountAmount}
                          onChange={(e) => setFormData({
                            ...formData,
                            rules: { ...formData.rules, maximumDiscountAmount: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kullanım Tipi
                    </label>
                    <div className="flex gap-2">
                      {DISCOUNT_LIMIT_TYPES.map((limitType) => (
                        <button
                          key={limitType.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, limitType: limitType.value as DiscountLimitType })}
                          className={`flex-1 px-4 py-2 border rounded-lg text-xs font-medium transition-all ${formData.limitType === limitType.value
                            ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                            : 'border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                            }`}
                        >
                          {limitType.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.limitType !== "unlimited" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kullanım Limiti <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                        placeholder="100"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm ${errors.usageLimit ? 'border-red-300' : 'border-gray-200'
                          }`}
                        required
                      />
                      {errors.usageLimit && (
                        <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                          <span>{errors.usageLimit}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requireCoupon"
                      checked={formData.rules.requireCoupon}
                      onChange={(e) => setFormData({
                        ...formData,
                        rules: { ...formData.rules, requireCoupon: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer transition-all"
                    />
                    <label htmlFor="requireCoupon" className="text-sm text-gray-600 font-medium cursor-pointer hover:text-gray-900 transition-all">
                      Kupon kodu gerektir
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="excludeSaleItems"
                      checked={formData.rules.excludeSaleItems}
                      onChange={(e) => setFormData({
                        ...formData,
                        rules: { ...formData.rules, excludeSaleItems: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer transition-all"
                    />
                    <label htmlFor="excludeSaleItems" className="text-sm text-gray-600 font-medium cursor-pointer hover:text-gray-900 transition-all">
                      İndirimli ürünleri hariç tut
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Password Protection */}
              {formData.visibility === "password" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <h2 className="font-semibold">Parola Koruma</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Parola <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Parola girin..."
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm ${errors.password ? 'border-red-300' : 'border-gray-200'
                          }`}
                        required
                      />
                      {errors.password && (
                        <div className="mt-2 text-xs text-red-600 flex items-center gap-2">
                          <span>{errors.password}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <h2 className="font-semibold">Etiketler</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (formData.tags?.includes(tag)) {
                            setFormData({
                              ...formData,
                              tags: formData.tags.filter(t => t !== tag)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              tags: [...(formData.tags || []), tag]
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.tags?.includes(tag)
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Plus className="w-4 h-4 text-gray-500" />
                    <h2 className="font-semibold">Notlar</h2>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notlarınızı buraya yazın..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none text-sm"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-900 rounded-xl shadow-sm p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4 text-white/70">
                    <Eye className="w-4 h-4" />
                    <h2 className="text-xs font-bold uppercase tracking-wider">Önizleme</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="text-4xl font-bold">
                      {formData.type === "percentage" ? `%${formData.value}` : `₺${formData.value}`}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{formData.name || "Kampanya Adı"}</div>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                        <code className="font-mono text-sm">{formData.code || "KOD_BURAYA"}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
