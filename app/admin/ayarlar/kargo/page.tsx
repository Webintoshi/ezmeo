"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    Loader2,
    PackageCheck,
    Save,
    ShieldCheck,
    Sparkles,
    Trash2,
    Truck,
    Waypoints,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteShippingZone, getShippingZones } from "@/lib/shipping";
import {
    SHIPPING_PROVIDER_REGISTRY,
    createDefaultShippingIntegrationSettings,
    getShippingProviderDefinition,
    hasRequiredProviderCredentials,
    mergeLegacyBasitKargoSettings,
    normalizeShippingIntegrationSettings,
} from "@/lib/shipping-integrations";
import { ShippingRate, ShippingZone } from "@/lib/shipping-storage";
import {
    ShippingIntegrationProvider,
    ShippingIntegrationRecord,
    ShippingIntegrationSettings,
} from "@/types/shipping-integration";

const LEGACY_BASIT_KARGO_STORAGE_KEY = "ezmeo_basit_kargo_settings";
const SHIPPING_PRICE_FORMATTER = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

interface LegacyBasitKargoSettings {
    apiToken?: string;
    senderProfile?: string;
    addressPreference?: string;
}

interface IntegrationStatusMeta {
    label: string;
    className: string;
}

interface CredentialProgress {
    filled: number;
    total: number;
    percent: number;
}

function readLegacyBasitKargoSettings(): LegacyBasitKargoSettings | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = localStorage.getItem(LEGACY_BASIT_KARGO_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as LegacyBasitKargoSettings;
        return {
            apiToken: typeof parsed.apiToken === "string" ? parsed.apiToken : undefined,
            senderProfile: typeof parsed.senderProfile === "string" ? parsed.senderProfile : undefined,
            addressPreference: typeof parsed.addressPreference === "string" ? parsed.addressPreference : undefined,
        };
    } catch {
        return null;
    }
}

function getIntegrationStatus(integration: ShippingIntegrationRecord): IntegrationStatusMeta {
    const hasCredentials = hasRequiredProviderCredentials(integration);

    if (integration.enabled && hasCredentials) {
        return {
            label: integration.health.status === "error" ? "Hata var" : "Hazır",
            className: integration.health.status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
        };
    }

    if (integration.enabled && !hasCredentials) {
        return {
            label: "Eksik bilgi",
            className: "border-amber-200 bg-amber-50 text-amber-700",
        };
    }

    if (!integration.enabled && hasCredentials) {
        return {
            label: "Taslak",
            className: "border-slate-200 bg-slate-100 text-slate-700",
        };
    }

    return {
        label: "Bağlı değil",
        className: "border-gray-200 bg-gray-100 text-gray-600",
    };
}

function buildPayloadForSave(settings: ShippingIntegrationSettings): ShippingIntegrationSettings {
    const now = new Date().toISOString();

    return {
        ...settings,
        integrations: settings.integrations.map((integration) => ({
            ...integration,
            updatedAt: now,
            health: integration.enabled && !hasRequiredProviderCredentials(integration)
                ? {
                    ...integration.health,
                    status: "error",
                    lastError: "Zorunlu kimlik bilgileri eksik.",
                }
                : integration.health,
        })),
    };
}

function getCredentialProgress(integration: ShippingIntegrationRecord): CredentialProgress {
    const definition = getShippingProviderDefinition(integration.provider);
    const requiredFields = definition.credentialFields.filter((field) => field.required);

    if (requiredFields.length === 0) {
        return {
            filled: 0,
            total: 0,
            percent: 100,
        };
    }

    const filled = requiredFields.filter((field) => {
        const value = integration.credentials[field.key];
        return typeof value === "string" && value.trim().length > 0;
    }).length;

    return {
        filled,
        total: requiredFields.length,
        percent: Math.round((filled / requiredFields.length) * 100),
    };
}

