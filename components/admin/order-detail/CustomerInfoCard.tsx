"use client";

import { User, Mail, Phone, Copy, ExternalLink, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface CustomerInfo {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface CustomerInfoCardProps {
  customer: CustomerInfo;
  customerOrders?: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  className?: string;
}

export function CustomerInfoCard({
  customer,
  customerOrders = [],
  className = "",
}: CustomerInfoCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Brief feedback could be added here
  };

  const customerName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Bilinmiyor";

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          Müşteri Bilgileri
        </h3>
      </div>

      <div className="p-8 space-y-6">
        {/* Customer Name */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Müşteri Adı
          </p>
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900 text-lg">{customerName}</p>
            {customer.id && (
              <Link
                href={`/admin/musteriler/${customer.id}`}
                className="text-sm text-primary hover:text-red-700 font-medium flex items-center gap-1"
              >
                Profili Gör
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Email */}
        {customer.email && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              E-posta
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-700 font-medium">{customer.email}</p>
              </div>
              <button
                onClick={() => copyToClipboard(customer.email!, "E-posta")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Kopyala"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <a
                href={`mailto:${customer.email}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="E-posta Gönder"
              >
                <Mail className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        {/* Phone */}
        {customer.phone && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Telefon
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-gray-700 font-medium">{customer.phone}</p>
              </div>
              <button
                onClick={() => copyToClipboard(customer.phone!, "Telefon")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Kopyala"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <a
                href={`tel:${customer.phone}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ara"
              >
                <Phone className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        {/* Stats */}
        {(customer.totalOrders !== undefined || customer.totalSpent !== undefined) && (
          <div className="pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              {customer.totalOrders !== undefined && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-bold text-gray-400">Toplam Sipariş</p>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{customer.totalOrders}</p>
                </div>
              )}
              {customer.totalSpent !== undefined && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 mb-1">Toplam Harcama</p>
                  <p className="text-2xl font-black text-primary">
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(customer.totalSpent)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {customerOrders && customerOrders.length > 0 && (
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Diğer Siparişler
              </p>
              {customer.id && (
                <Link
                  href={`/admin/musteriler/${customer.id}?tab=orders`}
                  className="text-xs font-bold text-primary hover:text-red-700"
                >
                  Tümünü Gör
                </Link>
              )}
            </div>

            <div className="space-y-2">
              {customerOrders.slice(0, 3).map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/siparisler/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                        minimumFractionDigits: 2,
                      }).format(order.total)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
