
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    Loader2,
    PackageCheck,
    Save,
    ShieldCheck,
    Trash2,
    Truck,
    Waypoints,
} from "lucide-react";
import { toast } from "sonner";
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

interface LegacyBasitKargoSettings {
    apiToken?: string;
    senderProfile?: string;
    addressPreference?: string;
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

function getIntegrationStatus(integration: ShippingIntegrationRecord) {
    const hasCredentials = hasRequiredProviderCredentials(integration);

    if (integration.enabled && hasCredentials) {
        return {
            label: integration.health.status === "error" ? "Hata Var" : "Hazır",
            className: integration.health.status === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200",
        };
    }

    if (integration.enabled && !hasCredentials) {
        return {
            label: "Eksik Bilgi",
            className: "bg-amber-50 text-amber-700 border-amber-200",
        };
    }

    if (!integration.enabled && hasCredentials) {
        return {
            label: "Taslak",
            className: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }

    return {
        label: "Bağlı Değil",
        className: "bg-gray-100 text-gray-600 border-gray-200",
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

export default function ShippingSettingsPage() {
    const [settings, setSettings] = useState<ShippingIntegrationSettings | null>(null);
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [legacyNotice, setLegacyNotice] = useState(false);

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
        const ready = settings.integrations.filter((integration) => integration.enabled && hasRequiredProviderCredentials(integration)).length;
        const incomplete = settings.integrations.filter((integration) => integration.enabled && !hasRequiredProviderCredentials(integration)).length;

        return {
            total: settings.integrations.length,
            enabled,
            ready,
            incomplete,
        };
    }, [settings]);

    const defaultProviderLabel = useMemo(() => {
        if (!settings?.defaultProvider) {
            return "Tanımlanmadı";
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
                    integration.provider === provider
                        ? updater(integration)
                        : integration
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
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kargo Entegrasyon Merkezi</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Taşıyıcı hesaplarını tek ekrandan kaydedin, varsayılan sağlayıcıyı seçin ve sipariş otomasyonunu yönetin.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
                </button>
            </div>

            {legacyNotice && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-900">Eski Basit Kargo kaydı bulundu</p>
                        <p className="text-sm text-blue-800 mt-1">
                            Tarayıcıdaki eski token alanı forma taşındı. Merkezi ayara yazmak için bu sayfayı kaydedin.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                            <Waypoints className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs font-medium text-gray-500">Toplam Sağlayıcı</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.enabled}</p>
                            <p className="text-xs font-medium text-gray-500">Aktif Entegrasyon</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.ready}</p>
                            <p className="text-xs font-medium text-gray-500">Hazır Sağlayıcı</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{defaultProviderLabel}</p>
                            <p className="text-xs font-medium text-gray-500">
                                Varsayılan Sağlayıcı {stats.incomplete > 0 ? `• ${stats.incomplete} eksik kayıt` : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/70">
                    <h2 className="text-lg font-semibold text-gray-900">Orkestrasyon Ayarları</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Siparişler otomatik oluşturulurken kullanılacak varsayılan sağlayıcıyı seçin.
                    </p>
                </div>

                <div className="p-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Varsayılan sağlayıcı</label>
                        <select
                            value={settings.defaultProvider ?? ""}
                            onChange={(event) => setSettings({
                                ...settings,
                                defaultProvider: (event.target.value || null) as ShippingIntegrationProvider | null,
                            })}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                            <option value="">Manuel seçim</option>
                            {settings.integrations
                                .filter((integration) => integration.enabled)
                                .map((integration) => (
                                    <option key={integration.provider} value={integration.provider}>
                                        {integration.displayName}
                                    </option>
                                ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            Varsayılan sağlayıcı yalnızca aktif kayıtlar arasından seçilmelidir. Fallback mantığı sonraki entegrasyon adımında bu ayarın üstüne kurulacak.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                        <h3 className="text-sm font-semibold text-gray-900">Operasyon Notu</h3>
                        <ul className="mt-3 space-y-2 text-sm text-gray-600">
                            <li>Önce sağlayıcı hesabınızı açın.</li>
                            <li>Bu ekrana sadece gerekli API kimlik bilgilerini kaydedin.</li>
                            <li>Gerçek sipariş akışı ve takip senkronu sonraki iterasyonda bu kayıtları kullanacak.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {SHIPPING_PROVIDER_REGISTRY.map((provider) => {
                    const integration = settings.integrations.find((item) => item.provider === provider.id)!;
                    const status = getIntegrationStatus(integration);

                    return (
                        <div key={provider.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className={`inline-flex rounded-2xl bg-gradient-to-r ${provider.accentClassName} px-3 py-1 text-xs font-semibold text-white`}>
                                        {provider.shortName}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{provider.name}</h3>
                                    <p className="text-sm text-gray-500 mt-2 leading-6">{provider.description}</p>
                                </div>

                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>

                            <div className="mt-5 space-y-3 text-sm text-gray-600">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Kimlik Doğrulama</span>
                                    <span className="font-medium text-gray-900">{provider.authStrategy}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {provider.capabilities.map((capability) => (
                                        <span
                                            key={capability}
                                            className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                                        >
                                            {capability}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <a
                                    href={provider.docsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    API Dökümanı
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => updateIntegration(provider.id, (current) => ({
                                        ...current,
                                        enabled: !current.enabled,
                                    }))}
                                    className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                        integration.enabled
                                            ? "bg-gray-900 text-white hover:bg-gray-800"
                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                                >
                                    {integration.enabled ? "Pasife Al" : "Aktifleştir"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-6">
                {settings.integrations.map((integration) => {
                    const definition = getShippingProviderDefinition(integration.provider);
                    const status = getIntegrationStatus(integration);

                    return (
                        <section key={integration.provider} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/70 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-semibold text-gray-900">{integration.displayName}</h2>
                                        {settings.defaultProvider === integration.provider && (
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                Varsayılan
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Sağlayıcı hesabı açıldıktan sonra zorunlu alanları doldurun ve gerekirse bu kaydı varsayılan taşıyıcı yapın.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSettings({
                                            ...settings,
                                            defaultProvider: integration.provider,
                                        })}
                                        disabled={!integration.enabled}
                                        className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Varsayılan Yap
                                    </button>

                                    <select
                                        value={integration.environment}
                                        onChange={(event) => updateIntegration(integration.provider, (current) => ({
                                            ...current,
                                            environment: event.target.value === "sandbox" ? "sandbox" : "production",
                                        }))}
                                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    >
                                        <option value="production">Canlı Ortam</option>
                                        <option value="sandbox">Test Ortamı</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 grid gap-8 xl:grid-cols-[1fr_1fr]">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Görünen ad</label>
                                        <input
                                            type="text"
                                            value={integration.displayName}
                                            onChange={(event) => updateIntegration(integration.provider, (current) => ({
                                                ...current,
                                                displayName: event.target.value,
                                            }))}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">Kimlik Bilgileri</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Bu alanlar sağlayıcının panelinden alınır. Kargo hesabı yoksa önce dış sistemde hesap açılmalıdır.
                                            </p>
                                        </div>

                                        {definition.credentialFields.map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                                                <input
                                                    type={field.type === "email" ? "email" : field.secret ? "password" : "text"}
                                                    value={integration.credentials[field.key] ?? ""}
                                                    onChange={(event) => handleFieldChange(integration.provider, "credentials", field.key, event.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                />
                                                <p className="text-xs text-gray-500 mt-1.5">{field.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {definition.configurationFields.map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>

                                                {field.type === "select" ? (
                                                    <select
                                                        value={integration.configuration[field.key] ?? ""}
                                                        onChange={(event) => handleFieldChange(integration.provider, "configuration", field.key, event.target.value)}
                                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                                                        onChange={(event) => handleFieldChange(integration.provider, "configuration", field.key, event.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                    />
                                                )}

                                                <p className="text-xs text-gray-500 mt-1.5">{field.description}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
                                        <h3 className="text-sm font-semibold text-gray-900">Sipariş Otomasyonu</h3>
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Otomatik gönderi oluştur</p>
                                                    <p className="text-xs text-gray-500">Seçilen sipariş statüsünde provider API çağrısı tetiklenir.</p>
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
                                                    className="h-4 w-4 rounded border-gray-300 text-gray-900"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Takip bilgisini senkronla</p>
                                                    <p className="text-xs text-gray-500">Webhook veya polling entegrasyonu geldiğinde kullanılacak.</p>
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
                                                    className="h-4 w-4 rounded border-gray-300 text-gray-900"
                                                />
                                            </label>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gönderi tetik statüsü</label>
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            >
                                                <option value="manual">Manuel</option>
                                                <option value="confirmed">Sipariş onaylandı</option>
                                                <option value="preparing">Hazırlanıyor</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-dashed border-gray-300 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900">Bağlantı Sağlığı</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Canlı test çağrısı henüz bağlı değil. Bu kayıt, entegrasyon implementasyonu için konfigürasyon kaynağıdır.
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-gray-600">
                                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                                <div className="text-xs uppercase tracking-wide text-gray-400">Son Test</div>
                                                <div className="mt-1 font-medium text-gray-900">
                                                    {integration.health.lastCheckedAt
                                                        ? new Date(integration.health.lastCheckedAt).toLocaleString("tr-TR")
                                                        : "Henüz çalıştırılmadı"}
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-gray-50 px-4 py-3">
                                                <div className="text-xs uppercase tracking-wide text-gray-400">Son Hata</div>
                                                <div className="mt-1 font-medium text-gray-900">
                                                    {integration.health.lastError || "Yok"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>

            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Teslimat Bölgeleri</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Checkout fiyat kuralları entegrasyon kimlik bilgilerinden ayrı yönetilir.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        <PackageCheck className="w-4 h-4" />
                        {zones.length} bölge
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {zones.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                            Henüz teslimat bölgesi tanımlanmamış.
                        </div>
                    )}

                    {zones.map((zone) => (
                        <div key={zone.id} className="rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 bg-gray-50 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{zone.countries.join(", ")}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteZone(zone.id)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Sil
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {zone.rates.map((rate: ShippingRate) => (
                                    <div key={rate.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_120px] md:items-center">
                                        <div>
                                            <div className="font-medium text-gray-900">{rate.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{rate.condition || "Koşul tanımlanmadı"}</div>
                                        </div>
                                        <div className="text-sm text-gray-500">{zone.name}</div>
                                        <div className="text-sm font-semibold text-right text-gray-900">
                                            {rate.price === 0 ? "Ücretsiz" : `TL ${rate.price.toFixed(2)}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
