"use client";

import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, Truck } from "lucide-react";
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
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Side Cart */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 h-screen w-full sm:w-[380px] lg:w-[400px] bg-white shadow-2xl z-[10000] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-primary/95 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 text-white" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-secondary text-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">Sepetim</h2>
                  <p className="text-[10px] text-white/80">{getTotalItems()} ürün</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Sepeti kapat"
              >
                <X className="h-5 w-5 text-white" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-50 to-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-6"
                  >
                    <ShoppingBag className="h-10 w-10 text-primary" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-primary mb-2"
                  >
                    Sepetiniz boş
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 text-sm mb-6 max-w-xs"
                  >
                    Sepetinizde ürün bulunmamaktadır.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      href="/urunler"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 text-sm"
                    >
                      Alışverişe Başla
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.variantId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
                      >
                        <div className="flex gap-3">
                          {/* Image Placeholder */}
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            {item.product.category === "fistik-ezmesi" && "🥜"}
                            {item.product.category === "findik-ezmesi" && "🌰"}
                            {item.product.category === "kuruyemis" && "🥔"}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                  {item.product.name}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                  {item.variant.name}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1, color: "#ef4444" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFromCart(item.variantId)}
                                className="p-1 text-gray-400 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </motion.button>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-0.5">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md transition-all"
                                >
                                  <Minus className="h-2.5 w-2.5 text-gray-600" />
                                </motion.button>
                                <span className="w-6 text-center text-xs font-bold text-gray-900">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md transition-all"
                                >
                                  <Plus className="h-2.5 w-2.5 text-gray-600" />
                                </motion.button>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 line-through">
                                  {formatPrice(item.variant.price * 1.2)}
                                </p>
                                <p className="text-sm font-black text-primary">
                                  {formatPrice(item.variant.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary Area */}
                  <div className="bg-white border-t border-gray-100 p-5 space-y-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">

                    {/* Free Shipping Progress */}
                    <div className="relative overflow-hidden bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <div className="flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5 text-primary" />
                          <span className="font-bold text-[11px] text-gray-900">
                            {shipping === 0 ? "Kargo Bedava! 🎉" : "Kargo Bedava Fırsatı"}
                          </span>
                        </div>
                        {shipping > 0 && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                            {formatPrice(SHIPPING_THRESHOLD - subtotal)} kaldı
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full relative z-10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        />
                      </div>
                    </div>

                    {/* Coupon Code Section - Fixed & Prominent */}
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                      <p className="text-[11px] font-bold text-primary mb-2 uppercase tracking-wider">İndirim Kuponu</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="KOD GİRİNİZ"
                          className="flex-1 bg-white border-2 border-primary/10 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 uppercase tracking-widest"
                        />
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-primary/90 transition-colors shadow-sm active:scale-95">
                          UYGULA
                        </button>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500 font-medium">Ara Toplam</span>
                        <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500 font-medium">Kargo</span>
                        <span className={cn("font-bold", shipping === 0 ? "text-green-600" : "text-gray-900")}>
                          {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="pt-3 mt-1 border-t border-gray-100 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ödenecek Tutar</span>
                          <span className="text-2xl font-black text-primary tracking-tighter">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <div className="text-right pb-1">
                          <p className="text-[10px] text-gray-400 font-medium">KDV Dahil Edilmiştir</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-2.5">
                      <Link
                        href="/odeme"
                        onClick={onClose}
                        className="group relative overflow-hidden px-8 py-4 bg-primary text-white rounded-xl font-black text-base transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <span>Güvenli Ödeme</span>
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                      </Link>

                      <Link
                        href="/sepet"
                        onClick={onClose}
                        className="py-1 text-center font-bold text-gray-500 hover:text-primary transition-colors text-xs"
                      >
                        Sepeti Görüntüle
                      </Link>
                    </div>

                    {/* Trust Factor Mini */}
                    <div className="flex items-center justify-center opacity-60">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Güvenli Alışveriş İşlemi</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
