"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice, cn } from "@/lib/utils";
import { TURKISH_CITIES, SHIPPING_THRESHOLD } from "@/lib/constants";
import { getActivePaymentGateways } from "@/lib/payments";
import { getShippingRatesForCountry } from "@/lib/shipping";
import { PaymentGatewayConfig } from "@/types/payment";
import { ShippingRate } from "@/lib/shipping-storage";
import { toast } from "sonner";
import {
  CreditCard,
  Truck,
  Mail,
  MapPin,
  Lock,
  ChevronRight,
  Check,
  ShieldCheck,
  Package,
  Building2,
  Phone,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, getTotalItems, clearCart } = useCart();

  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([]);
  const [isLoadingGateways, setIsLoadingGateways] = useState(true);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactEmail, setContactEmail] = useState("");
  const [receiveUpdates, setReceiveUpdates] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    city: "",
    phone: "",
    country: "Türkiye",
    saveInfo: false,
  });

  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoadingGateways(true);
        const [gateways, rates] = await Promise.all([
          getActivePaymentGateways(),
          // Shipping rates are sync currently but good to keep structured
          Promise.resolve(getShippingRatesForCountry(shippingInfo.country))
        ]);

        setPaymentGateways(gateways);
        setShippingRates(rates);

        // Auto-select first options if available
        if (gateways.length > 0 && !selectedPaymentMethod) {
          setSelectedPaymentMethod(gateways[0].id);
        }
        if (rates.length > 0 && !selectedShippingMethod) {
          setSelectedShippingMethod(rates[0].id);
        }
      } catch (error) {
        console.error("Failed to load checkout data", error);
        toast.error("Ödeme yöntemleri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoadingGateways(false);
      }
    };

    initData();
  }, [shippingInfo.country]);

  const handleCompleteOrder = async () => {
    if (items.length === 0) return;

    // Validation
    if (!contactEmail || !contactEmail.includes("@")) {
      toast.error("Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      toast.error("Lütfen tüm teslimat bilgilerini doldurunuz.");
      return;
    }
    if (!selectedShippingMethod) {
      toast.error("Lütfen bir kargo yöntemi seçiniz.");
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error("Lütfen bir ödeme yöntemi seçiniz.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerId: null,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantName: item.variant.name,
          price: item.variant.price,
          quantity: item.quantity,
          total: item.variant.price * item.quantity
        })),
        shippingAddress: shippingInfo,
        billingAddress: shippingInfo,
        paymentMethod: selectedPaymentMethod,
        shippingCost: shipping,
        discount: 0,
        notes: "",
        contactEmail,
        receiveUpdates
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Siparişiniz başarıyla alındı!");
        clearCart();
        router.push(`/siparisler/${result.order.id}?new=true`);
      } else {
        toast.error(result.error || "Sipariş oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("Bir bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render icon based on gateway type
  const renderGatewayIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return <Building2 className="h-5 w-5" />;
      case 'cod': return <Truck className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h1>
          <p className="text-gray-500 mb-8">Ödeme sayfasına devam etmek için ürün eklemelisiniz.</p>
          <Link
            href="/urunler"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-red-800 transition-colors w-full"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <main className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column - Forms */}
          <div className="flex-1 w-full space-y-6">

            {/* 1. Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">1</div>
                  İletişim Bilgileri
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={receiveUpdates}
                      onChange={(e) => setReceiveUpdates(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-primary transition-colors peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">Kampanyalardan haberdar olmak istiyorum</span>
                </label>
              </div>
            </div>

            {/* 2. Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">2</div>
                  Teslimat Adresi
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Adres</label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none resize-none"
                    placeholder="Mahalle, Sokak, Kapı No..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Şehir</label>
                  <div className="relative">
                    <select
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {TURKISH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none rotate-90" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      placeholder="0 5xx xxx xx xx"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm outline-none"
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Shipping Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">3</div>
                  Kargo Seçimi
                </h2>
              </div>
              <div className="p-6">
                {subtotal >= SHIPPING_THRESHOLD ? (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-start gap-4">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">Ücretsiz Kargo Kazandınız! 🎉</p>
                      <p className="text-sm text-emerald-700 mt-1">Siparişiniz ücretsiz olarak teslim edilecektir.</p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                        <Check className="h-3 w-3" /> Standart Teslimat
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingRates.length > 0 ? shippingRates.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedShippingMethod === method.id
                            ? "border-primary bg-red-50/30 ring-1 ring-primary/20"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            className="w-5 h-5 text-primary border-gray-300 focus:ring-primary/20"
                            checked={selectedShippingMethod === method.id}
                            onChange={() => setSelectedShippingMethod(method.id)}
                          />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{method.name}</p>
                            {method.condition && <p className="text-xs text-gray-500 mt-0.5">{method.condition}</p>}
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{formatPrice(method.price)}</span>
                      </label>
                    )) : (
                      <div className="text-center py-8 text-gray-400 text-sm">Teslimat seçenekleri yükleniyor...</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">4</div>
                  Ödeme Yöntemi
                </h2>
              </div>
              <div className="p-6">
                {isLoadingGateways ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
                  </div>
                ) : paymentGateways.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                    <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
                    <p>Aktif ödeme yöntemi bulunamadı.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id} className="group">
                        <label
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedPaymentMethod === gateway.id
                              ? "border-primary bg-red-50/20 shadow-sm"
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <input
                            type="radio"
                            name="payment"
                            className="w-5 h-5 text-primary border-gray-300 focus:ring-primary/20"
                            checked={selectedPaymentMethod === gateway.id}
                            onChange={() => setSelectedPaymentMethod(gateway.id)}
                          />
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-gray-600",
                            selectedPaymentMethod === gateway.id ? "bg-white border border-gray-200 text-primary" : "bg-gray-100"
                          )}>
                            {renderGatewayIcon(gateway.gateway)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{gateway.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{gateway.description}</p>
                          </div>
                        </label>

                        <AnimatePresence>
                          {selectedPaymentMethod === gateway.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              {gateway.gateway === "bank_transfer" && gateway.bankAccount && (
                                <div className="mt-3 ml-1 p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-3">
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Banka:</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{gateway.bankAccount.bankName}</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">Alıcı:</span>
                                    <span className="col-span-2 font-semibold text-gray-900">{gateway.bankAccount.accountHolder}</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="text-gray-500 font-medium">IBAN:</span>
                                    <span className="col-span-2 font-mono font-medium text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded select-all">
                                      {gateway.bankAccount.iban}
                                    </span>
                                  </div>
                                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-2 items-start mt-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>Havale/EFT yaparken açıklama kısmına sipariş numaranızı yazmayı unutmayınız.</span>
                                  </div>
                                </div>
                              )}

                              {(gateway.gateway === "paytr" || gateway.gateway === "iyzico" || gateway.gateway === "stripe") && (
                                <div className="mt-3 ml-1 p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm flex items-center gap-3 text-gray-600">
                                  <Lock className="h-4 w-4" />
                                  <span>Siparişi onayladıktan sonra güvenli ödeme ekranına yönlendirileceksiniz.</span>
                                </div>
                              )}

                              {gateway.gateway === "cod" && (
                                <div className="mt-3 ml-1 p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm flex items-center gap-3 text-gray-600">
                                  <Truck className="h-4 w-4" />
                                  <span>Ödemenizi teslimat sırasında nakit veya kredi kartı ile yapabilirsiniz.</span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Summary */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h2 className="font-semibold text-gray-900">Sipariş Özeti</h2>
                <p className="text-xs text-gray-500 mt-1">{getTotalItems()} Ürün</p>
              </div>

              {/* Product List */}
              <div className="max-h-[300px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl shrink-0 border border-gray-100">
                      {/* Fallback icons based on category until images are fully set up */}
                      {item.product.category === "fistik-ezmesi" && "🥜"}
                      {item.product.category === "findik-ezmesi" && "🌰"}
                      {item.product.category === "kuruyemis" && "🥔"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.variant.name} x {item.quantity}</p>
                    </div>
                    <div className="font-semibold text-sm text-gray-900">
                      {formatPrice(item.variant.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="p-6 bg-gray-50/50 space-y-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ara Toplam</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kargo</span>
                  <span className={cn("font-medium", shipping === 0 ? "text-emerald-600" : "text-gray-900")}>
                    {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                  </span>
                </div>
                {subtotal < SHIPPING_THRESHOLD && (
                  <div className="pt-2">
                    <div className="text-xs text-gray-500 mb-1 flex justify-between">
                      <span>Kargo bedava için kalan:</span>
                      <span className="font-medium text-primary">{formatPrice(SHIPPING_THRESHOLD - subtotal)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(subtotal / SHIPPING_THRESHOLD) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                  <div>
                    <span className="text-xs text-gray-500 block">Toplam Ödenecek</span>
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0 bg-gray-50/50">
                <button
                  onClick={handleCompleteOrder}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-red-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                  {isSubmitting ? "İşleniyor..." : "Siparişi Onayla"}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-3 leading-tight">
                  Siparişi onaylayarak <Link href="/sozlesmeler" className="underline hover:text-gray-600">Mesafeli Satış Sözleşmesi</Link>'ni kabul etmiş olursunuz.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="px-6 pb-6 bg-gray-50/50 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                <img src="/images/payments/visa.svg" alt="Visa" className="h-5 w-auto" />
                <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-7 w-auto" />
                <img src="/images/payments/troy.svg" alt="Troy" className="h-5 w-auto" />
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-800 text-xs font-medium p-4 rounded-xl flex items-center justify-center gap-2 border border-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              256-Bit SSL ile güvenli ödeme
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
