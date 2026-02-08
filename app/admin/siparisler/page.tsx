"use client";

import { useState } from "react";
import { getOrders, updateOrderStatus, updateOrderPaymentStatus } from "@/lib/orders";
import { Order, OrderStatus, PaymentStatus } from "@/types/order";
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Truck,
  XCircle,
  CheckCircle,
  Clock,
  Package,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "Tümü", color: "bg-gray-100 text-gray-700" },
    { value: "pending", label: "Beklemede", color: "bg-yellow-50 text-yellow-700" },
    { value: "confirmed", label: "Onaylandı", color: "bg-blue-50 text-blue-700" },
    { value: "preparing", label: "Hazırlanıyor", color: "bg-purple-50 text-purple-700" },
    { value: "shipped", label: "Kargolandı", color: "bg-indigo-50 text-indigo-700" },
    { value: "delivered", label: "Teslim Edildi", color: "bg-green-50 text-green-700" },
    { value: "cancelled", label: "İptal", color: "bg-red-50 text-red-700" },
    { value: "refunded", label: "İade", color: "bg-orange-50 text-orange-700" },
  ];

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "preparing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrders(getOrders());
  };

  const handlePaymentStatusChange = (orderId: string, newStatus: PaymentStatus) => {
    updateOrderPaymentStatus(orderId, newStatus);
    setOrders(getOrders());
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Sipariş numarası veya müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {order.orderNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(new Date(order.createdAt))}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      statusOptions.find((s) => s.value === order.status)?.color
                    }`}
                  >
                    {getStatusIcon(order.status)}
                    {statusOptions.find((s) => s.value === order.status)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} ürün
                    </div>
                  </div>
                  <Link
                    href={`/admin/siparisler/${order.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Detay
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </span>
                  <span>•</span>
                  <span>{order.shippingAddress.city}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Durum:</label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {statusOptions
                        .filter((s) => s.value !== "all")
                        .map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Not:</span> {order.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Arama kriterlerinize uygun sipariş bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
