"use client";

import { Product } from "@/types/product";

interface NutritionLabelProps {
  product: Product;
}

export function NutritionLabel({ product }: NutritionLabelProps) {
  const nutrition = product.nutritionalInfo;
  const vitamins = product.nutritionSettings?.vitamins;
  const basis = product.nutritionSettings?.basis || "per_100g";
  const servingSize = product.nutritionSettings?.servingSize || 100;

  if (!nutrition) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">Besin değeri bilgisi bulunmuyor.</p>
      </div>
    );
  }

  const nutrients = [
    { label: "Enerji", value: `${nutrition.calories} kcal`, highlight: true },
    { label: "Protein", value: `${nutrition.protein}g` },
    { label: "Karbonhidrat", value: `${nutrition.carbs}g` },
    { label: "Yağ", value: `${nutrition.fat}g` },
    { label: "Lif", value: `${nutrition.fiber}g` },
    { label: "Şeker", value: nutrition.sugar ? `${nutrition.sugar}g` : "0g" },
  ];

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-2 mb-4">
        <h3 className="text-2xl font-bold text-gray-900">Besin Değerleri</h3>
        <p className="text-sm text-gray-500 mt-1">
          {basis === "per_100g" ? "100g" : `${servingSize}g`} başına
        </p>
      </div>

      {/* Main Nutrients */}
      <div className="divide-y divide-gray-100">
        {nutrients.map((item) => (
          <div 
            key={item.label}
            className={`flex justify-between py-3 ${item.highlight ? "font-semibold text-lg" : "text-gray-600"}`}
          >
            <span>{item.label}</span>
            <span className={item.highlight ? "text-gray-900" : ""}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Vitamins & Minerals */}
      {vitamins && Object.keys(vitamins).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Vitamin & Mineral</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(vitamins).map(([key, value]) => {
              const labelMap: Record<string, string> = {
                a: "A Vitamini",
                c: "C Vitamini",
                d: "D Vitamini",
                e: "E Vitamini",
                calcium: "Kalsiyum",
                iron: "Demir",
                magnesium: "Magnezyum",
                zinc: "Çinko",
              };
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{labelMap[key] || key}</span>
                  <span className="font-medium">{value as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Allergens */}
      {product.nutritionSettings?.allergens && product.nutritionSettings.allergens.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
          <p className="text-sm font-medium text-amber-900 mb-1">Alerjen Uyarısı</p>
          <p className="text-sm text-amber-700">
            Bu ürün {product.nutritionSettings.allergens.join(", ")} içerir.
          </p>
        </div>
      )}
    </div>
  );
}
