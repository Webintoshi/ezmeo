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
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, total, getTotalItems, clearCart } = useCart();

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
    saveInfo: false,
  });

  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // Step Control for smooth UX (1: Contact/Shipping, 2: Payment)
  // Actually, keeping it single page scrolling is better for overview but using visual hierarchy

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopyalandı: " + text);
  };

  // Modern Icon Renderer
  const renderGatewayIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return <Building2 className="h-5 w-5" />;
      case 'cod': return <Truck className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center bg-white/80 backdrop-blur-xl rounded-[2rem] p-12 shadow-2xl shadow-black/5 border border-white/50"
        >
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">Sepetiniz Boş</h1>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">Lezzetli ürünlerimize göz atmak için mağazaya dönebilirsiniz.</p>
          <Link
            href="/urunler"
            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 w-full text-lg active:scale-[0.98]"
          >
            Alışverişe Başla
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] selection:bg-primary/20 text-gray-900 pb-20 pt-8 lg:pt-12">
      <main className="container mx-auto px-4 lg:px-8 max-w-[1400px]">

        {/* Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3 uppercase tracking-widest">
            <span className="text-primary">Sepet</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Ödeme</span>
            <ChevronRight className="h-4 w-4" />
            <span>Onay</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">Güvenli Ödeme</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* Main Content - Left Column */}
          <div className="lg:col-span-7 space-y-10">

            {/* Section 1: Account & Shipping */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-900/20">1</span>
                İletişim & Teslimat
              </h2>

              <div className="glass-card rounded-[2rem] p-8 space-y-8 bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm">
                {/* Contact Email */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">İletişim</h3>
                  <div className="grid gap-4">
                    <div className="relative group">
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="apple-input bg-gray-50/50 border-transparent focus:bg-white h-14 pl-12 font-medium text-lg"
                        placeholder="E-posta Adresi"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group select-none pl-1">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={receiveUpdates}
                          onChange={(e) => setReceiveUpdates(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Kampanya ve indirimlerden haberdar olmak istiyorum</span>
                    </label>
                  </div>
                </div>

                <div className="w-full h-px bg-gray-100" />

                {/* Shipping Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Teslimat Adresi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        className="apple-input bg-gray-50/50 border-transparent focus:bg-white h-14 font-medium"
                        placeholder="Ad"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        className="apple-input bg-gray-50/50 border-transparent focus:bg-white h-14 font-medium"
                        placeholder="Soyad"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <textarea
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        rows={3}
                        className="apple-input bg-gray-50/50 border-transparent focus:bg-white font-medium resize-none min-h-[120px]"
                        placeholder="Adres (Mahalle, Sokak, Kapı No...)"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="relative group">
                        <select
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          className="apple-input bg-gray-50/50 border-transparent focus:bg-white h-14 font-medium appearance-none cursor-pointer"
                        >
                          <option value="">Şehir Seçiniz</option>
                          {TURKISH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="relative group">
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          placeholder="Telefon (0 5xx...)"
                          className="apple-input bg-gray-50/50 border-transparent focus:bg-white h-14 font-medium"
                        />
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Delivery Method */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-900/20">2</span>
                Teslimat Yöntemi
              </h2>

              <div className="glass-card rounded-[2rem] p-8 bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm">
                {subtotal >= SHIPPING_THRESHOLD ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-1 shadow-lg shadow-emerald-500/20"
                  >
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                        <Truck className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">Ücretsiz Kargo Kazandınız! 🎉</h3>
                        <p className="text-gray-600 font-medium">Siparişiniz adresinize ücretsiz teslim edilecektir.</p>
                      </div>
                      <div className="hidden sm:block">
                        <span className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm tracking-wide uppercase">
                          Ücretsiz
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {shippingRates.length > 0 ? shippingRates.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all premium-card-hover group",
                          selectedShippingMethod === method.id
                            ? "border-primary bg-white shadow-xl shadow-primary/5 ring-4 ring-primary/5"
                            : "border-transparent bg-white/50 hover:bg-white hover:border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            selectedShippingMethod === method.id ? "border-primary bg-primary" : "border-gray-300 group-hover:border-primary/50"
                          )}>
                            <div className="w-2 h-2 bg-white rounded-full scale-0 transition-transform duration-200" style={{ transform: selectedShippingMethod === method.id ? 'scale(1)' : 'scale(0)' }} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{method.name}</p>
                            {method.condition && <p className="text-sm font-medium text-gray-500 mt-0.5">{method.condition}</p>}
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">{formatPrice(method.price)}</span>
                      </label>
                    )) : (
                      <div className="text-center py-10">
                        <Loader2 className="h-8 w-8 text-gray-300 animate-spin mx-auto mb-2" />
                        <p className="text-gray-400 font-medium">Teslimat seçenekleri yükleniyor...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Payment */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-900/20">3</span>
                Ödeme Yöntemi
              </h2>

              <div className="glass-card rounded-[2rem] p-8 bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm relative overflow-hidden">
                {isLoadingGateways ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/50 rounded-2xl animate-pulse" />)}
                  </div>
                ) : paymentGateways.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Ödeme Yöntemi Bulunamadı</h3>
                    <p className="text-gray-500">Lütfen daha sonra tekrar deneyiniz.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id} className="group relative">
                        <label
                          className={cn(
                            "flex items-center gap-5 p-6 rounded-2xl border-2 cursor-pointer transition-all premium-card-hover",
                            selectedPaymentMethod === gateway.id
                              ? "border-primary bg-white shadow-xl shadow-primary/5 ring-4 ring-primary/5 z-10 relative"
                              : "border-transparent bg-white/50 hover:bg-white hover:border-gray-200"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                            selectedPaymentMethod === gateway.id ? "border-primary bg-primary" : "border-gray-300 group-hover:border-primary/50"
                          )}>
                            <div className="w-2 h-2 bg-white rounded-full scale-0 transition-transform duration-200" style={{ transform: selectedPaymentMethod === gateway.id ? 'scale(1)' : 'scale(0)' }} />
                          </div>

                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-gray-600 transition-colors shrink-0",
                            selectedPaymentMethod === gateway.id ? "bg-primary/5 text-primary" : "bg-gray-100 group-hover:bg-white"
                          )}>
                            {renderGatewayIcon(gateway.gateway)}
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-lg">{gateway.name}</p>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">{gateway.description}</p>
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
                                <motion.div
                                  initial={{ y: -10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  className="mt-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 relative overflow-hidden"
                                >
                                  <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Building2 className="h-24 w-24" />
                                  </div>
                                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    Banka Hesap Bilgileri
                                  </h4>
                                  <div className="space-y-4 relative z-10">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Banka Adı</p>
                                        <p className="font-bold text-gray-900">{gateway.bankAccount.bankName}</p>
                                      </div>
                                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alıcı Adı</p>
                                        <p className="font-bold text-gray-900">{gateway.bankAccount.accountHolder}</p>
                                      </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-primary/10 group/iban relative overflow-hidden hover:border-primary/30 transition-colors cursor-pointer" onClick={() => copyToClipboard(gateway.bankAccount!.iban)}>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex justify-between">
                                        IBAN
                                        <span className="text-primary text-[10px] bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover/iban:opacity-100 transition-opacity">
                                          <Copy className="h-3 w-3" /> Kopyala
                                        </span>
                                      </p>
                                      <p className="font-mono font-bold text-lg text-gray-900 break-all">{gateway.bankAccount.iban}</p>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl text-sm border border-amber-100 text-amber-800">
                                      <AlertCircle className="h-5 w-5 shrink-0" />
                                      <p className="font-medium leading-relaxed">Siparişinizin onaylanması için ödeme açıklama kısmına <strong>sipariş numarasını</strong> yazmanız gerekmektedir.</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {(gateway.gateway === "paytr" || gateway.gateway === "iyzico" || gateway.gateway === "stripe") && (
                                <motion.div
                                  initial={{ y: -10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  className="mt-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col items-center text-center gap-4"
                                >
                                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Lock className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-lg">Güvenli Ödeme</h4>
                                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">Siparişi onayla butonuna tıkladıktan sonra 3D Secure güvenli ödeme ekranına yönlendirileceksiniz.</p>
                                  </div>
                                  <div className="flex gap-3 opacity-50 grayscale mt-2">
                                    <img src="/images/payments/visa.svg" alt="Visa" className="h-6" />
                                    <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-6" />
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Right Column - Summary - Sticky */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-8 space-y-6">

              {/* Summary Card */}
              <div className="glass-card rounded-[2.5rem] p-8 bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-black/5 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h2 className="text-2xl font-semibold text-gray-900 mb-8 relative z-10">Sipariş Özeti</h2>

                {/* Products */}
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-5 group">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                        {item.product.category === "fistik-ezmesi" && "🥜"}
                        {item.product.category === "findik-ezmesi" && "🌰"}
                        {item.product.category === "kuruyemis" && "🥔"}
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-gray-900 leading-tight">{item.product.name}</h3>
                          <span className="font-bold text-gray-900">{formatPrice(item.variant.price * item.quantity)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mt-1">{item.variant.name}</p>
                        <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 mt-2">
                          {item.quantity} Adet
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gray-100 my-8 relative z-10" />

                {/* Price Breakdown */}
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-gray-600 font-medium">
                    <span>Ara Toplam</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 font-medium">
                    <span>Kargo</span>
                    <span className={cn(shipping === 0 ? "text-emerald-600" : "text-gray-900")}>
                      {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                    </span>
                  </div>

                  {/* Shipping Progress */}
                  {subtotal < SHIPPING_THRESHOLD && (
                    <div className="py-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        <span>Ücretsiz Kargo İçin</span>
                        <span className="text-primary">{formatPrice(SHIPPING_THRESHOLD - subtotal)} kaldı</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(subtotal / SHIPPING_THRESHOLD) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between items-end">
                    <span className="text-lg font-medium text-gray-500">Toplam</span>
                    <span className="text-4xl font-bold text-gray-900 tracking-tighter">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Main Action */}
                <div className="mt-8 relative z-10">
                  <button
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:bg-red-800 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5" />
                          Siparişi Onayla
                        </>
                      )}
                    </span>
                    {/* Button Shimmer Effect */}
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                  </button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    256-Bit SSL ile Güvenli Ödeme
                  </div>
                </div>
              </div>

              {/* Secondary Info */}
              <div className="text-center px-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Siparişi onaylayarak <Link href="/sozlesmeler" className="text-gray-600 hover:text-primary transition-colors underline decoration-gray-300">Mesafeli Satış Sözleşmesi</Link> ve <Link href="/sozlesmeler" className="text-gray-600 hover:text-primary transition-colors underline decoration-gray-300">Ön Bilgilendirme Formu</Link>'nu okuduğunuzu ve kabul ettiğinizi onaylamış olursunuz.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
