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
  AlertCircle,
  Copy,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();

  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([]);
  const [isLoadingGateways, setIsLoadingGateways] = useState(true);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
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
  });

  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoadingGateways(true);
        const [gateways, rates] = await Promise.all([
          getActivePaymentGateways(),
          Promise.resolve(getShippingRatesForCountry(shippingInfo.country))
        ]);

        setPaymentGateways(gateways);
        setShippingRates(rates);

        if (gateways.length > 0 && !selectedPaymentMethod) {
          setSelectedPaymentMethod(gateways[0].id);
        }
        if (rates.length > 0 && !selectedShippingMethod) {
          setSelectedShippingMethod(rates[0].id);
        }
      } catch (error) {
        console.error("Failed to load checkout data", error);
        toast.error("İşlem sırasında bir hata oluştu.");
      } finally {
        setIsLoadingGateways(false);
      }
    };

    initData();
  }, [shippingInfo.country]);

  const handleCompleteOrder = async () => {
    if (items.length === 0) return;

    if (!contactEmail || !contactEmail.includes("@")) {
      toast.error("Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      toast.error("Lütfen tüm teslimat bilgilerini doldurunuz.");
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("IBAN kopyalandı!");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h1>
          <p className="text-gray-500 mb-8">Henüz sepetinize ürün eklemediniz.</p>
          <Link
            href="/urunler"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors w-full"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  const selectedGateway = paymentGateways.find(g => g.id === selectedPaymentMethod);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 pb-20 pt-8 lg:pt-12">
      <main className="container mx-auto px-4 lg:px-8 max-w-6xl">

        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* LEFT COLUMN - FORMS */}
          <div className="flex-1 w-full space-y-10">

            {/* 1. Contact Info */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">İletişim Bilgileri</h2>
                <div className="text-sm text-gray-500">
                  Hesabınız var mı? <Link href="/giris" className="text-primary font-medium hover:underline">Giriş Yap</Link>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="clean-input"
                  placeholder="E-posta Adresi"
                />
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={receiveUpdates}
                    onChange={(e) => setReceiveUpdates(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">Kampanya ve indirimlerden haberdar olmak istiyorum</span>
                </label>
              </div>
            </section>

            <div className="h-px bg-gray-200" />

            {/* 2. Shipping Address */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Teslimat Adresi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={shippingInfo.firstName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                  className="clean-input"
                  placeholder="Ad"
                />
                <input
                  type="text"
                  value={shippingInfo.lastName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                  className="clean-input"
                  placeholder="Soyad"
                />
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="clean-input"
                    placeholder="Adres (Mahalle, Sokak, Kapı No...)"
                  />
                </div>
                <div className="relative">
                  <select
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="clean-input appearance-none cursor-pointer"
                  >
                    <option value="">Şehir Seçiniz</option>
                    {TURKISH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="clean-input"
                  placeholder="Telefon (0 5xx...)"
                />
              </div>
            </section>

            <div className="h-px bg-gray-200" />

            {/* 3. Shipping Method */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Kargo Yöntemi</h2>

              {subtotal >= SHIPPING_THRESHOLD ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Ücretsiz Kargo</h3>
                    <p className="text-sm text-emerald-700">Sepet tutarınız {formatPrice(SHIPPING_THRESHOLD)} üzeri olduğu için kargo ücretsiz.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingRates.length > 0 ? shippingRates.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all",
                        selectedShippingMethod === method.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_method"
                          checked={selectedShippingMethod === method.id}
                          onChange={() => setSelectedShippingMethod(method.id)}
                          className="text-primary focus:ring-primary border-gray-300"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{method.name}</p>
                          {method.condition && <p className="text-xs text-gray-500">{method.condition}</p>}
                        </div>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{formatPrice(method.price)}</span>
                    </label>
                  )) : (
                    <div className="text-center py-6">
                      <Loader2 className="h-6 w-6 text-gray-300 animate-spin mx-auto" />
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="h-px bg-gray-200" />

            {/* 4. Payment Method */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ödeme Yöntemi</h2>

              {isLoadingGateways ? (
                <div className="space-y-2">
                  <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              ) : paymentGateways.length === 0 ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  Ödeme yöntemi bulunamadı. Lütfen yönetici ile iletişime geçin.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Payment Selection List */}
                  <div className="divide-y divide-gray-100">
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id}>
                        <label
                          className={cn(
                            "flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                            selectedPaymentMethod === gateway.id ? "bg-gray-50" : ""
                          )}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            checked={selectedPaymentMethod === gateway.id}
                            onChange={() => setSelectedPaymentMethod(gateway.id)}
                            className="text-primary focus:ring-primary border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 text-sm block">{gateway.name}</span>
                          </div>
                          {/* Icons based on gateway type */}
                          {gateway.gateway === 'bank_transfer' && <Building2 className="h-5 w-5 text-gray-400" />}
                          {gateway.gateway === 'cod' && <Truck className="h-5 w-5 text-gray-400" />}
                          {(gateway.gateway === 'paytr' || gateway.gateway === 'iyzico') && <CreditCard className="h-5 w-5 text-gray-400" />}
                        </label>

                        {/* Details Panel (Only for selected) */}
                        <AnimatePresence>
                          {selectedPaymentMethod === gateway.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-[#FAFAFA] border-t border-gray-100"
                            >
                              <div className="p-6">
                                {gateway.gateway === "bank_transfer" && gateway.bankAccount && (
                                  <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 grid gap-4">
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Banka</p>
                                        <p className="text-sm font-medium text-gray-900">{gateway.bankAccount.bankName}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Alıcı</p>
                                        <p className="text-sm font-medium text-gray-900">{gateway.bankAccount.accountHolder}</p>
                                      </div>
                                      <div onClick={() => copyToClipboard(gateway.bankAccount!.iban)} className="cursor-pointer group">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-2">
                                          IBAN
                                          <span className="text-primary text-[10px] bg-primary/5 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Kopyalamak için tıkla</span>
                                        </p>
                                        <p className="text-sm font-mono font-medium text-gray-900 break-all group-hover:text-primary transition-colors">{gateway.bankAccount.iban}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Info className="h-4 w-4 text-gray-400" />
                                      Sipariş açıklamasında sipariş numaranızı belirtmeyi unutmayınız.
                                    </div>
                                  </div>
                                )}

                                {(gateway.gateway === "paytr" || gateway.gateway === "iyzico" || gateway.gateway === "stripe") && (
                                  <div className="text-center py-4">
                                    <Lock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-900">Güvenli Ödeme Sayfasına Yönlendirileceksiniz</p>
                                    <p className="text-xs text-gray-500 mt-1">Kart bilgileriniz 256-bit SSL ile korunmaktadır. Ezmeo kart bilgilerinizi saklamaz.</p>
                                    <div className="flex justify-center gap-2 mt-4 grayscale opacity-60">
                                      {/* Placeholders for card icons if needed */}
                                      <div className="bg-gray-200 px-2 py-1 rounded text-[10px] font-bold">VISA</div>
                                      <div className="bg-gray-200 px-2 py-1 rounded text-[10px] font-bold">MasterCard</div>
                                    </div>
                                  </div>
                                )}

                                {gateway.gateway === "cod" && (
                                  <div className="text-center py-2 text-sm text-gray-600">
                                    Kapıda nakit veya kredi kartı ile ödeme yapabilirsiniz.
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN - SUMMARY */}
          {/* Use standard CSS sticky */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-8 self-start">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Sipariş Özeti</h2>
              </div>

              <div className="p-6">
                {/* Compact Product List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                        {item.product.category === "fistik-ezmesi" && "🥜"}
                        {item.product.category === "findik-ezmesi" && "🌰"}
                        {item.product.category === "kuruyemis" && "🥔"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
                        <p className="text-xs text-gray-500">{item.variant.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.quantity} Adet</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.variant.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gray-100 my-6" />

                {/* Totals */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className={shipping === 0 ? "text-emerald-600 font-medium" : ""}>
                      {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
                    <span>Toplam</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteOrder}
                  disabled={isSubmitting}
                  className="w-full mt-6 py-4 bg-primary text-white rounded-lg font-bold hover:bg-red-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    "Siparişi Tamamla"
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Güvenli ödeme altyapısı ile korunmaktadır.
                </p>
              </div>
            </div>

            <div className="mt-4 text-center px-4">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Devam ederek <Link href="/sozlesmeler" className="underline hover:text-gray-600">Mesafeli Satış Sözleşmesi</Link>&apos;ni kabul etmiş sayılırsınız.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
