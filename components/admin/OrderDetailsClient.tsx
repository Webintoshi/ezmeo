
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Truck,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Download,
    Printer,
    CreditCard,
    User,
    MapPin,
    Phone,
    Mail
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Re-using types or defining pertinent ones if imports are messy
// But locally defining interface for props is safest for now to match exactly what we pass
interface OrderDetailsClientProps {
    order: any; // We'll pass the full database order object
    config: {
        paymentGateways: any[];
    };
}

export default function OrderDetailsClient({ order, config }: OrderDetailsClientProps) {
    const router = useRouter();
    const [updating, setUpdating] = useState(false);

    // Helper handling
    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch("/api/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: order.id, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed");

            router.refresh();
            toast.success("Sipariş durumu güncellendi.");
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Güncelleme başarısız oldu.");
        } finally {
            setUpdating(false);
        }
    };

    const handlePaymentStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch("/api/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: order.id, paymentStatus: newStatus }),
            });

            if (!res.ok) throw new Error("Failed");

            router.refresh();
            toast.success("Ödeme durumu güncellendi.");
        } catch (error) {
            console.error("Failed to update payment status:", error);
            toast.error("Güncelleme başarısız oldu.");
        } finally {
            setUpdating(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(price || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Intl.DateTimeFormat("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateString));
    };


    // --- Resolve Status Badge ---
    const getStatusBadge = (status: string) => {
        const statusConfig: any = {
            pending: { label: "Beklemede", color: "bg-yellow-50 text-yellow-700", icon: Clock },
            confirmed: { label: "Onaylandı", color: "bg-blue-50 text-blue-700", icon: CheckCircle },
            preparing: { label: "Hazırlanıyor", color: "bg-purple-50 text-purple-700", icon: Package },
            shipped: { label: "Kargolandı", color: "bg-indigo-50 text-indigo-700", icon: Truck },
            delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700", icon: CheckCircle },
            cancelled: { label: "İptal", color: "bg-red-50 text-red-700", icon: XCircle },
            refunded: { label: "İade", color: "bg-orange-50 text-orange-700", icon: ArrowLeft },
        };

        // Default fallback
        const config = statusConfig[status] || { label: status, color: "bg-gray-100", icon: Clock };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    // --- Resolve Payment Method Name ---
    const getPaymentMethodName = (methodId: string) => {
        if (!methodId) return "Belirsiz";

        const gateway = config.paymentGateways.find((g: any) => g.id === methodId);
        if (gateway) return gateway.name;

        // Fallbacks
        if (methodId === 'cod') return 'Kapıda Ödeme';
        if (methodId === 'bank_transfer') return 'Havale / EFT';
        if (methodId === 'credit_card') return 'Kredi Kartı';

        return methodId; // Show ID if unknown
    };

    const shippingInfo = order.shipping_address || {};

    return (
        <div className="space-y-6 pb-20">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/siparisler"
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-gray-900 bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{order.order_number}</h1>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium">
                        <Printer className="w-4 h-4" />
                        Yazdır
                    </button>
                    {/* 
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium">
            <Download className="w-4 h-4" />
            PDF
          </button>
          */}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column (Main Details) */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-gray-400" />
                            Sipariş Yönetimi
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sipariş Durumu</label>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updating}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                >
                                    <option value="pending">Beklemede</option>
                                    <option value="confirmed">Onaylandı</option>
                                    <option value="preparing">Hazırlanıyor</option>
                                    <option value="shipped">Kargolandı</option>
                                    <option value="delivered">Teslim Edildi</option>
                                    <option value="cancelled">İptal</option>
                                    <option value="refunded">İade</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Durumu</label>
                                <select
                                    value={order.payment_status}
                                    onChange={(e) => handlePaymentStatusChange(e.target.value)}
                                    disabled={updating}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                >
                                    <option value="pending">Beklemede</option>
                                    <option value="processing">İşleniyor</option>
                                    <option value="completed">Tamamlandı</option>
                                    <option value="failed">Başarısız</option>
                                    <option value="refunded">İade Edildi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-400" />
                                Ürünler ({order.items?.length || 0})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl border border-gray-200 shrink-0">
                                        {item.product?.category === 'fistik-ezmesi' ? '🥜' :
                                            item.product?.category === 'findik-ezmesi' ? '🌰' : '📦'}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                                        <p className="text-sm text-gray-500">{item.variant_name}</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Adet</p>
                                            <p className="font-semibold text-gray-900">{item.quantity}</p>
                                        </div>
                                        <div className="text-right w-24">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Tutar</p>
                                            <p className="font-bold text-gray-900 text-lg">{formatPrice(item.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Notes */}
                    {order.notes && (
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-6 flex gap-4">
                            <FileText className="w-6 h-6 text-amber-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 mb-1">Müşteri Notu</h3>
                                <p className="text-amber-800 leading-relaxed text-sm">
                                    {order.notes}
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column (Info Sidebar) */}
                <div className="space-y-6">

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            Müşteri Bilgileri
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                    {shippingInfo.firstName?.[0]}{shippingInfo.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                                    <p className="text-sm text-gray-500">Müşteri</p>
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 my-2" />
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {/* We might not have email in shipping_address, usually it's on order level or customer level. 
                                Checking order structure.. if customer_id exists we could fetch, but let's see if shipping address has phone/email usually.*/}
                                    <span className="truncate">{/* Email field if available */}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{shippingInfo.phone || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Teslimat Adresi
                        </h2>
                        <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                            <p className="font-medium text-gray-900">{shippingInfo.address}</p>
                            <p>{shippingInfo.district} / {shippingInfo.city}</p>
                            <p>{shippingInfo.country}</p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            Ödeme Özeti
                        </h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ödeme Yöntemi</span>
                                <span className="font-medium text-gray-900">{getPaymentMethodName(order.payment_method)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ara Toplam</span>
                                <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Kargo</span>
                                <span className="font-medium text-gray-900">{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Ücretsiz'}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>İndirim</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Toplam</span>
                            <span className="font-bold text-2xl text-primary">{formatPrice(order.total)}</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

function Calendar(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
