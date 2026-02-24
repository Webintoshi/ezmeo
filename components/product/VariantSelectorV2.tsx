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
  attribute?: {
    id: string;
    name: string;
  };
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
  const [groups, setGroups] = useState<Map<string, { attrName: string; values: any[] }>>(new Map());

  useEffect(() => {
    console.log("Variants received:", variants);
    console.log("Selected index:", selectedIndex);
    
    const g = new Map();
    
    variants.forEach((variant, vIdx) => {
      variant.attributes?.forEach((attr) => {
        // attribute.name veya attribute.attribute.name kullan
        const attrName = attr.attribute?.name || attr.name || "Seçenek";
        const attrId = attr.attribute?.id || attr.id || attrName;
        
        if (!g.has(attrId)) {
          g.set(attrId, { attrName, values: [] });
        }
        
        const exists = g.get(attrId).values.find((v: any) => v.value === attr.value);
        if (!exists) {
          g.get(attrId).values.push({
            ...attr,
            variantIndex: vIdx,
            displayName: attrName
          });
        }
      });
    });

    console.log("Attribute groups:", Array.from(g.entries()));
    setGroups(g);
  }, [variants]);

  const isColor = (name: string) => {
    return name.toLowerCase().includes('renk') || 
           name.toLowerCase().includes('color') ||
           name.toLowerCase().includes('rengi');
  };

  const getSelectedValue = (attrId: string) => {
    const current = variants[selectedIndex];
    const attr = current?.attributes?.find((a) => 
      (a.attribute?.id || a.id || a.name) === attrId
    );
    return attr?.value;
  };

  const handleSelect = (attrId: string, value: string) => {
    // Find variant with this attribute value
    const matchIndex = variants.findIndex((v) => {
      return v.attributes?.some((a) => {
        const aId = a.attribute?.id || a.id || a.name;
        return aId === attrId && a.value === value;
      });
    });

    if (matchIndex !== -1) {
      onSelect(matchIndex);
    }
  };

  if (!variants || variants.length === 0) return null;

  // Tek varyant, nitelik yok
  if (variants.length === 1 && groups.size === 0) {
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
      {Array.from(groups.entries()).map(([attrId, group]) => {
        const isColorAttr = isColor(group.attrName);
        const selectedValue = getSelectedValue(attrId);

        return (
          <div key={attrId} className="space-y-3">
            {/* Header: NITELIK ADI — Seçili Değer */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#7B1113] uppercase tracking-wide text-sm">
                {group.attrName}
              </span>
              {selectedValue && (
                <>
                  <span className="text-gray-400">—</span>
                  <span className="text-[#6b4b4c] text-sm">{selectedValue}</span>
                </>
              )}
            </div>

            {/* Color Swatches with Images */}
            {isColorAttr ? (
              <div className="flex flex-wrap gap-3">
                {group.values.map((val: any, idx: number) => {
                  const isSelected = selectedValue === val.value;
                  const isOutOfStock = variants[val.variantIndex]?.stock <= 0;
                  
                  console.log(`Color ${val.value}:`, { image_url: val.image_url, color_code: val.color_code });

                  return (
                    <button
                      key={idx}
                      onClick={() => !isOutOfStock && handleSelect(attrId, val.value)}
                      disabled={isOutOfStock}
                      className={cn(
                        "relative w-16 h-16 rounded-full border-2 transition-all duration-200 overflow-hidden",
                        isSelected
                          ? "border-[#7B1113] ring-2 ring-[#7B1113]/30"
                          : "border-gray-300 hover:border-gray-400",
                        isOutOfStock && "opacity-50 cursor-not-allowed"
                      )}
                      title={val.value}
                    >
                      {/* Inner circle */}
                      <div className="absolute inset-1 rounded-full overflow-hidden bg-gray-100">
                        {val.image_url ? (
                          <img
                            src={val.image_url}
                            alt={val.value}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Image failed to load:", val.image_url);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : val.color_code ? (
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: val.color_code }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600">
                            {val.value.slice(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
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
                  const isSelected = selectedValue === val.value;
                  const isOutOfStock = variants[val.variantIndex]?.stock <= 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isOutOfStock && handleSelect(attrId, val.value)}
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

      {/* Fallback */}
      {groups.size === 0 && variants.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#7B1113]">Boyut</span>
            <span className="text-sm text-[#6b4b4c] bg-[#F3E0E1] px-3 py-1 rounded-full">
              {variants[selectedIndex]?.weight}g
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelect(idx)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium border transition-all",
                    isSelected
                      ? "bg-[#7B1113] text-white border-[#7B1113]"
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