function formatShippingPrice(price: number): string {
    return price === 0 ? "Ücretsiz" : SHIPPING_PRICE_FORMATTER.format(price);
}

function getHealthCopy(integration: ShippingIntegrationRecord): string {
    if (integration.health.lastError) {
        return integration.health.lastError;
    }

    if (integration.health.lastCheckedAt) {
        return new Date(integration.health.lastCheckedAt).toLocaleString("tr-TR");
    }

    return "Henüz test çalıştırılmadı";
}

export default function ShippingSettingsPage() {
    const [settings, setSettings] = useState<ShippingIntegrationSettings | null>(null);
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [legacyNotice, setLegacyNotice] = useState(false);
    const [expandedProvider, setExpandedProvider] = useState<ShippingIntegrationProvider | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadPage() {
            setIsLoading(true);

            try {
                const response = await fetch("/api/settings?type=shipping-integrations", {
                    method: "GET",
                    cache: "no-store",
                });
                const payload = await response.json();

                const baseSettings = payload.success
                    ? normalizeShippingIntegrationSettings(payload.shippingIntegrations)
                    : createDefaultShippingIntegrationSettings();

                const legacySettings = readLegacyBasitKargoSettings();
                const mergedSettings = mergeLegacyBasitKargoSettings(baseSettings, legacySettings);

                if (!isMounted) {
                    return;
                }

                setSettings(mergedSettings);
                setZones(getShippingZones());
                setLegacyNotice(Boolean(
                    legacySettings?.apiToken &&
                    !baseSettings.integrations.find((integration) => integration.provider === "basit-kargo")?.credentials.apiToken,
                ));
            } catch {
                if (!isMounted) {
                    return;
                }

                const fallbackSettings = mergeLegacyBasitKargoSettings(
                    createDefaultShippingIntegrationSettings(),
                    readLegacyBasitKargoSettings(),
                );

                setSettings(fallbackSettings);
                setZones(getShippingZones());
                toast.error("Kargo ayarları yüklenemedi", {
                    description: "Varsayılan yapı ile devam ediliyor.",
                });
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!settings || expandedProvider) {
            return;
        }

        const suggestedProvider =
            settings.defaultProvider ??
            settings.integrations.find((integration) => integration.enabled)?.provider ??
            settings.integrations[0]?.provider ??
            null;

        setExpandedProvider(suggestedProvider);
    }, [expandedProvider, settings]);

    const stats = useMemo(() => {
        if (!settings) {
            return {
                total: 0,
                enabled: 0,
                ready: 0,
                incomplete: 0,
            };
        }

        const enabled = settings.integrations.filter((integration) => integration.enabled).length;
        const ready = settings.integrations.filter((integration) => (
            integration.enabled && hasRequiredProviderCredentials(integration)
        )).length;
        const incomplete = settings.integrations.filter((integration) => (
            integration.enabled && !hasRequiredProviderCredentials(integration)
        )).length;

        return {
            total: settings.integrations.length,
            enabled,
            ready,
            incomplete,
        };
    }, [settings]);

    const enabledIntegrations = useMemo(() => {
        return settings?.integrations.filter((integration) => integration.enabled) ?? [];
    }, [settings]);

    const defaultProviderLabel = useMemo(() => {
        if (!settings?.defaultProvider) {
            return "Henüz seçilmedi";
        }

        return getShippingProviderDefinition(settings.defaultProvider).name;
    }, [settings]);

    function updateIntegration(
        provider: ShippingIntegrationProvider,
        updater: (integration: ShippingIntegrationRecord) => ShippingIntegrationRecord,
    ) {
        setSettings((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                integrations: current.integrations.map((integration) => (
                    integration.provider === provider ? updater(integration) : integration
                )),
            };
        });
    }

    function handleFieldChange(
        provider: ShippingIntegrationProvider,
        section: "credentials" | "configuration",
        key: string,
        value: string,
    ) {
        updateIntegration(provider, (integration) => ({
            ...integration,
            [section]: {
                ...integration[section],
                [key]: value,
            },
            health: integration.health.lastError === "Zorunlu kimlik bilgileri eksik."
                ? { ...integration.health, status: "unknown", lastError: null }
                : integration.health,
        }));
    }

    function handleToggleProvider(provider: ShippingIntegrationProvider) {
        setSettings((current) => {
            if (!current) {
                return current;
            }

            const integration = current.integrations.find((item) => item.provider === provider);
            if (!integration) {
                return current;
            }

            const nextEnabled = !integration.enabled;

            return {
                ...current,
                defaultProvider: !nextEnabled && current.defaultProvider === provider ? null : current.defaultProvider,
                integrations: current.integrations.map((item) => (
                    item.provider === provider ? { ...item, enabled: nextEnabled } : item
                )),
            };
        });
    }

    function handleDeleteZone(id: string) {
        if (!window.confirm("Bu teslimat bölgesini silmek istediğinizden emin misiniz?")) {
            return;
        }

        deleteShippingZone(id);
        setZones(getShippingZones());
        toast.success("Teslimat bölgesi silindi.");
    }

    async function handleSave() {
        if (!settings) {
            return;
        }

        const enabledMissingCredentials = settings.integrations.filter((integration) => (
            integration.enabled && !hasRequiredProviderCredentials(integration)
        ));

        if (enabledMissingCredentials.length > 0) {
            toast.error("Eksik entegrasyon bilgileri var", {
                description: `${enabledMissingCredentials.map((item) => item.displayName).join(", ")} için zorunlu alanları doldurun.`,
            });
            return;
        }

        if (settings.defaultProvider) {
            const defaultIntegration = settings.integrations.find((integration) => integration.provider === settings.defaultProvider);

            if (!defaultIntegration?.enabled) {
                toast.error("Varsayılan sağlayıcı aktif olmalı.");
                return;
            }
        }

        const payload = buildPayloadForSave(settings);

        setIsSaving(true);
        try {
            const response = await fetch("/api/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "shipping-integrations",
                    shippingIntegrations: payload,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Kargo entegrasyonları kaydedilemedi.");
            }

            setSettings(normalizeShippingIntegrationSettings(result.shippingIntegrations));
            setLegacyNotice(false);
            toast.success("Kargo entegrasyonları kaydedildi.", {
                description: "Sağlayıcı kayıtları artık merkezi ayarlarda tutuluyor.",
            });
        } catch (error) {
            toast.error("Kayıt başarısız", {
                description: error instanceof Error ? error.message : "Bilinmeyen hata",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading || !settings) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50/60">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/60 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
                    <div className="grid gap-6 border-b border-gray-100 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.45),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(249,250,251,0.92)_100%)] px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:px-8 lg:py-8">
                        <div className="space-y-5">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Basit ve güvenli kargo yönetimi
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                    Kargo ayarlarını tek bakışta yönetin
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-gray-600 sm:text-[15px]">
                                    Önce kargo şirketini seçin, sonra gerekli bilgileri girin, en son varsayılan seçimi yapın.
                                    Tüm ekran bu sıraya göre düzenlendi.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-gray-200 bg-white/90 p-4">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Adım 1</div>
                                    <div className="mt-2 text-sm font-semibold text-gray-900">Sağlayıcıyı aç</div>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">Kullanacağınız firmayı aktif hale getirin.</p>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-white/90 p-4">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Adım 2</div>
                                    <div className="mt-2 text-sm font-semibold text-gray-900">Bilgileri doldur</div>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">Zorunlu API alanlarını boş bırakmayın.</p>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-white/90 p-4">
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Adım 3</div>
                                    <div className="mt-2 text-sm font-semibold text-gray-900">Kaydet</div>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">Varsayılan taşıyıcıyı seçip ayarları saklayın.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-gray-200 bg-white/90 p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Özet paneli</p>
                                    <h2 className="mt-1 text-lg font-semibold text-gray-900">Bugünkü durum</h2>
                                </div>
                                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                    {stats.ready}/{stats.total} hazır
                                </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <div className="text-xs font-medium text-gray-500">Varsayılan kargo</div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{defaultProviderLabel}</div>
                                </div>
                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <div className="text-xs font-medium text-gray-500">Aktif entegrasyon</div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{stats.enabled} sağlayıcı</div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? "Kaydediliyor..." : "Tüm değişiklikleri kaydet"}
                            </button>

                            <p className="text-xs leading-5 text-gray-500">
                                Kaydetmeden önce eksik alanları sistem size kart üzerinde uyarı olarak gösterecek.
                            </p>
                        </div>
                    </div>

                    {legacyNotice && (
                        <div className="border-b border-blue-100 bg-blue-50/70 px-5 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-white/70 px-4 py-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-blue-900">Eski Basit Kargo kaydı bulundu</p>
                                    <p className="text-sm leading-6 text-blue-800">
                                        Tarayıcıdaki eski token alanı bu forma taşındı. Merkezi ayara yazmak için sayfayı kaydetmeniz yeterli.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    <Waypoints className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-xs font-medium text-gray-500">Toplam sağlayıcı</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.enabled}</p>
                                    <p className="text-xs font-medium text-gray-500">Aktif entegrasyon</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
                                    <p className="text-xs font-medium text-gray-500">Tam hazır</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{defaultProviderLabel}</p>
                                    <p className="text-xs font-medium text-gray-500">
                                        {stats.incomplete > 0 ? `${stats.incomplete} kartta eksik bilgi var` : "Eksik kayıt görünmüyor"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
                    <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Yönlendirme</p>
                                <h2 className="mt-1 text-xl font-semibold text-gray-900">Varsayılan gönderi akışı</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                    Sipariş otomasyonu aktif olduğunda sistem öncelikle burada seçtiğiniz sağlayıcıya bakar.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                <Truck className="h-4 w-4" />
                                {enabledIntegrations.length} aktif seçenek
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-900">Varsayılan sağlayıcı</label>
                                <select
                                    value={settings.defaultProvider ?? ""}
                                    onChange={(event) => setSettings({
                                        ...settings,
                                        defaultProvider: (event.target.value || null) as ShippingIntegrationProvider | null,
                                    })}
                                    className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                >
                                    <option value="">Önce manuel seç</option>
                                    {enabledIntegrations.map((integration) => (
                                        <option key={integration.provider} value={integration.provider}>
                                            {integration.displayName}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs leading-5 text-gray-500">
                                    Varsayılan sağlayıcı yalnızca aktif kayıtlar arasından seçilebilir. Emin değilseniz boş bırakın.
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-dashed border-gray-300 bg-gray-50 p-4">
                                <p className="text-sm font-semibold text-gray-900">Kolay kurulum notu</p>
                                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                                    <li>Önce kullandığınız kargo firmasını aktif yapın.</li>
                                    <li>Sonra sadece zorunlu API bilgilerini doldurun.</li>
                                    <li>En son kaydedip test sürecine geçin.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Hızlı seçim</p>
                        <h2 className="mt-1 text-xl font-semibold text-gray-900">Sağlayıcı kartları</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Her kartta önce durum, sonra detaylar gelir. Hangisini kullanacaksanız o kartı açmanız yeterlidir.
                        </p>

                        <div className="mt-5 space-y-3">
                            {SHIPPING_PROVIDER_REGISTRY.map((provider) => {
                                const integration = settings.integrations.find((item) => item.provider === provider.id)!;
                                const status = getIntegrationStatus(integration);
                                const progress = getCredentialProgress(integration);
                                const isExpanded = expandedProvider === provider.id;

                                return (
                                    <button
                                        key={provider.id}
                                        type="button"
                                        onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                                        className={cn(
                                            "flex w-full items-center justify-between gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition",
                                            isExpanded
                                                ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-900/10"
                                                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white",
                                        )}
                                        aria-expanded={isExpanded}
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={cn(
                                                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                    isExpanded ? "bg-white/15 text-white" : "bg-white text-gray-700",
                                                )}>
                                                    {provider.shortName}
                                                </span>
                                                <span className={cn(
                                                    "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
                                                    isExpanded ? "border-white/20 bg-white/10 text-white" : status.className,
                                                )}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm font-semibold">{provider.name}</div>
                                            <p className={cn(
                                                "mt-1 text-xs leading-5",
                                                isExpanded ? "text-white/75" : "text-gray-500",
                                            )}>
                                                Zorunlu alanlar: {progress.filled}/{progress.total || 0}
                                            </p>
                                        </div>

                                        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    {settings.integrations.map((integration) => {
                        const definition = getShippingProviderDefinition(integration.provider);
                        const status = getIntegrationStatus(integration);
                        const progress = getCredentialProgress(integration);
                        const isExpanded = expandedProvider === integration.provider;
                        const panelId = `${integration.provider}-panel`;

                        return (
                            <article
                                key={integration.provider}
                                className={cn(
                                    "overflow-hidden rounded-[2rem] border bg-white shadow-sm transition-all",
                                    isExpanded ? "border-gray-900" : "border-gray-200",
                                )}
                            >
                                <div className="bg-[linear-gradient(180deg,_rgba(249,250,251,0.98)_0%,_rgba(255,255,255,1)_100%)] px-5 py-5 sm:px-6">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex rounded-full bg-gradient-to-r ${definition.accentClassName} px-3 py-1 text-xs font-semibold text-white`}>
                                                    {definition.shortName}
                                                </span>
                                                {settings.defaultProvider === integration.provider && (
                                                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                        Varsayılan
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">{integration.displayName}</h2>
                                                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                                                    {definition.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3 xl:w-[32rem]">
                                            <div className="rounded-2xl border border-gray-200 bg-white p-3">
                                                <div className="text-xs font-medium text-gray-500">Doğrulama</div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900">{definition.authStrategy}</div>
                                            </div>
                                            <div className="rounded-2xl border border-gray-200 bg-white p-3">
                                                <div className="text-xs font-medium text-gray-500">Zorunlu alan</div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900">
                                                    {progress.total === 0 ? "Yok" : `${progress.filled}/${progress.total}`}
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-gray-200 bg-white p-3">
                                                <div className="text-xs font-medium text-gray-500">Ortam</div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900">
                                                    {integration.environment === "production" ? "Canlı" : "Test"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {definition.capabilities.map((capability) => (
                                            <span
                                                key={capability}
                                                className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
                                            >
                                                {capability}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleProvider(integration.provider)}
                                            className={cn(
                                                "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                                                integration.enabled
                                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                                            )}
                                        >
                                            {integration.enabled ? "Aktif, kapatmak için dokun" : "Pasif, açmak için dokun"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setExpandedProvider(isExpanded ? null : integration.provider);
                                            }}
                                            aria-controls={panelId}
                                            aria-expanded={isExpanded}
                                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            {isExpanded ? "Detayları gizle" : "Detayları aç"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSettings({
                                                ...settings,
                                                defaultProvider: integration.provider,
                                            })}
                                            disabled={!integration.enabled}
                                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Varsayılan yap
                                        </button>

                                        <a
                                            href={definition.docsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            API dökümanı
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div id={panelId} className="border-t border-gray-100 px-5 py-5 sm:px-6 sm:py-6">
                                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                            <div className="space-y-5">
                                                <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50/60 p-4 sm:p-5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900">Temel bilgiler</h3>
                                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                                Önce görünen adı ve çalışma ortamını netleştirin.
                                                            </p>
                                                        </div>
                                                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                                                            %{progress.percent}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                        <div className="md:col-span-2">
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Görünen ad</label>
                                                            <input
                                                                type="text"
                                                                value={integration.displayName}
                                                                onChange={(event) => updateIntegration(integration.provider, (current) => ({
                                                                    ...current,
                                                                    displayName: event.target.value,
                                                                }))}
                                                                className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Çalışma ortamı</label>
                                                            <select
                                                                value={integration.environment}
                                                                onChange={(event) => updateIntegration(integration.provider, (current) => ({
                                                                    ...current,
                                                                    environment: event.target.value === "sandbox" ? "sandbox" : "production",
                                                                }))}
                                                                className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                                            >
                                                                <option value="production">Canlı ortam</option>
                                                                <option value="sandbox">Test ortamı</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Kontrol durumu</label>
                                                            <div className="flex min-h-12 items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                                                                {getHealthCopy(integration)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4 sm:p-5">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-900">Kimlik bilgileri</h3>
                                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                                            Bu alanlar sağlayıcının panelinden alınır. Zorunlu alanlar boş kalmamalı.
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 space-y-4">
                                                        {definition.credentialFields.map((field) => (
                                                            <div key={field.key}>
                                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                                    {field.label}
                                                                    {field.required ? " *" : ""}
                                                                </label>
                                                                <input
                                                                    type={field.type === "email" ? "email" : field.secret ? "password" : "text"}
                                                                    value={integration.credentials[field.key] ?? ""}
                                                                    onChange={(event) => handleFieldChange(
                                                                        integration.provider,
                                                                        "credentials",
                                                                        field.key,
                                                                        event.target.value,
                                                                    )}
                                                                    placeholder={field.placeholder}
                                                                    className="min-h-12 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                                                                />
                                                                <p className="mt-1.5 text-xs leading-5 text-gray-500">{field.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="space-y-5">
                                                <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4 sm:p-5">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-900">Operasyon ayarları</h3>
                                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                                            Sağlayıcıya özel çalışma bilgilerini burada tutun.
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                        {definition.configurationFields.map((field) => (
                                                            <div key={field.key} className={cn(definition.configurationFields.length === 1 && "md:col-span-2")}>
                                                                <label className="mb-2 block text-sm font-medium text-gray-700">{field.label}</label>
                                                                {field.type === "select" ? (
                                                                    <select
                                                                        value={integration.configuration[field.key] ?? ""}
                                                                        onChange={(event) => handleFieldChange(
                                                                            integration.provider,
                                                                            "configuration",
                                                                            field.key,
                                                                            event.target.value,
                                                                        )}
                                                                        className="min-h-12 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                                                                    >
                                                                        {(field.options ?? []).map((option) => (
                                                                            <option key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={integration.configuration[field.key] ?? ""}
                                                                        onChange={(event) => handleFieldChange(
                                                                            integration.provider,
                                                                            "configuration",
                                                                            field.key,
                                                                            event.target.value,
                                                                        )}
                                                                        placeholder={field.placeholder}
                                                                        className="min-h-12 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/10"
                                                                    />
                                                                )}
                                                                <p className="mt-1.5 text-xs leading-5 text-gray-500">{field.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-900">Sipariş otomasyonu</h3>
                                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                                            Otomatik akışları açık tutacaksanız, önce sağlayıcının API bilgilerini doğrulayın.
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 space-y-3">
                                                        <label className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">Otomatik gönderi oluştur</p>
                                                                <p className="mt-1 text-xs leading-5 text-gray-500">Sipariş belirli aşamaya gelince gönderi açılır.</p>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={integration.automation.autoCreateShipment}
                                                                onChange={(event) => updateIntegration(integration.provider, (current) => ({
                                                                    ...current,
                                                                    automation: {
                                                                        ...current.automation,
                                                                        autoCreateShipment: event.target.checked,
                                                                    },
                                                                }))}
                                                                className="h-5 w-5 rounded border-gray-300 text-gray-900"
                                                            />
                                                        </label>

                                                        <label className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">Takip bilgisini senkronla</p>
                                                                <p className="mt-1 text-xs leading-5 text-gray-500">Takip numarası ve durum güncellemesi alınır.</p>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={integration.automation.autoSyncTracking}
                                                                onChange={(event) => updateIntegration(integration.provider, (current) => ({
                                                                    ...current,
                                                                    automation: {
                                                                        ...current.automation,
                                                                        autoSyncTracking: event.target.checked,
                                                                    },
                                                                }))}
                                                                className="h-5 w-5 rounded border-gray-300 text-gray-900"
                                                            />
                                                        </label>

                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Gönderi tetik statüsü</label>
                                                            <select
                                                                value={integration.automation.orderTrigger}
                                                                onChange={(event) => updateIntegration(integration.provider, (current) => ({
                                                                    ...current,
                                                                    automation: {
                                                                        ...current.automation,
                                                                        orderTrigger: event.target.value === "manual" || event.target.value === "confirmed"
                                                                            ? event.target.value
                                                                            : "preparing",
                                                                    },
                                                                }))}
                                                                className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                                            >
                                                                <option value="manual">Manuel</option>
                                                                <option value="confirmed">Sipariş onaylandı</option>
                                                                <option value="preparing">Hazırlanıyor</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-[1.5rem] border border-dashed border-gray-300 bg-white p-4 sm:p-5">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900">Bağlantı sağlığı</h3>
                                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                                Canlı test çağrısı henüz bağlı değil. Bu alan ileride entegrasyon kaynağı olarak kullanılacak.
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                                                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Son test</div>
                                                            <div className="mt-1 text-sm font-medium text-gray-900">
                                                                {integration.health.lastCheckedAt
                                                                    ? new Date(integration.health.lastCheckedAt).toLocaleString("tr-TR")
                                                                    : "Henüz çalıştırılmadı"}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-2xl bg-gray-50 px-4 py-3">
                                                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">Son hata</div>
                                                            <div className="mt-1 text-sm font-medium text-gray-900">
                                                                {integration.health.lastError || "Yok"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <a
                                                            href={definition.dashboardUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                                        >
                                                            Sağlayıcı panelini aç
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>

                <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Teslimat</p>
                            <h2 className="mt-1 text-xl font-semibold text-gray-900">Teslimat bölgeleri</h2>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Checkout tarafındaki kargo ücretleri entegrasyon kimlik bilgilerinden ayrı yönetilir.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            <PackageCheck className="h-4 w-4" />
                            {zones.length} bölge
                        </div>
                    </div>

                    <div className="px-5 py-5 sm:px-6">
                        {zones.length === 0 ? (
                            <div className="rounded-[1.75rem] border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                                Henüz teslimat bölgesi tanımlanmamış.
                            </div>
                        ) : (
                            <div className="grid gap-4 xl:grid-cols-2">
                                {zones.map((zone) => (
                                    <div key={zone.id} className="overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white">
                                        <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900">{zone.name}</h3>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {zone.countries.map((country) => (
                                                        <span
                                                            key={country}
                                                            className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
                                                        >
                                                            {country}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteZone(zone.id)}
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Sil
                                            </button>
                                        </div>

                                        <div className="grid gap-3 p-4 sm:p-5">
                                            {zone.rates.map((rate: ShippingRate) => (
                                                <div
                                                    key={rate.id}
                                                    className="rounded-[1.5rem] border border-gray-200 bg-gray-50/60 p-4"
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold text-gray-900">{rate.name}</div>
                                                            <div className="mt-1 text-xs leading-5 text-gray-500">
                                                                {rate.condition || "Koşul tanımlanmadı"}
                                                            </div>
                                                        </div>
                                                        <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                                                            {formatShippingPrice(rate.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
