"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_name: string;
  variant_name?: string;
  price: number;
  quantity: number;
  total: number;
  product?: {
    images?: string[];
    category?: string;
    slug?: string;
  };
}

interface OrderItemsListProps {
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  className?: string;
}

// Category emoji fallback
const getCategoryEmoji = (category?: string) => {
  const emojiMap: Record<string, string> = {
    "fistik-ezmesi": "🥜",
    "findik-ezmesi": "🌰",
    "fistik": "🥜",
    "findik": "🌰",
    "kuruyemis": "🥔",
    "badem": "🌰",
    "ceviz": "🌰",
  };
  return emojiMap[category || ""] || "🥔";
};

export function OrderItemsList({
  items,
  subtotal,
  shippingCost,
  discount,
  total,
  className = "",
}: OrderItemsListProps) {
  const hasDiscount = discount > 0;
  const hasFreeShipping = shippingCost === 0;

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Sipariş İçeriği</h3>
        </div>
        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {items.length} Ürün
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {items.map((item, index) => {
          // Get product image
          const productImage = item.product?.images?.[0];
          const categoryEmoji = getCategoryEmoji(item.product?.category);

          return (
            <div
              key={item.id}
              className="p-6 flex items-center gap-6 hover:bg-gray-50/50 transition-colors"
            >
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {categoryEmoji}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                {item.product?.slug ? (
                  <Link
                    href={`/urunler/${item.product.slug}`}
                    className="font-bold text-gray-900 hover:text-primary transition-colors"
                  >
                    {item.product_name}
                  </Link>
                ) : (
                  <p className="font-bold text-gray-900">{item.product_name}</p>
                )}
                {item.variant_name && (
                  <p className="text-sm text-gray-500 mt-0.5">{item.variant_name}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="text-center shrink-0">
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">x{item.quantity}</span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0 w-24">
                <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                <p className="font-black text-gray-900 text-lg">{formatPrice(item.total)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-8 bg-gradient-to-b from-gray-50/50 to-transparent border-t border-gray-100">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600 font-medium">
            <span>Ara Toplam</span>
            <span className="text-gray-900">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-gray-600 font-medium">
            <span>Kargo</span>
            <span className={hasFreeShipping ? "text-emerald-600 font-bold" : "text-gray-900"}>
              {hasFreeShipping ? "Ücretsiz" : formatPrice(shippingCost)}
            </span>
          </div>

          {hasDiscount && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>İndirim</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
            <span className="text-gray-900 font-black text-lg">Genel Toplam</span>
            <span className="text-primary font-black text-2xl">{formatPrice(total)}</span>
          </div>
        </div>

        {hasFreeShipping && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
              <Package className="w-3 h-3 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-700">
              Ücretsiz kargo! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
