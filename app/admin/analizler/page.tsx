"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  MoreHorizontal,
  TrendingUp,
  CreditCard,
  Eye,
  MousePointerClick
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getKPIs,
  getPreviousPeriodKPIs,
  getTrendData,
  exportAnalyticsData,
  trackPageView,
} from "@/lib/analytics";
import { getAbandonedCartStats } from "@/lib/abandoned-carts";
import { TimeRange, AnalyticsStats } from "@/types/analytics";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeRange>("week");
  const [loading, setLoading] = useState(true);
  const [liveVisitors, setLiveVisitors] = useState(0);

  useEffect(() => {
    trackPageView("/admin/analizler");
    setTimeout(() => setLoading(false), 800);

    const fetchLiveCount = async () => {
      try {
        const res = await fetch('/api/analytics/heartbeat');
        const data = await res.json();
        setLiveVisitors(data.visitors || 0);
      } catch (err) {
        console.error("Failed to fetch live visitors");
      }
    };

    // Initial fetch for live visitors
    fetchLiveCount();

    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchLiveCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const { stats, trendData, abandonedCartStats } = useMemo(() => {
    const currentKPIs = getKPIs(selectedPeriod);
    const previousKPIs = getPreviousPeriodKPIs(selectedPeriod);

    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats: AnalyticsStats = {
      revenue: currentKPIs.revenue,
      orders: currentKPIs.orders,
      customers: currentKPIs.customers,
      conversionRate: currentKPIs.conversionRate,
      avgOrderValue: currentKPIs.avgOrderValue,
      revenueChange: calculateChange(currentKPIs.revenue, previousKPIs.revenue),
      ordersChange: calculateChange(currentKPIs.orders, previousKPIs.orders),
      customersChange: calculateChange(currentKPIs.customers, previousKPIs.customers),
      conversionChange: calculateChange(currentKPIs.conversionRate, previousKPIs.conversionRate),
    };

    const trendData = getTrendData(selectedPeriod);
    const abandonedCartStats = getAbandonedCartStats();

    return { stats, trendData, abandonedCartStats };
  }, [selectedPeriod]);

  const handleExport = (format: "json" | "csv") => {
    const data = exportAnalyticsData(selectedPeriod, format);
    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${selectedPeriod}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Genel Bakış</h1>
          <p className="text-sm text-gray-500 mt-1">Mağazanızın performans metrikleri ve büyüme verileri.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          {[
            { label: 'Bugün', value: 'today' },
            { label: 'Bu Hafta', value: 'week' },
            { label: 'Bu Ay', value: 'month' },
            { label: 'Yıl', value: 'year' },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as TimeRange)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${selectedPeriod === period.value
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Toplam Gelir"
          value={`₺${stats.revenue.toLocaleString('tr-TR')}`}
          change={stats.revenueChange}
          icon={DollarSign}
          trendData={trendData.map(d => d.revenue)}
        />
        <KpiCard
          title="Siparişler"
          value={stats.orders.toString()}
          change={stats.ordersChange}
          icon={ShoppingBag}
          trendData={trendData.map(d => d.orders)}
        />
        <KpiCard
          title="Aktif Müşteriler"
          value={stats.customers.toString()}
          change={stats.customersChange}
          icon={Users}
        />
        <KpiCard
          title="Dönüşüm Oranı"
          value={`%${stats.conversionRate}`}
          change={stats.conversionChange}
          icon={TrendingUp}
        />
      </div>

      {/* Main Charts & Secondary Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Gelir Analizi</h3>
              <p className="text-xs text-gray-500">Zaman içindeki brüt satış performansı</p>
            </div>
            <button onClick={() => handleExport('csv')} className="text-gray-400 hover:text-gray-900 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `₺${value}`}
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`₺${value}`, "Gelir"]}
                  labelStyle={{ display: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel: Live Stats & Abandoned Cart */}
        <div className="space-y-6">
          {/* Live Visitors */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Canlı Ziyaretçi</h3>
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{liveVisitors}</span>
              <span className="text-sm text-gray-500">kişi online</span>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Eye className="w-3 h-3" /> Ürün Görüntüleme
                </div>
                <div className="font-semibold text-gray-900">%64</div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <CreditCard className="w-3 h-3" /> Ödeme Sayfası
                </div>
                <div className="font-semibold text-gray-900">%12</div>
              </div>
            </div>
          </div>

          {/* Abandoned Cart Snapshot */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-900">Sepet Performansı</h3>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Detay</button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Kurtarma Oranı</span>
                  <span className="font-medium text-gray-900">{abandonedCartStats?.recoveryRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${abandonedCartStats?.recoveryRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Kayıp Ciro</p>
                  <p className="text-lg font-semibold text-red-600">
                    ₺{abandonedCartStats?.totalValue.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Kurtarılan Ciro</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₺{(abandonedCartStats?.totalValue * (abandonedCartStats?.recoveryRate / 100)).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon: Icon, trendData }: any) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>%{Math.abs(change)}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      {/* Tiny sparkline or visual indicator could go here */}
    </div>
  );
}
