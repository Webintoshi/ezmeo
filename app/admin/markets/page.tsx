"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  Save,
  ShieldCheck,
  ShoppingBag,
  Terminal,
  Unplug,
} from "lucide-react";
import type {
  MarketplaceIntegrationView,
  MarketplaceListingView,
  MarketplaceProvider,
  MarketplaceSyncLogView,
} from "@/types/marketplace";

type ProviderFormState = {
  credentials: Record<string, string>;
  fieldMappings: Record<string, string>;
  settings: Record<string, unknown>;
};

function createFormState(item: MarketplaceIntegrationView): ProviderFormState {
  const credentials: Record<string, string> = {};
  item.provider.credentialFields.forEach((field) => {
    credentials[field.key] = "";
  });

  const fieldMappings: Record<string, string> = {};
  item.provider.mappingFields.forEach((field) => {
    fieldMappings[field.key] = item.connection?.fieldMappings?.[field.key] || "";
  });

  return {
    credentials,
    fieldMappings,
    settings: item.connection?.settings || {},
  };
}

export default function MarketsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<MarketplaceIntegrationView[]>([]);
  const [forms, setForms] = useState<Record<string, ProviderFormState>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MarketplaceProvider | null>(null);
  const [logsByProvider, setLogsByProvider] = useState<Record<string, MarketplaceSyncLogView[]>>({});
  const [listingsByProvider, setListingsByProvider] = useState<Record<string, MarketplaceListingView[]>>({});

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/marketplace-integrations", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Pazaryeri entegrasyonlari alinamadi.");
      }

      const list = (result.integrations || []) as MarketplaceIntegrationView[];
      setIntegrations(list);
      setForms((current) => {
        const next = { ...current };
        for (const integration of list) {
          next[integration.provider.id] = next[integration.provider.id] || createFormState(integration);
        }
        return next;
      });

      if (list.length > 0) {
        setSelectedProvider((current) => current || list[0].provider.id);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Entegrasyonlar yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchIntegrations();
  }, [fetchIntegrations]);

  const sortedIntegrations = useMemo(
    () =>
      [...integrations].sort((a, b) => {
        const aActive = a.connection?.status === "active" ? 0 : a.connection?.status === "error" ? 1 : 2;
        const bActive = b.connection?.status === "active" ? 0 : b.connection?.status === "error" ? 1 : 2;
        return aActive - bActive;
      }),
    [integrations],
  );

  const totals = useMemo(
    () =>
      integrations.reduce(
        (acc, integration) => {
          acc.totalConnections += integration.connection ? 1 : 0;
          acc.activeConnections += integration.connection?.status === "active" ? 1 : 0;
          acc.totalQueue += integration.queueStats.queued;
          acc.totalListings += integration.listingStats.total;
          return acc;
        },
        {
          totalConnections: 0,
          activeConnections: 0,
          totalQueue: 0,
          totalListings: 0,
        },
      ),
    [integrations],
  );

  const updateCredential = (providerId: string, key: string, value: string) => {
    setForms((current) => ({
      ...current,
      [providerId]: {
        ...(current[providerId] || { credentials: {}, fieldMappings: {}, settings: {} }),
        credentials: {
          ...(current[providerId]?.credentials || {}),
          [key]: value,
        },
      },
    }));
  };

  const updateMapping = (providerId: string, key: string, value: string) => {
    setForms((current) => ({
      ...current,
      [providerId]: {
        ...(current[providerId] || { credentials: {}, fieldMappings: {}, settings: {} }),
        fieldMappings: {
          ...(current[providerId]?.fieldMappings || {}),
          [key]: value,
        },
      },
    }));
  };

  const loadLogs = useCallback(async (providerId: MarketplaceProvider) => {
    setBusyKey(`${providerId}:logs`);
    try {
      const response = await fetch(`/api/admin/marketplace-integrations/${providerId}/logs?limit=20`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Loglar alinamadi.");
      }
      setLogsByProvider((current) => ({
        ...current,
        [providerId]: (result.logs || []) as MarketplaceSyncLogView[],
      }));
    } catch (logError) {
      window.alert(logError instanceof Error ? logError.message : "Log yukleme hatasi.");
    } finally {
      setBusyKey(null);
    }
  }, []);

  const loadListings = useCallback(async (providerId: MarketplaceProvider) => {
    setBusyKey(`${providerId}:listings`);
    try {
      const response = await fetch(`/api/admin/marketplace-integrations/${providerId}/listings?limit=60`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Listingler alinamadi.");
      }
      setListingsByProvider((current) => ({
        ...current,
        [providerId]: (result.listings || []) as MarketplaceListingView[],
      }));
    } catch (listingError) {
      window.alert(listingError instanceof Error ? listingError.message : "Listing yukleme hatasi.");
    } finally {
      setBusyKey(null);
    }
  }, []);

  const connectProvider = async (providerId: MarketplaceProvider) => {
    const form = forms[providerId];
    if (!form) return;

    setBusyKey(`${providerId}:connect`);
    try {
      const response = await fetch(`/api/admin/marketplace-integrations/${providerId}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: form.credentials,
          fieldMappings: form.fieldMappings,
          settings: form.settings,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Baglanti kaydedilemedi.");
      }

      await fetchIntegrations();
      await Promise.all([loadListings(providerId), loadLogs(providerId)]);
      window.alert(result.testResult?.message || "Baglanti kaydedildi.");
    } catch (connectError) {
      window.alert(connectError instanceof Error ? connectError.message : "Baglanti hatasi.");
    } finally {
      setBusyKey(null);
    }
  };

  const testProvider = async (providerId: MarketplaceProvider) => {
    setBusyKey(`${providerId}:test`);
    try {
      const response = await fetch(`/api/admin/marketplace-integrations/${providerId}/test`, { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Baglanti testi basarisiz.");
      }
      window.alert(result.result?.message || "Baglanti testi basarili.");
      await fetchIntegrations();
      await loadLogs(providerId);
    } catch (testError) {
      window.alert(testError instanceof Error ? testError.message : "Test hatasi.");
    } finally {
      setBusyKey(null);
    }
  };

  const syncProvider = async (providerId: MarketplaceProvider) => {
    setBusyKey(`${providerId}:sync`);
    try {
      const response = await fetch(`/api/admin/marketplace-integrations/${providerId}/sync`, { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Senkronizasyon basarisiz.");
      }

      await fetchIntegrations();
      await Promise.all([loadListings(providerId), loadLogs(providerId)]);
      window.alert("Senkronizasyon tamamlandi.");
    } catch (syncError) {
      window.alert(syncError instanceof Error ? syncError.message : "Senkronizasyon hatasi.");
    } finally {
      setBusyKey(null);
    }
  };

  useEffect(() => {
    if (!selectedProvider) return;
    if (listingsByProvider[selectedProvider] && logsByProvider[selectedProvider]) return;

    void Promise.all([loadListings(selectedProvider), loadLogs(selectedProvider)]);
  }, [selectedProvider, listingsByProvider, logsByProvider, loadListings, loadLogs]);

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pazaryeri Entegrasyonlari</h1>
          <p className="text-sm text-gray-500 mt-1">
            Baglanti, healthcheck, listing esleme, kuyruk ve siparis import akislarini tek panelden yonetin.
          </p>
        </div>
        <button
          onClick={fetchIntegrations}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Listeyi Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Tanimli baglanti" value={totals.totalConnections} icon={Package} />
        <SummaryCard title="Aktif provider" value={totals.activeConnections} icon={CheckCircle2} />
        <SummaryCard title="Bekleyen kuyruk" value={totals.totalQueue} icon={RefreshCw} />
        <SummaryCard title="Listing map" value={totals.totalListings} icon={ShoppingBag} />
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {sortedIntegrations.map((integration) => {
          const providerId = integration.provider.id;
          const form = forms[providerId] || createFormState(integration);
          const isSelected = selectedProvider === providerId;
          const isConnected = integration.connection?.status === "active";
          const statusBadge = isConnected
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : integration.connection?.status === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-gray-100 text-gray-700 border-gray-200";

          return (
            <section
              key={providerId}
              className={`bg-white border rounded-xl shadow-sm p-4 space-y-4 ${
                isSelected ? "border-gray-900" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.provider.color} text-white flex items-center justify-center font-semibold`}>
                    {integration.provider.logo}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{integration.provider.name}</h2>
                    <p className="text-sm text-gray-500">{integration.provider.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <a className="text-xs text-blue-600 hover:underline" href={integration.provider.websiteUrl} target="_blank" rel="noreferrer">
                        Panel
                      </a>
                      {integration.provider.docsUrl && (
                        <a className="text-xs text-blue-600 hover:underline" href={integration.provider.docsUrl} target="_blank" rel="noreferrer">
                          API Docs
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProvider(providerId)}
                  className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadge}`}
                >
                  {isConnected ? "Bagli" : integration.connection?.status === "error" ? "Hatali" : "Bagli degil"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {integration.provider.capabilities.map((capability) => (
                  <span key={capability} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                    {capability}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <MiniInfoCard title="Bekleyen" value={integration.queueStats.queued} />
                <MiniInfoCard title="Hatali" value={integration.queueStats.failed} danger={integration.queueStats.failed > 0} />
                <MiniInfoCard title="Manual" value={integration.queueStats.manualActionRequired} danger={integration.queueStats.manualActionRequired > 0} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <MiniInfoCard title="Listing" value={integration.listingStats.total} />
                <MiniInfoCard title="Aktif" value={integration.listingStats.active} />
                <MiniInfoCard title="Hata" value={integration.listingStats.error} danger={integration.listingStats.error > 0} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integration.provider.credentialFields.map((field) => (
                  <label key={field.key} className="text-sm">
                    <span className="text-gray-600">
                      {field.label}
                      {field.required ? " *" : ""}
                    </span>
                    <input
                      type={field.type === "password" ? "password" : "text"}
                      value={form.credentials[field.key] || ""}
                      onChange={(event) => updateCredential(providerId, field.key, event.target.value)}
                      placeholder={field.placeholder || field.label}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                    />
                  </label>
                ))}
              </div>

              {integration.provider.mappingFields.length > 0 && (
                <div className="border border-gray-100 rounded-lg p-3 space-y-3">
                  <h3 className="font-medium text-gray-900 text-sm">Alan esleme ve operasyon ayarlari</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {integration.provider.mappingFields.map((field) => (
                      <label key={field.key} className="text-sm">
                        <span className="text-gray-600">{field.label}</span>
                        <input
                          value={form.fieldMappings[field.key] || ""}
                          onChange={(event) => updateMapping(providerId, field.key, event.target.value)}
                          placeholder={field.placeholder || "Opsiyonel"}
                          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-gray-100 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Webhook</span>
                  <span className="font-medium text-gray-900">{integration.provider.supportsWebhook ? "Destekli" : "Polling"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Son healthcheck</span>
                  <span className="font-medium text-gray-900">
                    {integration.connection?.lastHealthcheckAt
                      ? new Date(integration.connection.lastHealthcheckAt).toLocaleString("tr-TR")
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Son sync</span>
                  <span className="font-medium text-gray-900">
                    {integration.connection?.lastSyncAt ? new Date(integration.connection.lastSyncAt).toLocaleString("tr-TR") : "-"}
                  </span>
                </div>
                {integration.connection?.lastHealthcheckMessage && (
                  <p className="text-xs text-gray-500">{integration.connection.lastHealthcheckMessage}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ActionButton
                  icon={Save}
                  label="Baglan"
                  loading={busyKey === `${providerId}:connect`}
                  onClick={() => connectProvider(providerId)}
                />
                <ActionButton
                  icon={ShieldCheck}
                  label="Baglanti testi"
                  loading={busyKey === `${providerId}:test`}
                  onClick={() => testProvider(providerId)}
                />
                <ActionButton
                  icon={RefreshCw}
                  label="Sync calistir"
                  loading={busyKey === `${providerId}:sync`}
                  onClick={() => syncProvider(providerId)}
                />
                <ActionButton
                  icon={Package}
                  label="Listingler"
                  loading={busyKey === `${providerId}:listings`}
                  onClick={() => {
                    setSelectedProvider(providerId);
                    void loadListings(providerId);
                  }}
                  variant="secondary"
                />
                <ActionButton
                  icon={Terminal}
                  label="Loglar"
                  loading={busyKey === `${providerId}:logs`}
                  onClick={() => {
                    setSelectedProvider(providerId);
                    void loadLogs(providerId);
                  }}
                  variant="secondary"
                />
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Baglanti aktif
                  </>
                ) : (
                  <>
                    <Unplug className="w-4 h-4 text-gray-400" />
                    Baglanti kurulmadı
                  </>
                )}
                <span className="ml-auto inline-flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  {integration.provider.supportsWebhook ? "Webhook + poll fallback" : "Polling"}
                </span>
              </div>
            </section>
          );
        })}
      </div>

      {selectedProvider && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Listing eslemeleri</h3>
                <p className="text-xs text-gray-500">SKU, external listing ve son sync durumu</p>
              </div>
              <button
                onClick={() => void loadListings(selectedProvider)}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${busyKey === `${selectedProvider}:listings` ? "animate-spin" : ""}`} />
                Yenile
              </button>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Urun / varyant</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">External ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Fiyat / stok</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {(listingsByProvider[selectedProvider] || []).map((listing) => (
                    <tr key={`${listing.provider}-${listing.variantId}`} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{listing.productName}</div>
                        <div className="text-xs text-gray-500">{listing.variantName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{listing.sku || "-"}</div>
                        {listing.barcode && <div className="text-xs text-gray-500">Barkod: {listing.barcode}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{listing.externalListingId || "-"}</div>
                        {listing.externalSku && <div className="text-xs text-gray-500">SKU: {listing.externalSku}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {listing.price.toLocaleString("tr-TR")} TL / {listing.stock}
                        </div>
                        {(listing.lastSyncedPrice !== null || listing.lastSyncedStock !== null) && (
                          <div className="text-xs text-gray-500">
                            Son sync: {listing.lastSyncedPrice ?? "-"} TL / {listing.lastSyncedStock ?? "-"}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            listing.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : listing.status === "error"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {listing.status}
                        </span>
                        {listing.issue && <div className="mt-2 text-xs text-amber-700">{listing.issue}</div>}
                        {listing.lastError && <div className="mt-1 text-xs text-red-600">{listing.lastError}</div>}
                      </td>
                    </tr>
                  ))}
                  {(listingsByProvider[selectedProvider] || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        Listing verisi bulunamadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Son sync loglari</h3>
                <p className="text-xs text-gray-500">Queue, import ve webhook akislarinin son durumu</p>
              </div>
              <button
                onClick={() => void loadLogs(selectedProvider)}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${busyKey === `${selectedProvider}:logs` ? "animate-spin" : ""}`} />
                Yenile
              </button>
            </div>
            <div className="max-h-[540px] overflow-auto">
              {(logsByProvider[selectedProvider] || []).map((log) => (
                <div key={log.id} className="px-4 py-3 border-t border-gray-100 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900">{log.status}</span>
                    <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {log.direction} / {log.entityType}
                    {log.entityId ? ` / ${log.entityId}` : ""}
                  </div>
                  {log.errorMessage && <p className="mt-2 text-xs text-red-600">{log.errorMessage}</p>}
                </div>
              ))}
              {(logsByProvider[selectedProvider] || []).length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">Log verisi bulunamadi.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon }: { title: string; value: number; icon: ElementType }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-500">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  variant = "primary",
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "bg-gray-900 text-white hover:bg-gray-800"
      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}

function MiniInfoCard({ title, value, danger = false }: { title: string; value: number; danger?: boolean }) {
  return (
    <div className={`rounded-lg border px-2 py-2 ${danger ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
      <p className={`text-[11px] ${danger ? "text-red-600" : "text-gray-500"}`}>{title}</p>
      <p className={`text-sm font-semibold ${danger ? "text-red-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
