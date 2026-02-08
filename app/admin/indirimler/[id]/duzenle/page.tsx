"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getDiscountById, updateDiscount } from "@/lib/discounts";
import { Discount, DiscountFormData, DiscountType, DiscountStatus, DiscountScope, DiscountVisibility, DiscountLimitType } from "@/types/discount";
import {
  ArrowLeft,
  Save,
  Percent,
  DollarSign,
  Package,
  Gift,
  Calendar,
  Users,
  Tag,
  Lock,
  Settings,
  Plus,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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

const PREDEFINED_TAGS = ["yilbasi", "yeni-musteri", "satis", "sporcu", "kadinlar", "cocuklar", "hafta-sonu", "velil", "yilbasi"];

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<DiscountFormData>({
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
    endDate: new Date(),
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
  });

  useEffect(() => {
    if (discountId) {
      const loadedDiscount = getDiscountById(discountId);
      if (loadedDiscount) {
        setDiscount(loadedDiscount);
        setFormData(loadedDiscount);
      } else {
        router.push("/admin/indirimler");
      }
    }
  }, [discountId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discountId) return;

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

    updateDiscount(discountId, formData);

    setSaving(false);
    router.push("/admin/indirimler");
  };

  if (!discount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <RefreshCw className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/indirimler"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">İndirimi Düzenle</h1>
              <p className="text-gray-500">{discount.name} indirim kodunu düzenle</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/indirimler/${discount.id}/onizle`}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-lg"
            >
              <Eye className="w-5 h-5 text-gray-600" />
              Önizle
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl font-semibold hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kullanım İstatistikleri</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-primary mb-2">{discount.usedCount}</div>
                <div className="text-sm text-gray-600 font-semibold">Toplam Kullanım</div>
              </div>
              {discount.limitType !== "unlimited" && discount.usageLimit && (
                <>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {discount.usageLimit - discount.usedCount}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Kalan Kullanım</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round((discount.usedCount / discount.usageLimit) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Kullanım Oranı</div>
                  </div>
                </>
              )}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {format(new Date(discount.createdAt), "dd MMM yyyy", { locale: tr })}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Oluşturulma Tarihi</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Temel Bilgiler</h2>
                  </div>
                </div>
                <div className="p-8 space-y-6">
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
                        className={`w-full px-5 py-4 text-lg border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                          errors.name ? 'border-red-300' : 'border-gray-200 focus:border-primary'
                        }`}
                        required
                      />
                      {errors.name && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        İndirim Kodu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="ÖRN: YILBASI2026"
                        className={`w-full px-5 py-4 text-lg border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono ${
                          errors.code ? 'border-red-300' : 'border-gray-200 focus:border-primary'
                        }`}
                        required
                      />
                      {errors.code && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.code}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="İndirim kodu açıklaması..."
                      rows={3}
                      className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
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
                            className={`flex-1 px-4 py-3 border-2 rounded-2xl text-sm font-medium transition-all ${
                              formData.status === status.value
                                ? `${status.color} border-current`
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
                            className={`flex-1 px-4 py-3 border-2 rounded-2xl text-sm font-medium transition-all ${
                              formData.visibility === visibility.value
                                ? 'bg-primary text-white border-primary'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                      <Percent className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">İndirim Detayları</h2>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
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
                            className={`p-4 border-2 rounded-2xl text-center transition-all ${
                              formData.type === type.value
                                ? 'bg-primary/10 border-primary'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-8 h-8 mx-auto mb-2 ${formData.type === type.value ? 'text-primary' : 'text-gray-400'}`} />
                            <div className="text-sm font-semibold mb-1">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      İndirim Değeri <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                          placeholder="10"
                          className={`w-full px-5 py-4 text-lg border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                            errors.value ? 'border-red-300' : 'border-gray-200 focus:border-primary'
                          }`}
                          required
                        />
                      </div>
                      <div className="w-40">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none bg-white cursor-pointer"
                        >
                          <option value="percentage">Yüzde (%)</option>
                          <option value="fixed">Sabit (₺)</option>
                        </select>
                      </div>
                    </div>
                    {errors.value && (
                      <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.value}
                      </div>
                    )}
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Tarih Aralığı <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Başlangıç Tarihi</label>
                        <input
                          type="date"
                          value={format(formData.startDate, "yyyy-MM-dd")}
                          onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Bitiş Tarihi</label>
                        <input
                          type="date"
                          value={format(formData.endDate, "yyyy-MM-dd")}
                          onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                          className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>
                    {errors.date && (
                      <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.date}
                      </div>
                    )}
                  </div>

                  {/* Scope */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      Kapsam
                    </label>
                    <div className="flex gap-2">
                      {DISCOUNT_SCOPES.map((scope) => (
                        <button
                          key={scope.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, scope: scope.value as DiscountScope })}
                          className={`flex-1 px-4 py-3 border-2 rounded-2xl text-sm font-medium transition-all ${
                            formData.scope === scope.value
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Kurallar</h2>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Minimum Sipariş Tutarı
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                        <input
                          type="number"
                          value={formData.rules.minimumOrderAmount}
                          onChange={(e) => setFormData({
                            ...formData,
                            rules: { ...formData.rules, minimumOrderAmount: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="0"
                          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Maksimum İndirim Tutarı
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                        <input
                          type="number"
                          value={formData.rules.maximumDiscountAmount}
                          onChange={(e) => setFormData({
                            ...formData,
                            rules: { ...formData.rules, maximumDiscountAmount: parseFloat(e.target.value) || 0 }
                          })}
                          placeholder="0"
                          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Kullanım Tipi
                    </label>
                    <div className="flex gap-2">
                      {DISCOUNT_LIMIT_TYPES.map((limitType) => (
                        <button
                          key={limitType.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, limitType: limitType.value as DiscountLimitType })}
                          className={`flex-1 px-4 py-3 border-2 rounded-2xl text-sm font-medium transition-all ${
                            formData.limitType === limitType.value
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {limitType.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.limitType !== "unlimited" && (
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Kullanım Limiti <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                        placeholder="100"
                        className={`w-full px-5 py-4 text-lg border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                          errors.usageLimit ? 'border-red-300' : 'border-gray-200 focus:border-primary'
                        }`}
                        required
                      />
                      {errors.usageLimit && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.usageLimit}
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
                      className="w-5 h-5 rounded border-2 border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    />
                    <label htmlFor="requireCoupon" className="text-sm text-gray-700 font-medium">
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
                      className="w-5 h-5 rounded border-2 border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    />
                    <label htmlFor="excludeSaleItems" className="text-sm text-gray-700 font-medium">
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
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Parola Koruması</h2>
                    </div>
                  </div>
                  <div className="p-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Parola <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Parola girin..."
                        className={`w-full px-5 py-4 text-lg border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                          errors.password ? 'border-red-300' : 'border-gray-200 focus:border-primary'
                        }`}
                        required
                      />
                      {errors.password && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Etiketler</h2>
                  </div>
                </div>
                <div className="p-8">
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
                        className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                          formData.tags?.includes(tag)
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Notlar</h2>
                  </div>
                </div>
                <div className="p-8">
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notlarınızı buraya yazın..."
                    rows={6}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Önizleme</h2>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-3xl font-bold mb-2">
                    {formData.type === "percentage" ? `%${formData.value}` : `₺${formData.value}`}
                  </div>
                  <div className="text-xl font-semibold mb-4">{formData.name}</div>
                  <div className="text-sm opacity-80">
                    Kod: <code className="font-mono bg-white/30 px-2 py-1 rounded-lg">{formData.code}</code>
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
