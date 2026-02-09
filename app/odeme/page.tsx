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
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Package,
  Phone,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, getTotalItems, clearCart } = useCart();

  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([]);
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

  // Initialize data on mount and when country changes
  useEffect(() => {
    const initData = async () => {
      const gateways = await getActivePaymentGateways();
      setPaymentGateways(gateways);

      if (gateways.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(gateways[0].id);
      }
    };

    initData();

    const rates = getShippingRatesForCountry(shippingInfo.country);
    setShippingRates(rates);

    if (rates.length > 0 && !selectedShippingMethod) {
      setSelectedShippingMethod(rates[0].id);
    }
  }, [shippingInfo.country, selectedPaymentMethod, selectedShippingMethod]); // Added missing dependencies

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
        customerId: null, // Guest checkout for now
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
        billingAddress: shippingInfo, // Assuming same for now
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
        // Redirect to success page or order details
        // For now, redirect to homepage with success parameter or a dedicated success page
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-primary/5 border border-primary/5"
        >
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-primary"
            >
              <path d="M16 8V6a2 2 0 0 0-2-2H9.5a2 2 0 0 0-2 2v2" />
              <path d="M7 8h10" />
              <path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
              <path d="M9.5 13a2.5 2.5 0 0 1 5 0" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-primary mb-4 tracking-tight">Sepetiniz Boş</h1>
          <p className="text-gray-500 mb-8 leading-relaxed font-medium">Ödeme sayfasına devam etmek için sepetinize ürün eklemelisiniz.</p>
          <Link
            href="/urunler"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group w-full"
          >
            Alışverişe Başla
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F5] selection:bg-primary selection:text-white pb-20">
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Title for Checkout */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-black text-primary tracking-tighter mb-2">Güvenli Ödeme</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">Siparişinizi Tamamlayın</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left Column - Single Step Checkout Flow */}
            <div className="lg:col-span-7 space-y-6">

              {/* Section 1: Contact */}
              <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-primary/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary tracking-tight">İletişim Bilgileri</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Sipariş güncellemeleri için</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[11px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-widest">E-posta Adresi</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="ornek@email.com"
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-primary/10 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold placeholder:text-gray-300"
                      />
                      <div className="absolute inset-y-0 right-5 flex items-center">
                        <Mail className="h-5 w-5 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={receiveUpdates}
                        onChange={(e) => setReceiveUpdates(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-6 h-6 border-2 border-gray-100 rounded-lg group-hover:border-primary/30 transition-all peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center shadow-sm">
                        {receiveUpdates && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 font-bold select-none">Kampanyalardan haberdar olmak istiyorum</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Shipping Info */}
              <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-primary/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary tracking-tight">Teslimat Adresi</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ürününüzün gönderileceği yer</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest">Ad</label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-primary/10 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest">Soyad</label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-primary/10 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2 group">
                    <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest">Açık Adres</label>
                    <textarea
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      rows={3}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-primary/10 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold resize-none"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest">Şehir</label>
                    <div className="relative">
                      <select
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-primary/10 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value="">Seçiniz</option>
                        {TURKISH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-black text-gray-400 ml-1 uppercase tracking-widest">Telefon</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        placeholder="0 5xx xxx xx xx"
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-primary/10 focus:border-primary/20 rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                      />
                      <Phone className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Shipping Method */}
              <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-primary/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary tracking-tight">Kargo Yöntemi</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Tercih ettiğiniz teslimat seçeneği</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {shippingRates.length > 0 ? (
                    shippingRates.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer group",
                          selectedShippingMethod === method.id
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-lg shadow-primary/5"
                            : "border-gray-50 hover:border-primary/20 hover:bg-gray-50/50"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShippingMethod === method.id}
                            onChange={() => setSelectedShippingMethod(method.id)}
                            className="peer sr-only"
                          />
                          <div className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                            selectedShippingMethod === method.id ? "border-primary bg-primary shadow-inner" : "border-gray-200 group-hover:border-primary/30"
                          )}>
                            {selectedShippingMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <p className="font-black text-primary text-sm uppercase tracking-tight">{method.name}</p>
                            {method.condition && <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{method.condition}</p>}
                          </div>
                        </div>
                        <span className="font-black text-primary text-lg">
                          {method.price === 0 ? "Ücretsiz" : formatPrice(method.price)}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 font-bold text-gray-400">
                      Bu bölge için kargo yöntemi yükleniyor...
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Payment Method */}
              <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-primary/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary tracking-tight">Ödeme Yöntemi</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Güvenli ödeme altyapısı</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {paymentGateways.map((gateway) => (
                    <div key={gateway.id} className="space-y-4">
                      <label
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer group",
                          selectedPaymentMethod === gateway.id
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-lg shadow-primary/5"
                            : "border-gray-50 hover:border-primary/20 hover:bg-gray-50/50"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <input
                            type="radio"
                            name="payment"
                            checked={selectedPaymentMethod === gateway.id}
                            onChange={() => setSelectedPaymentMethod(gateway.id)}
                            className="peer sr-only"
                          />
                          <div className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                            selectedPaymentMethod === gateway.id ? "border-primary bg-primary shadow-inner" : "border-gray-200 group-hover:border-primary/30"
                          )}>
                            {selectedPaymentMethod === gateway.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{gateway.icon}</span>
                            <div>
                              <p className="font-black text-primary text-sm uppercase tracking-tight">{gateway.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{gateway.description}</p>
                            </div>
                          </div>
                        </div>
                      </label>

                      <AnimatePresence>
                        {selectedPaymentMethod === gateway.id && gateway.gateway === "bank_transfer" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 rounded-2xl p-6 border border-primary/10 overflow-hidden shadow-inner"
                          >
                            <div className="space-y-5">
                              <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 border-b border-primary/10 pb-3">
                                <Building2 className="h-4 w-4" />
                                Banka Bilgileri
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                <div className="flex justify-between items-center px-4 py-2 bg-white rounded-xl border border-gray-100">
                                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Banka</span>
                                  <span className="font-black text-primary">{gateway.bankAccount.bankName}</span>
                                </div>
                                <div className="flex flex-col gap-2 p-5 bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">IBAN Numarası</span>
                                  <span className="font-mono font-black text-lg break-all selection:bg-white selection:text-primary">{gateway.bankAccount.iban}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-2 bg-white rounded-xl border border-gray-100">
                                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Alıcı</span>
                                  <span className="font-black text-primary text-right uppercase">{gateway.bankAccount.accountHolder}</span>
                                </div>
                              </div>
                              <div className="p-4 bg-primary/5 text-primary text-[11px] font-bold rounded-xl leading-relaxed flex gap-4 items-start border border-primary/10">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Package className="h-4 w-4 text-white" />
                                </div>
                                <span>Ödeme açıklama kısmına <b>sipariş numaranızı</b> yazmayı unutmayınız. Siparişiniz ödeme onayı sonrası hazırlanacaktır.</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {selectedPaymentMethod === gateway.id && gateway.gateway !== "bank_transfer" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-primary/5 rounded-2xl p-6 border border-primary/10 overflow-hidden shadow-inner"
                          >
                            <div className="space-y-6">
                              <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-3">
                                <CreditCard className="h-4 w-4" />
                                Kart Bilgileri
                              </div>
                              <div className="space-y-5">
                                <div className="space-y-2 group">
                                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Kart Üzerindeki İsim</label>
                                  <input type="text" placeholder="AD SOYAD" className="w-full px-5 py-3.5 bg-white border-2 border-primary/10 focus:border-primary/20 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all font-black placeholder:text-gray-200 uppercase tracking-widest" />
                                </div>
                                <div className="space-y-2 group">
                                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Kart Numarası</label>
                                  <div className="relative">
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-5 py-3.5 bg-white border-2 border-primary/10 focus:border-primary/20 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all font-mono font-bold placeholder:text-gray-200" />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2">
                                      <div className="w-8 h-5 bg-gray-100 rounded-md"></div>
                                      <div className="w-8 h-5 bg-gray-200 rounded-md"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                  <div className="space-y-2 group">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">S. Kullanma</label>
                                    <input type="text" placeholder="AA/YY" className="w-full px-5 py-3.5 bg-white border-2 border-primary/10 focus:border-primary/20 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all font-bold placeholder:text-gray-200" />
                                  </div>
                                  <div className="space-y-2 group">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">CVV / Güvenlik</label>
                                    <input type="text" placeholder="000" className="w-full px-5 py-3.5 bg-white border-2 border-primary/10 focus:border-primary/20 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all font-bold placeholder:text-gray-200" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Complete Action - Only for Mobile to be visible early */}
              <div className="lg:hidden space-y-4">
                <button
                  onClick={handleCompleteOrder}
                  disabled={isSubmitting}
                  className="w-full py-6 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-lg hover:bg-primary/95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                  {isSubmitting ? "İşleniyor..." : "Siparişi Onayla"}
                </button>
                <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-wider">
                  KVKK ve Satış Sözleşmesini onaylayarak ödeme yapmaktasınız.
                </p>
              </div>

            </div>

            {/* Right Column - Premium Order Summary Sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(123,17,19,0.1)] border border-primary/5 overflow-hidden">
                <div className="bg-primary p-8 text-white relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight mb-1 uppercase">Sipariş Özeti</h2>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{getTotalItems()} Ürün Seçildi</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-white"
                      >
                        <path d="M16 8V6a2 2 0 0 0-2-2H9.5a2 2 0 0 0-2 2v2" />
                        <path d="M7 8h10" />
                        <path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
                        <path d="M9.5 13a2.5 2.5 0 0 1 5 0" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Items list */}
                  <div className="space-y-6 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-5 group">
                        <div className="w-16 h-16 bg-[#FFF5F5] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transform group-hover:rotate-12 transition-all duration-500 border border-primary/5 shadow-inner">
                          {item.product.category === "fistik-ezmesi" && "🥜"}
                          {item.product.category === "findik-ezmesi" && "🌰"}
                          {item.product.category === "kuruyemis" && "🥔"}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="font-black text-primary text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                          <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-tighter">
                            {item.variant.name} • {item.quantity} Adet
                          </p>
                          <div className="mt-1 font-black text-primary/80 text-sm">
                            {formatPrice(item.variant.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Details */}
                  <div className="space-y-4 pt-8 border-t border-primary/5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-black text-[11px] uppercase tracking-widest">Ara Toplam</span>
                      <span className="font-black text-primary text-base">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-black text-[11px] uppercase tracking-widest">Kargo Bedeli</span>
                      <span className={cn(
                        "font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-widest",
                        shipping === 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                      </span>
                    </div>
                    {subtotal < SHIPPING_THRESHOLD && (
                      <div className="p-5 bg-primary/5 rounded-[1.5rem] border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
                          <Truck className="h-10 w-10 text-primary" />
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Kargo Fırsatı ✨</p>
                        <p className="text-[11px] text-primary/80 font-bold leading-relaxed pr-8">
                          Bedava kargo için sepetinize <b>{formatPrice(SHIPPING_THRESHOLD - subtotal)}</b> daha ekleyin!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Final Total */}
                  <div className="pt-8 mt-2 border-t-4 border-primary/5 border-dashed">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Toplam Ödenecek</p>
                        <p className="text-5xl font-black text-primary tracking-tighter">
                          {formatPrice(total)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center animate-bounce">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Completion Button - Desktop */}
                    <button
                      onClick={handleCompleteOrder}
                      disabled={isSubmitting}
                      className="hidden lg:flex w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-base hover:bg-primary/95 transition-all shadow-2xl shadow-primary/20 items-center justify-center gap-3 active:scale-[0.98] group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Lock className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                      )}
                      {isSubmitting ? "İşleniyor..." : "Siparişi Tamamla"}
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                      <img src="/images/payments/visa.svg" alt="Visa" className="h-3 w-auto" />
                      <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-5 w-auto" />
                      <img src="/images/payments/troy.svg" alt="Troy" className="h-2.5 w-auto" />
                    </div>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="bg-gray-50/50 py-4 px-8 border-t border-primary/5 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-primary/5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">256-Bit SSL Sertifikalı Güvenli Alışveriş</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
