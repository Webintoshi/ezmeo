
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { Check, ChevronRight, Loader2, ShoppingBag, Truck, MapPin, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    id: string;
    product_name: string;
    variant_name: string;
    price: number;
    quantity: number;
    total: number;
    product?: {
        images: string[];
        category: string;
    };
}

interface Order {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    subtotal: number;
    shipping_cost: number;
    discount: number;
    total: number;
    shipping_address: any;
    payment_method: string;
}

export default function OrderSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Show success toast if "new=true" is presnet
    useEffect(() => {
        if (searchParams.get("new") === "true") {
            toast.success("Siparişiniz başarıyla oluşturuldu!");
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Fetch order
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("id", params.id)
                    .single();

                if (orderError) throw orderError;
                setOrder(orderData);

                // Fetch order items with product details
                const { data: itemsData, error: itemsError } = await supabase
                    .from("order_items")
                    .select(`
            *,
            product:products(images, category)
          `)
                    .eq("order_id", params.id);

                if (itemsError) throw itemsError;
                setOrderItems(itemsData || []);

            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Sipariş detayları yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
                <p className="text-gray-500 mb-8">Aradığınız sipariş mevcut değil veya erişim izniniz yok.</p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-white font-medium hover:bg-red-800 transition-colors"
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20 pt-8">
            <div className="container mx-auto max-w-[800px] px-4">

                {/* Success Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-lg shadow-emerald-100">
                        <Check className="h-10 w-10 stroke-[3]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        Siparişiniz Alındı! 🚀
                    </h1>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                        Teşekkür ederiz! Siparişiniz başarıyla oluşturuldu ve hazırlanmaya başlandı.
                    </p>
                </div>

                {/* Order Info Card */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                    {/* Header */}
                    <div className="bg-gray-50/50 p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Sipariş Numarası</p>
                            <p className="text-xl font-bold text-gray-900 font-mono">#{order.order_number}</p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {new Date(order.created_at).toLocaleDateString("tr-TR", {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 md:p-8">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                            Sipariş İçeriği
                        </h3>
                        <div className="space-y-6">
                            {orderItems.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 shrink-0">
                                        {/* Fallback emoji based on category logic simply */}
                                        {item.product?.category === "fistik-ezmesi" ? "🥜" :
                                            item.product?.category === "findik-ezmesi" ? "🌰" : "🥔"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{item.product_name}</h4>
                                        <p className="text-sm text-gray-500">{item.variant_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatPrice(item.total)}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} Adet</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-gray-100 my-8" />

                        {/* Totals */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Ara Toplam</span>
                                <span className="font-bold">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Kargo</span>
                                <span className="font-bold">{order.shipping_cost === 0 ? "Ücretsiz" : formatPrice(order.shipping_cost)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>İndirim</span>
                                    <span className="font-bold">-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-gray-900 text-xl font-bold pt-4 border-t border-gray-100 mt-4">
                                <span>Toplam Tutar</span>
                                <span className="text-primary">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping & Payment Info Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">

                    {/* Shipping Address */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            Teslimat Adresi
                        </h3>
                        <div className="text-gray-600 space-y-2 text-sm leading-relaxed">
                            <p className="font-medium text-gray-900 text-base">
                                {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                            </p>
                            <p>{order.shipping_address?.address}</p>
                            <p>
                                {order.shipping_address?.city} / {order.shipping_address?.country}
                            </p>
                            <p>{order.shipping_address?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            Ödeme Yöntemi
                        </h3>
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                {order.payment_method === 'bank_transfer' ? <tspan className="text-xl">🏦</tspan> :
                                    order.payment_method === 'cod' ? <tspan className="text-xl">🚚</tspan> : <tspan className="text-xl">💳</tspan>}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">
                                    {order.payment_method === 'bank_transfer' ? 'Havale / EFT' :
                                        order.payment_method === 'cod' ? 'Kapıda Ödeme' : 'Kredi Kartı'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {order.payment_method === 'bank_transfer' ? 'Ödeme bekleniyor' :
                                        order.payment_method === 'cod' ? 'Teslimatta ödenecek' : 'Ödeme alındı'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Actions */}
                <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                    <Link
                        href="/urunler"
                        className="inline-flex items-center gap-2 h-14 px-10 rounded-full bg-primary text-white font-bold text-lg hover:bg-red-800 transition-all hover:scale-105 shadow-xl shadow-primary/20"
                    >
                        Alışverişe Devam Et
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
