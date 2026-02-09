"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, Truck, Check, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, cn } from "@/lib/utils";
import { SHIPPING_THRESHOLD } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideCart({ isOpen, onClose }: SideCartProps) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    total,
    getTotalItems,
    lastAddedItem,
  } = useCart();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Framer Motion Variants
  const slideVariants = {
    hidden: isMobile ? { y: "100%" } : { x: "100%" },
    visible: isMobile ? { y: 0 } : { x: 0 },
    exit: isMobile ? { y: "100%" } : { x: "100%" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999]"
            onClick={onClose}
          />

          {/* Cart Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bg-white shadow-2xl z-[10000] flex flex-col",
              // Mobile: Bottom Sheet
              "bottom-0 left-0 right-0 h-[85vh] w-full rounded-t-[2rem]",
              // Desktop: Side Sheet
              "sm:top-0 sm:right-0 sm:bottom-0 sm:h-screen sm:w-[400px] sm:rounded-none"
            )}
          >
            {isMobile && (
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2 sm:px-6 sm:py-5 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Sepetim</h2>
                <span className="text-sm text-gray-500 font-medium">({getTotalItems()} ürün)</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Kapat"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Last Added Item Banner */}
            {lastAddedItem && (
              <div className="bg-emerald-50 px-6 py-4 flex items-center gap-4">
                <div className="bg-white p-1 rounded-lg border border-emerald-100 shrink-0">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-0.5">Son Eklenen Ürün</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 line-clamp-1">{lastAddedItem.product.name}</span>
                    <span className="text-sm font-bold text-emerald-600">{formatPrice(lastAddedItem.variant.price * lastAddedItem.quantity)}</span>
                  </div>
                  <p className="text-[10px] text-emerald-600/80 font-medium">Sepette {lastAddedItem.quantity} adet</p>
                </div>
                <div className="w-12 h-12 ml-auto bg-white rounded-lg border border-emerald-100 relative shrink-0">
                  {/* Placeholder for image - using emoji based on category for now */}
                  <div className="w-full h-full flex items-center justify-center text-xl">
                    {lastAddedItem.product.category === "fistik-ezmesi" && "🥜"}
                    {lastAddedItem.product.category === "findik-ezmesi" && "🌰"}
                    {lastAddedItem.product.category === "kuruyemis" && "🥔"}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Sepetiniz Boş</h3>
                    <p className="text-gray-500 text-sm mt-1">Henüz sepetinize ürün eklemediniz.</p>
                  </div>
                  <Link
                    href="/urunler"
                    onClick={onClose}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-95 transition-transform duration-300">
                      {item.product.category === "fistik-ezmesi" && "🥜"}
                      {item.product.category === "findik-ezmesi" && "🌰"}
                      {item.product.category === "kuruyemis" && "🥔"}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 text-sm truncate pr-4">{item.product.name}</h3>
                          <span className="font-bold text-gray-900 text-sm">{formatPrice(item.variant.price * item.quantity)}</span>
                        </div>
                        <p className="text-xs text-gray-500">{item.variant.name}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100 text-gray-600 hover:text-black active:scale-95 transition-all"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-3 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-100 text-gray-600 hover:text-black active:scale-95 transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">

                {/* Free Shipping Progress */}
                {shipping > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-bold text-gray-900">{formatPrice(SHIPPING_THRESHOLD - subtotal)}</span> daha ekle, <span className="font-bold text-emerald-600">Kargo Bedava</span> olsun!
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ara Toplam</span>
                    <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kargo</span>
                    <span className={cn("font-bold", shipping === 0 ? "text-emerald-600" : "text-gray-900")}>
                      {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Toplam</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/odeme"
                  onClick={onClose}
                  className="w-full h-14 bg-[#545BE8] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4349c7] active:scale-[0.98] transition-all shadow-lg shadow-indigo-200"
                  style={{ backgroundColor: '#545BE8' }} // Using the purple/blue from reference image
                >
                  Ödemeye Geç <ArrowRight className="h-5 w-5" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                  <ShoppingCart className="h-3 w-3" />
                  <span>Güvenli alışveriş garantisi</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
