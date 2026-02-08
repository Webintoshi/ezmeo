"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { getOrderById, updateOrderStatus, updateOrderPaymentStatus } from "@/lib/orders";
import { Order, OrderStatus, PaymentStatus } from "@/types/order";
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
} from "lucide-react";
import Link from "next/link";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const order = getOrderById(resolvedParams.id);

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
        <p className="text-gray-500 mb-4">Aradığınız sipariş mevcut değil.</p>
        <Link
          href="/admin/siparisler"
          className="text-primary hover:underline"
        >
          Siparişlere Dön
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    router.refresh();
  };

  const handlePaymentStatusChange = (newStatus: PaymentStatus) => {
    updateOrderPaymentStatus(order.id, newStatus);
    router.refresh();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig: Record<
      OrderStatus,
      { label: string; color: string; icon: React.ElementType }
    > = {
      pending: { label: "Beklemede", color: "bg-yellow-50 text-yellow-700", icon: Clock },
      confirmed: { label: "Onaylandı", color: "bg-blue-50 text-blue-700", icon: CheckCircle },
      preparing: { label: "Hazırlanıyor", color: "bg-purple-50 text-purple-700", icon: Package },
      shipped: { label: "Kargolandı", color: "bg-indigo-50 text-indigo-700", icon: Truck },
      delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700", icon: CheckCircle },
      cancelled: { label: "İptal", color: "bg-red-50 text-red-700", icon: XCircle },
      refunded: { label: "İade", color: "bg-orange-50 text-orange-700", icon: ArrowLeft },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/siparisler"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">
              {formatDate(new Date(order.createdAt))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" />
            Yazdır
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sipariş Durumu
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ödeme Durumu
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) =>
                    handlePaymentStatusChange(e.target.value as PaymentStatus)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="pending">Beklemede</option>
                  <option value="processing">İşleniyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="failed">Başarısız</option>
                  <option value="refunded">İade Edildi</option>
                </select>
              </div>
            </div>

            {order.shippingInfo.trackingNumber && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Kargo Takip No: {order.shippingInfo.trackingNumber}
                  </span>
                </div>
                {order.shippingInfo.estimatedDelivery && (
                  <p className="text-sm text-blue-700 mt-1">
                    Tahmini Teslimat:{" "}
                    {formatDate(new Date(order.shippingInfo.estimatedDelivery))}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ürünler</h2>
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500">{item.variantName}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatPrice(item.price)}</div>
                    <div className="text-sm text-gray-500">x{item.quantity}</div>
                  </div>
                  <div className="text-right w-24">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(item.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Müşteri Notu
              </h2>
              <p className="text-yellow-800">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.shipping)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İndirim</span>
                  <span className="font-medium text-red-600">
                    -{formatPrice(order.discount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Toplam</span>
                <span className="font-bold text-xl text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Teslimat Adresi
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </p>
              <p className="text-gray-600">{order.shippingAddress.addressLine}</p>
              <p className="text-gray-600">
                {order.shippingAddress.district} / {order.shippingAddress.city}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ödeme Bilgileri
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Yöntemi</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === "credit-card"
                    ? "Kredi Kartı"
                    : order.paymentMethod === "bank-transfer"
                    ? "Havale"
                    : "Kapıda Ödeme"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Durumu</span>
                <span className={`font-medium ${
                  order.paymentStatus === "completed"
                    ? "text-green-600"
                    : order.paymentStatus === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}>
                  {order.paymentStatus === "completed"
                    ? "Ödendi"
                    : order.paymentStatus === "processing"
                    ? "İşleniyor"
                    : order.paymentStatus === "pending"
                    ? "Beklemede"
                    : order.paymentStatus === "failed"
                    ? "Başarısız"
                    : "İade"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
