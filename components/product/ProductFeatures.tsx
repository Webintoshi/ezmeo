"use client";

import { Check, Package, Clock, ThermometerSnowflake } from "lucide-react";
import { Product } from "@/types/product";

interface ProductFeaturesProps {
  product: Product;
}

export function ProductFeatures({ product }: ProductFeaturesProps) {
  const features = [
    product.vegan && "%100 Vegan",
    product.glutenFree && "Glutensiz",
    product.sugarFree && "Şeker İçermez",
    product.highProtein && "Yüksek Protein",
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Description */}
      {product.description && (
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Ingredients */}
      {product.nutritionSettings?.ingredients && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">İçindekiler</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {product.nutritionSettings.ingredients}
          </p>
        </div>
      )}

      {/* Features Grid */}
      {features.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Ürün Özellikleri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Katkı Maddesi İçermez</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Palm Yağı İçermez</span>
            </div>
          </div>
        </div>
      )}

      {/* Storage Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {product.nutritionSettings?.storageConditions && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <ThermometerSnowflake className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Saklama</p>
              <p className="text-sm text-gray-500 mt-1">{product.nutritionSettings.storageConditions}</p>
            </div>
          </div>
        )}
        
        {product.nutritionSettings?.shelfLifeDays && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Raf Ömrü</p>
              <p className="text-sm text-gray-500 mt-1">{product.nutritionSettings.shelfLifeDays} gün</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
          <Package className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Paketleme</p>
            <p className="text-sm text-gray-500 mt-1">Hijyenik kavanoz</p>
          </div>
        </div>
      </div>
    </div>
  );
}
