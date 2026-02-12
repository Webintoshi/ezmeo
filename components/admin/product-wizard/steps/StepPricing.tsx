"use client";

import { useState } from "react";
import { Tag, Plus, X, Percent, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductVariant, DiscountRule, TaxRate } from "@/types/product";
import { toast } from "sonner";

interface StepPricingProps {
  variants: ProductVariant[];
  taxRate: TaxRate;
  discountRules: DiscountRule[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  onTaxRateChange: (taxRate: TaxRate) => void;
  onDiscountRulesChange: (rules: DiscountRule[]) => void;
  errors: Record<string, string>;
}

export function StepPricing({
  variants,
  taxRate,
  discountRules,
  onVariantsChange,
  onTaxRateChange,
  onDiscountRulesChange,
  errors,
}: StepPricingProps) {
  const [activeVariant, setActiveVariant] = useState<number | null>(0);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: `${variants.length + 1}. Varyant`,
      weight: 450,
      price: 0,
      stock: 50,
      sku: `EZM-${Date.now()}`,
      unit: "adet",
    };
    onVariantsChange([...variants, newVariant]);
    setActiveVariant(variants.length);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error("En az bir varyant olmalı");
      return;
    }
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
    if (activeVariant === index) {
      setActiveVariant(0);
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onVariantsChange(newVariants);
  };

  const calculateMargin = (price: number, cost: number = 0) => {
    if (!price || price <= 0) return { margin: 0, marginPercent: 0 };
    const margin = price - cost;
    const marginPercent = ((margin / price) * 100).toFixed(1);
    return { margin, marginPercent };
  };

  const calculateWithTax = (price: number, tax: number) => {
    return (price * (1 + tax / 100)).toFixed(2);
  };

  const addDiscountRule = () => {
    const newRule: DiscountRule = {
      id: `discount-${Date.now()}`,
      name: "Yeni İndirim",
      type: "percentage",
      config: { minQty: 2, discountPercent: 10 },
      isActive: true,
    };
    onDiscountRulesChange([...discountRules, newRule]);
  };

  const removeDiscountRule = (index: number) => {
    const newRules = discountRules.filter((_, i) => i !== index);
    onDiscountRulesChange(newRules);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Fiyatlandırma</h3>
          <p className="text-sm text-gray-500">Varyantlar, KDV ve indirim kuralları</p>
        </div>
      </div>

      {/* KDV Oranı */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <label className="text-sm font-bold text-gray-700 mb-3 block">KDV Oranı</label>
        <div className="flex items-center gap-2">
          {[1, 8, 10, 20].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onTaxRateChange(rate as TaxRate)}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                taxRate === rate
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              )}
            >
              %{rate}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Fiyatlara KDV {taxRate}% olarak eklenecek
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900">Varyantlar</h4>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Varyant Ekle
          </button>
        </div>

        {/* Variant Tabs */}
        {variants.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {variants.map((variant, index) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setActiveVariant(index)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  activeVariant === index
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {variant.name || `Varyant ${index + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Active Variant Form */}
        {activeVariant !== null && variants[activeVariant] && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-gray-900">
                {variants[activeVariant].name || "Varyant Detayları"}
              </h5>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(activeVariant)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Variant Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Varyant Adı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={variants[activeVariant].name}
                  onChange={(e) => updateVariant(activeVariant, "name", e.target.value)}
                  placeholder="Örn: 2'li Avantaj Paketi"
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all",
                    errors[`variant_${activeVariant}_name`] ? "border-rose-300" : "border-gray-200"
                  )}
                />
                {errors[`variant_${activeVariant}_name`] && (
                  <p className="text-xs text-rose-500">{errors[`variant_${activeVariant}_name`]}</p>
                )}
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Grup (Opsiyonel)</label>
                <input
                  type="text"
                  value={variants[activeVariant].groupName || ""}
                  onChange={(e) => updateVariant(activeVariant, "groupName", e.target.value)}
                  placeholder="Örn: Gramaj"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Gramaj</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={variants[activeVariant].weight}
                    onChange={(e) => updateVariant(activeVariant, "weight", parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                  <span className="text-gray-500 text-sm font-medium">g</span>
                </div>
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Birim</label>
                <select
                  value={variants[activeVariant].unit}
                  onChange={(e) => updateVariant(activeVariant, "unit", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="adet">Adet</option>
                  <option value="kg">Kilogram</option>
                  <option value="g">Gram</option>
                  <option value="lt">Litre</option>
                  <option value="ml">Mililitre</option>
                  <option value="paket">Paket</option>
                  <option value="kutu">Kutu</option>
                </select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Satış Fiyatı (₺) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                  <input
                    type="number"
                    step="0.01"
                    value={variants[activeVariant].price}
                    onChange={(e) => updateVariant(activeVariant, "price", parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all",
                      errors[`variant_${activeVariant}_price`] ? "border-rose-300" : "border-gray-200"
                    )}
                  />
                </div>
                {errors[`variant_${activeVariant}_price`] && (
                  <p className="text-xs text-rose-500">{errors[`variant_${activeVariant}_price`]}</p>
                )}
                {variants[activeVariant].price > 0 && (
                  <p className="text-xs text-emerald-600">
                    KDV Dahil: ₺{calculateWithTax(variants[activeVariant].price, taxRate)}
                  </p>
                )}
              </div>

              {/* Original Price */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">İndirimli Fiyat (Opsiyonel)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                  <input
                    type="number"
                    step="0.01"
                    value={variants[activeVariant].originalPrice || ""}
                    onChange={(e) => updateVariant(activeVariant, "originalPrice", parseFloat(e.target.value) || undefined)}
                    placeholder="Normal fiyat"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                {variants[activeVariant].originalPrice && variants[activeVariant].originalPrice > variants[activeVariant].price && (
                  <p className="text-xs text-emerald-600 font-medium">
                    %{Math.round(((variants[activeVariant].originalPrice - variants[activeVariant].price) / variants[activeVariant].originalPrice) * 100)} indirim
                  </p>
                )}
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Maliyet (Opsiyonel)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                  <input
                    type="number"
                    step="0.01"
                    value={variants[activeVariant].cost || ""}
                    onChange={(e) => updateVariant(activeVariant, "cost", parseFloat(e.target.value) || undefined)}
                    placeholder="Alış fiyatı"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                {variants[activeVariant].cost && variants[activeVariant].cost > 0 && (
                  <p className="text-xs text-emerald-600">
                    <Calculator className="w-3 h-3 inline mr-1" />
                    Kar: ₺{calculateMargin(variants[activeVariant].price, variants[activeVariant].cost).margin}
                    (%{calculateMargin(variants[activeVariant].price, variants[activeVariant].cost).marginPercent})
                  </p>
                )}
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">SKU/Barkod</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={variants[activeVariant].sku}
                    onChange={(e) => updateVariant(activeVariant, "sku", e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => updateVariant(activeVariant, "sku", `EZM-${Date.now().toString().slice(-6)}`)}
                    className="px-3 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors"
                  >
                    Oluştur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discount Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Percent className="w-5 h-5 text-purple-500" />
            İndirim Kuralları
          </h4>
          <button
            type="button"
            onClick={addDiscountRule}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Kural Ekle
          </button>
        </div>

        {discountRules.length === 0 && (
          <p className="text-sm text-gray-400">Henüz indirim kuralı eklenmemiş.</p>
        )}

        <div className="space-y-3">
          {discountRules.map((rule, index) => (
            <div key={rule.id} className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => {
                    const newRules = [...discountRules];
                    newRules[index].name = e.target.value;
                    onDiscountRulesChange(newRules);
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
                <div className="flex items-center gap-2 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newRules = [...discountRules];
                      newRules[index].isActive = !newRules[index].isActive;
                      onDiscountRulesChange(newRules);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                      rule.isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {rule.isActive ? "Aktif" : "Pasif"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDiscountRule(index)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <select
                  value={rule.type}
                  onChange={(e) => {
                    const newRules = [...discountRules];
                    newRules[index].type = e.target.value as DiscountRule["type"];
                    // Reset config based on type
                    if (e.target.value === "buy_x_get_y") {
                      newRules[index].config = { buy: 2, get: 1 };
                    } else if (e.target.value === "bulk") {
                      newRules[index].config = { minQty: 3, discountPercent: 10 };
                    } else {
                      newRules[index].config = { discountPercent: 10 };
                    }
                    onDiscountRulesChange(newRules);
                  }}
                  className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  <option value="buy_x_get_y">2+1 Kampanya</option>
                  <option value="bulk">Toplu Alım</option>
                  <option value="percentage">Yüzde İndirim</option>
                  <option value="fixed">Sabit İndirim</option>
                </select>

                {rule.type === "buy_x_get_y" && (
                  <>
                    <input
                      type="number"
                      value={rule.config.buy}
                      onChange={(e) => {
                        const newRules = [...discountRules];
                        newRules[index].config.buy = parseInt(e.target.value) || 2;
                        onDiscountRulesChange(newRules);
                      }}
                      placeholder="Al"
                      className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={rule.config.get}
                      onChange={(e) => {
                        const newRules = [...discountRules];
                        newRules[index].config.get = parseInt(e.target.value) || 1;
                        onDiscountRulesChange(newRules);
                      }}
                      placeholder="Öde"
                      className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm"
                    />
                  </>
                )}

                {rule.type === "bulk" && (
                  <>
                    <input
                      type="number"
                      value={rule.config.minQty}
                      onChange={(e) => {
                        const newRules = [...discountRules];
                        newRules[index].config.minQty = parseInt(e.target.value) || 3;
                        onDiscountRulesChange(newRules);
                      }}
                      placeholder="Min. adet"
                      className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={rule.config.discountPercent}
                      onChange={(e) => {
                        const newRules = [...discountRules];
                        newRules[index].config.discountPercent = parseInt(e.target.value) || 10;
                        onDiscountRulesChange(newRules);
                      }}
                      placeholder="İndirim %"
                      className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm"
                    />
                  </>
                )}

                {(rule.type === "percentage" || rule.type === "fixed") && (
                  <input
                    type="number"
                    value={rule.config.discountPercent || rule.config.discountAmount}
                    onChange={(e) => {
                      const newRules = [...discountRules];
                      if (rule.type === "percentage") {
                        newRules[index].config.discountPercent = parseInt(e.target.value) || 10;
                      } else {
                        newRules[index].config.discountAmount = parseInt(e.target.value) || 10;
                      }
                      onDiscountRulesChange(newRules);
                    }}
                    placeholder={rule.type === "percentage" ? "İndirim %" : "İndirim ₺"}
                    className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
