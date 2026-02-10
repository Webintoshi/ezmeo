
import { createServerClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
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
    MapPin,
    CreditCard,
    ChevronRight,
    ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { OrderStatus, PaymentStatus } from "@/types/order";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = createServerClient();

    // Fetch order, items, and settings in parallel
    const [orderResponse, itemsResponse, settingsResponse] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).single(),
        supabase.from("order_items").select("*, product:products(images, category)").eq("order_id", id),
        supabase.from("settings").select("value").eq("key", "payment_gateways").single()
    ]);

    const order = orderResponse.data;
    const items = itemsResponse.data || [];
    const paymentGateways = settingsResponse.data?.value || [];

    if (orderResponse.error || !order) {
        console.error("Error fetching admin order:", orderResponse.error);
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
                <p className="text-gray-500 mb-6">Aradığınız sipariş veritabanında mevcut değil.</p>
                <Link
                    href="/admin/siparisler"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Sipariş Listesine Dön
                </Link>
            </div>
        );
    }

    // Determine Payment Method Name
    const gatewayConfig = paymentGateways.find((g: any) => g.id === order.payment_method);
    const paymentMethodName = gatewayConfig ? gatewayConfig.name : (
        order.payment_method === 'cod' ? 'Kapıda Ödeme' :
            order.payment_method === 'bank_transfer' ? 'Havale / EFT' : 'Kredi Kartı'
    );

    const getStatusBadge = (status: OrderStatus) => {
        const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
            pending: { label: "Beklemede", color: "bg-yellow-50 text-yellow-700 border-yellow-100", icon: Clock },
            confirmed: { label: "Onaylandı", color: "bg-blue-50 text-blue-700 border-blue-100", icon: CheckCircle },
            preparing: { label: "Hazırlanıyor", color: "bg-purple-50 text-purple-700 border-purple-100", icon: Package },
            shipped: { label: "Kargolandı", color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: Truck },
            delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700 border-green-100", icon: CheckCircle },
            cancelled: { label: "İptal", color: "bg-red-50 text-red-700 border-red-100", icon: XCircle },
            refunded: { label: "İade", color: "bg-orange-50 text-orange-700 border-orange-100", icon: ArrowLeft },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Top Navigation & Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/siparisler"
                        className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">#{order.order_number}</h1>
                            {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {new Date(order.created_at).toLocaleDateString("tr-TR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-10 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Yazdır
                    </button>
                    <button className="h-10 px-4 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-red-800 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Fatura Kes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Items & Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Order Details Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                Sipariş İçeriği
                            </h2>
                            <span className="text-sm font-bold text-gray-400">{items.length} Ürün</span>
                        </div>
                        <div className="p-8">
                            <div className="divide-y divide-gray-50">
                                {items.map((item: any) => (
                                    <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl border border-gray-100 shrink-0">
                                            {item.product?.category === "fistik-ezmesi" ? "🥜" :
                                                item.product?.category === "findik-ezmesi" ? "🌰" : "🥔"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 mb-1">{item.product_name}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{item.variant_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">{formatPrice(item.price)}</div>
                                            <div className="text-xs font-bold text-gray-400">x{item.quantity}</div>
                                        </div>
                                        <div className="text-right w-24">
                                            <div className="font-black text-gray-900 text-lg">
                                                {formatPrice(item.total)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary In-Card */}
                            <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Ara Toplam</span>
                                    <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Kargo</span>
                                    <span className="text-gray-900">{order.shipping_cost === 0 ? "Ücretsiz" : formatPrice(order.shipping_cost)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-emerald-500 font-medium">
                                        <span>İndirim</span>
                                        <span>-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                                    <span className="text-gray-900 font-black text-lg">Genel Toplam</span>
                                    <span className="text-primary font-black text-2xl">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Notes */}
                    {order.notes && (
                        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
                            <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Müşteri Notu
                            </h2>
                            <p className="text-amber-800 leading-relaxed font-medium">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Address & Payment */}
                <div className="space-y-8">

                    {/* Shipping Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Teslimat Bilgileri
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Müşteri</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Adres</p>
                                <p className="text-gray-600 font-medium leading-relaxed">
                                    {order.shipping_address?.address}
                                </p>
                                <p className="text-gray-900 font-bold">
                                    {order.shipping_address?.city} / {order.shipping_address?.country}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">İletişim</p>
                                <p className="text-gray-900 font-bold">{order.shipping_address?.phone}</p>
                                <p className="text-gray-500 text-sm">{order.shipping_address?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            Ödeme Bilgileri
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ödeme Yöntemi</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
                                        {order.payment_method === 'cod' ? '🚚' : order.payment_method === 'bank_transfer' ? '🏦' : '💳'}
                                    </div>
                                    <span className="font-black text-gray-900">{paymentMethodName}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ödeme Durumu</p>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${order.payment_status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                        order.payment_status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${order.payment_status === 'completed' ? 'bg-emerald-500' :
                                            order.payment_status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                                        }`} />
                                    {order.payment_status === 'completed' ? 'Tamamlandı' :
                                        order.payment_status === 'pending' ? 'Beklemede' :
                                            order.payment_status === 'failed' ? 'Hata' : 'İşleniyor'}
                                </div>
                            </div>
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
    );
}
