"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantAttribute {
  id: string;
  name: string;
  value: string;
  color_code?: string | null;
  image_url?: string | null;
}

interface ProductVariant {
  id: string;
  name: string;
  weight: string | number;
  price: number;
  originalPrice?: number;
  stock: number;
  images?: string[];
  attributes?: VariantAttribute[];
}

interface Props {
  variants: ProductVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function VariantSelectorV2({ variants, selectedIndex, onSelect }: Props) {
  const [attributeGroups, setAttributeGroups] = useState<Map<string, { name: string; values: any[] }>>(new Map());
  const [selectedValues, setSelectedValues] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const groups = new Map();
    
    variants.forEach((variant, idx) => {
      variant.attributes?.forEach((attr) => {
        const key = attr.id || attr.name;
        if (!groups.has(key)) {
          groups.set(key, { name: attr.name, values: [] });
        }
        const exists = groups.get(key).values.find((v: any) => v.value === attr.value);
        if (!exists) {
          groups.get(key).values.push({ ...attr, variantIndex: idx });
        }
      });
    });

    setAttributeGroups(groups);

    // Set initial selected
    const current = variants[selectedIndex];
    const initial = new Map();
    current?.attributes?.forEach((attr) => {
      initial.set(attr.id || attr.name, attr.value);
    });
    setSelectedValues(initial);
  }, [variants, selectedIndex]);

  const isColor = (name: string) => {
    return name.toLowerCase().includes('renk') || name.toLowerCase().includes('color');
  };

  const handleSelect = (attrKey: string, value: string) => {
    const newSelected = new Map(selectedValues);
    newSelected.set(attrKey, value);

    const matchIndex = variants.findIndex((v) => {
      return v.attributes?.every((attr) => {
        const key = attr.id || attr.name;
        return newSelected.get(key) === attr.value;
      });
    });

    if (matchIndex !== -1) {
      onSelect(matchIndex);
    }
  };

  if (!variants || variants.length === 0) return null;

  // Tek varyant, nitelik yok
  if (variants.length === 1 && attributeGroups.size === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#7B1113]">Seçenek</span>
          <span className="text-sm text-[#6b4b4c] bg-[#F3E0E1] px-3 py-1 rounded-full">
            {variants[0].weight}g
          </span>
        </div>
        <div className="p-3 bg-[#F3E0E1]/50 rounded-xl border border-[#7B1113]/10">
          <span className="font-medium text-[#7B1113]">{variants[0].name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Attribute Groups */}
      {Array.from(attributeGroups.entries()).map(([key, group]) => {
        const isColorAttr = isColor(group.name);
        const currentValue = selectedValues.get(key);

        return (
          <div key={key} className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#7B1113] uppercase tracking-wide">
                {group.name}
              </span>
              <span className="text-gray-400">—</span>
              <span className="text-[#6b4b4c]">{currentValue}</span>
            </div>

            {/* Color Swatches */}
            {isColorAttr ? (
              <div className="flex flex-wrap gap-3">
                {group.values.map((val: any, idx: number) => {
                  const isSelected = currentValue === val.value;
                  const isOutOfStock = variants[val.variantIndex]?.stock <= 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isOutOfStock && handleSelect(key, val.value)}
                      disabled={isOutOfStock}
                      className={cn(
                        "relative w-14 h-14 rounded-full border-2 transition-all duration-200",
                        isSelected
                          ? "border-[#7B1113] ring-2 ring-[#7B1113]/30"
                          : "border-gray-300 hover:border-gray-400",
                        isOutOfStock && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="absolute inset-1 rounded-full overflow-hidden">
                        {val.image_url ? (
                          <img
                            src={val.image_url}
                            alt={val.value}
                            className="w-full h-full object-cover"
                          />
                        ) : val.color_code ? (
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: val.color_code }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                            {val.value.slice(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-[#7B1113] rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Text Buttons */
              <div className="flex flex-wrap gap-2">
                {group.values.map((val: any, idx: number) => {
                  const isSelected = currentValue === val.value;
                  const isOutOfStock = variants[val.variantIndex]?.stock <= 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isOutOfStock && handleSelect(key, val.value)}
                      disabled={isOutOfStock}
                      className={cn(
                        "relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
                        isSelected
                          ? "bg-[#7B1113] text-white border-[#7B1113]"
                          : isOutOfStock
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-[#7B1113] border-gray-300 hover:border-[#7B1113]"
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                      {val.value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Fallback: No attributes */}
      {attributeGroups.size === 0 && variants.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#7B1113]">Seçenek</span>
            <span className="text-sm text-[#6b4b4c] bg-[#F3E0E1] px-3 py-1 rounded-full">
              {variants[selectedIndex]?.weight}g
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const isSelected = idx === selectedIndex;
              const isOutOfStock = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  onClick={() => !isOutOfStock && onSelect(idx)}
                  disabled={isOutOfStock}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium border transition-all",
                    isSelected
                      ? "bg-[#7B1113] text-white border-[#7B1113]"
                      : isOutOfStock
                      ? "bg-gray-100 text-gray-400 border-gray-200"
                      : "bg-white text-[#7B1113] border-gray-300 hover:border-[#7B1113]"
                  )}
                >
                  {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Info */}
      <p className="text-sm text-[#6b4b4c]">
        Seçilen: <span className="font-medium text-[#7B1113]">{variants[selectedIndex]?.name}</span>
      </p>
    </div>
  );
}
