"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getCustomerById, getCustomerOrders, updateCustomer, deleteCustomer } from "@/lib/customers";
import { Customer } from "@/types/customer";
import { Order } from "@/types/order";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  TrendingUp,
  User,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
} from "lucide-react";
import Link from "next/link";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [customer, setCustomer] = useState<Customer | undefined>(
    getCustomerById(resolvedParams.id)
  );
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const customerData = getCustomerById(resolvedParams.id);
    setCustomer(customerData);
    if (customerData) {
      setOrders(getCustomerOrders(customerData.id));
    }
  }, [resolvedParams.id]);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Müşteri Bulunamadı
        </h1>
        <p className="text-gray-500 mb-4">Aradığınız müşteri mevcut değil.</p>
        <Link
          href="/admin/musteriler"
          className="text-primary hover:underline"
        >
          Müşterilere Dön
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (
      confirm(
        `"${customer.firstName} ${customer.lastName}" müşterisini silmek istediğinizden emin misiniz?`
      )
    ) {
      deleteCustomer(customer.id);
      router.push("/admin/musteriler");
    }
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

  const getOrderStatusBadge = (status: Order["status"]) => {
    const statusConfig: Record<
      Order["status"],
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

  const defaultAddress = customer.addresses.find((addr) => addr.isDefault) || customer.addresses[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/musteriler"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-sm text-gray-500">
              {customer.email} • {customer.phone || "Telefon yok"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/musteriler/${customer.id}/duzenle`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Düzenle
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Geçmişi</h3>
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Henüz sipariş yok.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Link
                          href={`/admin/siparisler/${order.id}`}
                          className="font-medium text-gray-900 hover:text-primary"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {formatDate(new Date(order.createdAt))}
                        </div>
                      </div>
                      {getOrderStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        {order.items.length} ürün • {formatPrice(order.total)}
                      </div>
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        Detay →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {customer.notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Notlar</h3>
              <p className="text-yellow-800">{customer.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              İstatistikler
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Toplam Sipariş</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {customer.totalOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Toplam Harcama</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatPrice(customer.totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Ortalama Sipariş</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatPrice(customer.averageOrderValue)}
                </span>
              </div>
              {customer.lastOrderDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Son Sipariş</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(customer.lastOrderDate)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kayıt Tarihi</span>
                <span className="text-sm text-gray-900">
                  {formatDate(customer.registeredAt)}
                </span>
              </div>
            </div>
          </div>

          {defaultAddress && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Adres
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {defaultAddress.title}
                </p>
                <p className="text-gray-600">
                  {defaultAddress.addressLine}
                </p>
                <p className="text-gray-600">
                  {defaultAddress.district} / {defaultAddress.city}
                </p>
                {defaultAddress.postalCode && (
                  <p className="text-gray-600">
                    {defaultAddress.postalCode}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{customer.email}</span>
                </div>
                {defaultAddress.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{defaultAddress.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              {customer.tags?.length ? (
                customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">Etiket yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
