"use client";

import { Check } from "lucide-react";
import { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function VariantSelector({ variants, selectedIndex, onSelect }: VariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">Boyut</span>
        <span className="text-sm text-gray-500">
          {variants[selectedIndex]?.weight}g
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {variants.map((variant, index) => {
          const isSelected = index === selectedIndex;
          const isOutOfStock = variant.stock <= 0;
          
          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(index)}
              disabled={isOutOfStock}
              className={`
                relative px-4 py-2.5 rounded-full text-sm font-medium
                transition-all duration-200
                ${isSelected 
                  ? "bg-gray-900 text-white" 
                  : isOutOfStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <span className="flex items-center gap-2">
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {variant.name}
              </span>
              {variant.stock > 0 && variant.stock <= 5 && !isSelected && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
