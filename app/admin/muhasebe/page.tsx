"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  BadgeCheck,
  BanknoteArrowDown,
  FilePlus2,
  Loader2,
  ReceiptText,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import type { AccountingOverviewData } from "@/types/accounting";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value: string | null) {
  if (!value) return "Henüz senkron yapılmadı";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Bilinmiyor";
  return date.toLocaleString("tr-TR");
}

const EMPTY_OVERVIEW: AccountingOverviewData = {
  today: {
    invoiceCount: 0,
    syncedCount: 0,
    queuedCount: 0,
    invoicedAmount: 0,
  },
  openReceivables: {
    orderCount: 0,
    amount: 0,
    orders: [],
  },
  vatSummary: {
    rate: 20,
    taxBase: 0,
    taxAmount: 0,
    grossAmount: 0,
  },
  syncStatus: {
    activeConnections: 0,
    pendingQueue: 0,
    failedQueue: 0,
    lastSyncAt: null,
  },
};

export default function MuhasebePage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AccountingOverviewData>(EMPTY_OVERVIEW);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/accounting/overview", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Muhasebe verileri alinamadi.");
      }
      setOverview(result.overview as AccountingOverviewData);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Muhasebe verileri yuklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const createInvoiceQuickly = async () => {
    const orderId = window.prompt("Fatura kesmek istediginiz siparis ID degerini girin:");
    if (!orderId?.trim()) return;

    setBusyAction("create_invoice");
    try {
      const response = await fetch("/api/admin/accounting/invoices/create-from-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Fatura olusturma basarisiz.");
      }
      window.alert("Fatura adayi olusturuldu ve senkron tetiklendi.");
      await fetchOverview();
    } catch (actionError) {
      window.alert(actionError instanceof Error ? actionError.message : "Islem basarisiz.");
    } finally {
      setBusyAction(null);
    }
  };

  const runSync = async () => {
    setBusyAction("sync");
    try {
      const response = await fetch("/api/admin/accounting/sync/run", { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Senkronizasyon baslatilamadi.");
      }
      await fetchOverview();
    } catch (actionError) {
      window.alert(actionError instanceof Error ? actionError.message : "Senkronizasyon hatasi.");
    } finally {
      setBusyAction(null);
    }
  };

  const reconcilePayments = async () => {
    setBusyAction("reconcile");
    try {
      const response = await fetch("/api/admin/accounting/payments/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Tahsilat uzlastirma basarisiz.");
      }
      window.alert(`Tahsilat uzlastirma tamamlandi. Saglayici sayisi: ${result.result.totalProviders}`);
      await fetchOverview();
    } catch (actionError) {
      window.alert(actionError instanceof Error ? actionError.message : "Uzlastirma basarisiz.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Muhasebe</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fatura, tahsilat ve KDV takibini tek ekrandan yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
          <Link
            href="/admin/muhasebe/fatura-entegrasyonu"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <ReceiptText className="w-4 h-4" />
            Fatura Entegrasyonu
          </Link>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Bugün"
          subtitle={`${overview.today.invoiceCount} fatura adayi`}
          value={formatCurrency(overview.today.invoicedAmount)}
          icon={Wallet}
          loading={loading}
        />
        <StatCard
          title="Hızlı İşlemler"
          subtitle="4 ana işlem 3 tıkta"
          value={`${overview.syncStatus.activeConnections} sağlayıcı aktif`}
          icon={FilePlus2}
          loading={loading}
        />
        <StatCard
          title="Açık Tahsilatlar"
          subtitle={`${overview.openReceivables.orderCount} sipariş`}
          value={formatCurrency(overview.openReceivables.amount)}
          icon={BanknoteArrowDown}
          loading={loading}
        />
        <StatCard
          title="KDV Özeti"
          subtitle={`KDV oranı %${overview.vatSummary.rate}`}
          value={formatCurrency(overview.vatSummary.taxAmount)}
          icon={BadgeCheck}
          loading={loading}
        />
        <StatCard
          title="Senkron Durumu"
          subtitle={`${overview.syncStatus.pendingQueue} bekleyen, ${overview.syncStatus.failedQueue} hatalı`}
          value={formatDate(overview.syncStatus.lastSyncAt)}
          icon={RefreshCw}
          loading={loading}
          isDate
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <QuickActionButton
              title="Fatura Kes"
              description="Sipariş ID girerek faturayı hemen kuyrukla."
              icon={FilePlus2}
              loading={busyAction === "create_invoice"}
              onClick={createInvoiceQuickly}
            />
            <QuickActionButton
              title="Gider Ekle"
              description="Gider girişini entegrasyon ekranından yönet."
              icon={ReceiptText}
              href="/admin/muhasebe/fatura-entegrasyonu"
            />
            <QuickActionButton
              title="Tahsilat Kaydet"
              description="Sağlayıcılardan tahsilatları çek ve eşleştir."
              icon={BanknoteArrowDown}
              loading={busyAction === "reconcile"}
              onClick={reconcilePayments}
            />
            <QuickActionButton
              title="Müşteri Cari Aç"
              description="Müşteri hesabını açıp geçmiş siparişleri incele."
              icon={Users}
              href="/admin/musteriler"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Senkron Kontrol</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Aktif bağlantı: <span className="font-semibold text-gray-900">{overview.syncStatus.activeConnections}</span></p>
            <p>Bekleyen kuyruk: <span className="font-semibold text-gray-900">{overview.syncStatus.pendingQueue}</span></p>
            <p>Hatalı kuyruk: <span className="font-semibold text-gray-900">{overview.syncStatus.failedQueue}</span></p>
            <p>Son senkron: <span className="font-semibold text-gray-900">{formatDate(overview.syncStatus.lastSyncAt)}</span></p>
          </div>
          <button
            onClick={runSync}
            disabled={busyAction === "sync"}
            className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {busyAction === "sync" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Senkronu Çalıştır
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Açık Tahsilat Listesi</h2>
          <p className="text-xs text-gray-500">Ödemesi tamamlanmamış siparişler</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Sipariş</th>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Ödeme Durumu</th>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Tutar</th>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {overview.openReceivables.orders.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={4}>
                    Açık tahsilat bulunmuyor.
                  </td>
                </tr>
              )}
              {overview.openReceivables.orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    <Link className="text-blue-600 hover:underline" href={`/admin/siparisler/${order.id}`}>
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{order.paymentStatus}</td>
                  <td className="px-4 py-2 font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-2 text-gray-600">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  subtitle,
  value,
  icon: Icon,
  loading,
  isDate = false,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: ElementType;
  loading?: boolean;
  isDate?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      {loading ? (
        <div className="h-6 w-20 rounded bg-gray-100 animate-pulse" />
      ) : (
        <div className={`font-bold text-gray-900 ${isDate ? "text-sm" : "text-xl"}`}>{value}</div>
      )}
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function QuickActionButton({
  title,
  description,
  icon: Icon,
  loading,
  onClick,
  href,
}: {
  title: string;
  description: string;
  icon: ElementType;
  loading?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-gray-200 p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-left rounded-xl border border-gray-200 p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-70"
    >
      <div className="flex items-center gap-2 mb-1">
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-600" /> : <Icon className="w-4 h-4 text-gray-600" />}
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </button>
  );
}
