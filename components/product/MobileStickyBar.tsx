"use client";

import { ShoppingCart } from "lucide-react";

interface MobileStickyBarProps {
  price: number;
  originalPrice?: number;
  onAddToCart: () => void;
  isOutOfStock?: boolean;
}

export function MobileStickyBar({ 
  price, 
  originalPrice, 
  onAddToCart,
  isOutOfStock = false 
}: MobileStickyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 lg:hidden safe-area-pb">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-gray-900">{price} ₺</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">{originalPrice} ₺</span>
            )}
          </div>
        </div>
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium
            transition-all duration-200
            ${isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
            }
          `}
        >
          <ShoppingCart className="w-4 h-4" />
          {isOutOfStock ? "Tükendi" : "Sepete Ekle"}
        </button>
      </div>
    </div>
  );
}
