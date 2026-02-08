"use client";

import { useEffect, useState } from "react";
import { PRODUCTS } from "@/lib/products";
import { getOrders } from "@/lib/orders";
import { Package, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    const orders = getOrders();
    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const revenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
    const lowStock = PRODUCTS.filter((p) =>
      p.variants.some((v) => v.stock < 10)
    ).length;

    setStats({
      totalProducts: PRODUCTS.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      totalRevenue: revenue,
      lowStockProducts: lowStock,
    });
  }, []);

  const StatCard = ({
    title,
    value,
    trend,
    icon: Icon,
    trendUp,
  }: {
    title: string;
    value: string | number;
    trend?: string;
    icon: React.ElementType;
    trendUp?: boolean;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {trend && (
        <p
          className={`text-xs mt-1 flex items-center gap-1 ${
            trendUp ? "text-green-600" : "text-red-600"
          }`}
        >
          {trendUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trend}</span>
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa</h1>
        <div className="text-sm text-gray-500">
          Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard
          title="Toplam Ürün"
          value={stats.totalProducts}
          icon={Package}
          trend="geçen aya göre"
          trendUp
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats.totalOrders}
          icon={ShoppingCart}
          trend="geçen aya göre"
          trendUp
        />
        <StatCard
          title="Bekleyen Sipariş"
          value={stats.pendingOrders}
          icon={ShoppingCart}
          trendUp
        />
        <StatCard
          title="Toplam Satış"
          value={`₺${stats.totalRevenue.toLocaleString("tr-TR")}`}
          icon={TrendingUp}
          trend="geçen aya göre"
          trendUp
        />
        <StatCard
          title="Düşük Stok"
          value={stats.lowStockProducts}
          icon={Package}
          trendUp={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Son Siparişler
          </h3>
          <div className="space-y-4">
            {getOrders().slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {order.orderNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₺{order.total.toLocaleString("tr-TR")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Düşük Stoklu Ürünler
          </h3>
          <div className="space-y-4">
            {PRODUCTS.filter((p) =>
              p.variants.some((v) => v.stock < 10)
            )
              .slice(0, 5)
              .map((product) => {
                const lowStockVariant = product.variants.find((v) => v.stock < 10);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {lowStockVariant?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {lowStockVariant?.stock} adet
                      </div>
                    </div>
                  </div>
                );
              })}
            {stats.lowStockProducts === 0 && (
              <p className="text-center text-gray-500 py-8">
                Düşük stoklu ürün bulunmuyor.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Satış Grafiği
        </h3>
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          Grafik entegrasyonu için veri bekleniyor...
        </div>
      </div>
    </div>
  );
}
