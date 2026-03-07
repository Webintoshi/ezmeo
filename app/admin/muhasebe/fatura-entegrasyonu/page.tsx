"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PlugZap,
  RefreshCw,
  Save,
  ShieldCheck,
  Terminal,
  Unplug,
} from "lucide-react";
import type { AccountingIntegrationView } from "@/types/accounting";

type ProviderFormState = {
  credentials: Record<string, string>;
  fieldMappings: Record<string, string>;
  syncMode: "safe_hybrid";
};

function createFormState(item: AccountingIntegrationView): ProviderFormState {
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
    syncMode: "safe_hybrid",
  };
}

export default function AccountingIntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<AccountingIntegrationView[]>([]);
  const [forms, setForms] = useState<Record<string, ProviderFormState>>({});
  const [logsByProvider, setLogsByProvider] = useState<Record<string, Array<Record<string, unknown>>>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/accounting/integrations", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Entegrasyon listesi alinamadi.");
      }
      const list = (result.integrations || []) as AccountingIntegrationView[];
      setIntegrations(list);
      setForms((current) => {
        const next = { ...current };
        for (const integration of list) {
          if (!next[integration.provider.id]) {
            next[integration.provider.id] = createFormState(integration);
          }
        }
        return next;
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Entegrasyonlar yuklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const sortedIntegrations = useMemo(
    () =>
      [...integrations].sort((a, b) => {
        const aActive = a.connection?.status === "active" ? 0 : 1;
        const bActive = b.connection?.status === "active" ? 0 : 1;
        return aActive - bActive;
      }),
    [integrations],
  );

  const updateCredential = (providerId: string, key: string, value: string) => {
    setForms((current) => ({
      ...current,
      [providerId]: {
        ...(current[providerId] || { credentials: {}, fieldMappings: {}, syncMode: "safe_hybrid" }),
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
        ...(current[providerId] || { credentials: {}, fieldMappings: {}, syncMode: "safe_hybrid" }),
        fieldMappings: {
          ...(current[providerId]?.fieldMappings || {}),
          [key]: value,
        },
      },
    }));
  };

  const connectProvider = async (providerId: string) => {
    const form = forms[providerId];
    if (!form) return;

    setBusyKey(`${providerId}:connect`);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${providerId}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: form.credentials,
          fieldMappings: form.fieldMappings,
          syncMode: form.syncMode,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Baglanti kaydedilemedi.");
      }
      await fetchIntegrations();
      window.alert(result.testResult?.message || "Bağlantı kaydedildi.");
    } catch (connectError) {
      window.alert(connectError instanceof Error ? connectError.message : "Bağlantı hatası.");
    } finally {
      setBusyKey(null);
    }
  };

  const testProvider = async (providerId: string) => {
    setBusyKey(`${providerId}:test`);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${providerId}/test`, { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Baglanti testi basarisiz.");
      }
      window.alert(result.result?.message || "Bağlantı testi başarılı.");
      await fetchIntegrations();
    } catch (testError) {
      window.alert(testError instanceof Error ? testError.message : "Test hatası.");
    } finally {
      setBusyKey(null);
    }
  };

  const syncProvider = async (providerId: string) => {
    setBusyKey(`${providerId}:sync`);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${providerId}/sync`, { method: "POST" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Senkronizasyon basarisiz.");
      }
      await fetchIntegrations();
      window.alert("Senkronizasyon tamamlandı.");
    } catch (syncError) {
      window.alert(syncError instanceof Error ? syncError.message : "Senkronizasyon hatası.");
    } finally {
      setBusyKey(null);
    }
  };

  const loadLogs = async (providerId: string) => {
    setBusyKey(`${providerId}:logs`);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${providerId}/logs?limit=20`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Loglar alinamadi.");
      }
      setLogsByProvider((current) => ({ ...current, [providerId]: result.logs || [] }));
    } catch (logError) {
      window.alert(logError instanceof Error ? logError.message : "Log yükleme hatası.");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fatura Entegrasyonu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paraşüt, BizimHesap, Mikro, Logo İşbaşı, KolayBi ve Mükellef bağlantılarını yönetin.
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

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {sortedIntegrations.map((integration) => {
          const providerId = integration.provider.id;
          const form = forms[providerId] || createFormState(integration);
          const logs = logsByProvider[providerId] || [];
          const isConnected = integration.connection?.status === "active";
          const statusBadge = isConnected
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : integration.connection?.status === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-gray-100 text-gray-700 border-gray-200";

          return (
            <section key={providerId} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{integration.provider.name}</h2>
                  <p className="text-sm text-gray-500">{integration.provider.description}</p>
                  <a className="text-xs text-blue-600 hover:underline" href={integration.provider.websiteUrl} target="_blank" rel="noreferrer">
                    Resmi Site
                  </a>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadge}`}>
                  {isConnected ? "Bağlı" : integration.connection?.status === "error" ? "Hatalı" : "Bağlı Değil"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integration.provider.credentialFields.map((field) => (
                  <label key={field.key} className="text-sm">
                    <span className="text-gray-600">{field.label}{field.required ? " *" : ""}</span>
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

              <div className="border border-gray-100 rounded-lg p-3 space-y-3">
                <h3 className="font-medium text-gray-900 text-sm">Alan Eşleme</h3>
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

              <div className="border border-gray-100 rounded-lg p-3 space-y-2">
                <h3 className="font-medium text-gray-900 text-sm">Senkron Ayarı</h3>
                <div className="text-sm text-gray-600">
                  Mod: <span className="font-semibold text-gray-900">Güvenli Hibrit</span>
                </div>
                <div className="text-xs text-gray-500">
                  Outbound: anlık kuyruk + 5 dakika worker. Inbound: webhook varsa anlık, yoksa 15 dakika poll.
                </div>
                {integration.connection?.lastSyncAt && (
                  <div className="text-xs text-gray-600">
                    Son senkron: <span className="font-medium">{new Date(integration.connection.lastSyncAt).toLocaleString("tr-TR")}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ActionButton
                  icon={Save}
                  label="Bağlan"
                  loading={busyKey === `${providerId}:connect`}
                  onClick={() => connectProvider(providerId)}
                />
                <ActionButton
                  icon={ShieldCheck}
                  label="Bağlantı Testi"
                  loading={busyKey === `${providerId}:test`}
                  onClick={() => testProvider(providerId)}
                />
                <ActionButton
                  icon={RefreshCw}
                  label="Senkron Çalıştır"
                  loading={busyKey === `${providerId}:sync`}
                  onClick={() => syncProvider(providerId)}
                />
                <ActionButton
                  icon={Terminal}
                  label="Hata Günlüğü"
                  loading={busyKey === `${providerId}:logs`}
                  onClick={() => loadLogs(providerId)}
                  variant="secondary"
                />
                <ActionButton
                  icon={AlertTriangle}
                  label="Yeniden Dene"
                  loading={busyKey === `${providerId}:sync`}
                  onClick={() => syncProvider(providerId)}
                  variant="secondary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <MiniInfoCard title="Bekleyen" value={integration.queueStats.queued} />
                <MiniInfoCard title="Hatalı" value={integration.queueStats.failed} danger={integration.queueStats.failed > 0} />
                <MiniInfoCard
                  title="Manuel"
                  value={integration.queueStats.manualActionRequired}
                  danger={integration.queueStats.manualActionRequired > 0}
                />
              </div>

              {logs.length > 0 && (
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700">Son Loglar</div>
                  <div className="max-h-52 overflow-auto">
                    {logs.map((log, index) => (
                      <div key={`${providerId}-log-${index}`} className="px-3 py-2 border-t border-gray-100 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-800">{String(log.status || "unknown")}</span>
                          <span className="text-gray-500">{String(log.created_at || "")}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{String(log.error_message || log.entity_type || "Detay yok")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Bağlantı aktif
                  </>
                ) : (
                  <>
                    <Unplug className="w-4 h-4 text-gray-400" />
                    Bağlantı kurulmadı
                  </>
                )}
                {integration.provider.supportsWebhook && (
                  <span className="ml-auto inline-flex items-center gap-1">
                    <PlugZap className="w-3.5 h-3.5 text-blue-600" />
                    Webhook destekli
                  </span>
                )}
              </div>
            </section>
          );
        })}
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
