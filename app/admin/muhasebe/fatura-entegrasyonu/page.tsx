"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  MoreHorizontal,
  Plug,
  RefreshCw,
  Settings,
  ShieldCheck,
  Unplug,
  User,
  XCircle,
} from "lucide-react";
import type { AccountingIntegrationView } from "@/types/accounting";

// Entegrasyon sağlayıcı logoları (basit harf bazlı)
const PROVIDER_LOGOS: Record<string, { bg: string; text: string; abbr: string }> = {
  parasut: { bg: "bg-purple-600", text: "text-white", abbr: "P" },
  bizimhesap: { bg: "bg-blue-600", text: "text-white", abbr: "BH" },
  mikro: { bg: "bg-orange-500", text: "text-white", abbr: "M" },
  logo: { bg: "bg-red-600", text: "text-white", abbr: "L" },
  kolaybi: { bg: "bg-green-600", text: "text-white", abbr: "KB" },
  mukellef: { bg: "bg-indigo-600", text: "text-white", abbr: "MK" },
};

// Basit durum tipi
type Step = "list" | "connect" | "settings";

export default function AccountingIntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<AccountingIntegrationView[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AccountingIntegrationView | null>(null);
  const [step, setStep] = useState<Step>("list");
  const [busy, setBusy] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  const fetchIntegrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/accounting/integrations", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Entegrasyonlar yüklenemedi");
      }
      setIntegrations(result.integrations || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSelectProvider = (integration: AccountingIntegrationView) => {
    setSelectedProvider(integration);
    if (integration.connection?.status === "active") {
      setStep("settings");
    } else {
      setStep("connect");
      // Form alanlarını sıfırla
      setApiKey("");
      setApiSecret("");
      setCompanyCode("");
    }
  };

  const handleConnect = async () => {
    if (!selectedProvider) return;
    
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${selectedProvider.provider.id}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: {
            apiKey,
            apiSecret,
            companyCode,
          },
          fieldMappings: {},
          syncMode: "safe_hybrid",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Bağlantı kurulamadı");
      }
      
      // Başarılı - listeye dön
      await fetchIntegrations();
      setStep("list");
      setSelectedProvider(null);
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    if (!selectedProvider) return;
    
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${selectedProvider.provider.id}/test`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Bağlantı testi başarısız");
      }
      alert("✅ Bağlantı testi başarılı!");
    } catch (testError) {
      alert("❌ " + (testError instanceof Error ? testError.message : "Test hatası"));
    } finally {
      setBusy(false);
    }
  };

  const handleSync = async () => {
    if (!selectedProvider) return;
    
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${selectedProvider.provider.id}/sync`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Senkronizasyon başarısız");
      }
      alert("🔄 Senkronizasyon başlatıldı!");
      await fetchIntegrations();
    } catch (syncError) {
      alert("❌ " + (syncError instanceof Error ? syncError.message : "Senkronizasyon hatası"));
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedProvider) return;
    if (!confirm("Bağlantıyı kesmek istediğinize emin misiniz?")) return;
    
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/accounting/integrations/${selectedProvider.provider.id}/disconnect`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Bağlantı kesilemedi");
      }
      await fetchIntegrations();
      setStep("list");
      setSelectedProvider(null);
    } catch (disconnectError) {
      alert("❌ Bağlantı kesilemedi");
    } finally {
      setBusy(false);
    }
  };

  // İstatistikler
  const connectedCount = integrations.filter(i => i.connection?.status === "active").length;
  const totalFailed = integrations.reduce((sum, i) => sum + i.queueStats.failed, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ADIM 1: Liste Görünümü
  if (step === "list") {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fatura Entegrasyonu</h1>
            <p className="text-sm text-gray-500 mt-1">
              Online muhasebe programınızı tek tıkla bağlayın
            </p>
          </div>
          <button
            onClick={fetchIntegrations}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>

        {/* Özet Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Plug className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
                <p className="text-sm text-gray-500">Aktif Bağlantı</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
                <p className="text-sm text-gray-500">Toplam Sağlayıcı</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalFailed > 0 ? "bg-red-100" : "bg-gray-100"}`}>
                <MoreHorizontal className={`w-5 h-5 ${totalFailed > 0 ? "text-red-600" : "text-gray-600"}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totalFailed > 0 ? "text-red-600" : "text-gray-900"}`}>{totalFailed}</p>
                <p className="text-sm text-gray-500">Hatalı İşlem</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Sağlayıcı Listesi */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Muhasebe Programları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const isConnected = integration.connection?.status === "active";
              const hasError = integration.connection?.status === "error";
              const logo = PROVIDER_LOGOS[integration.provider.id] || { bg: "bg-gray-600", text: "text-white", abbr: "?" };

              return (
                <button
                  key={integration.provider.id}
                  onClick={() => handleSelectProvider(integration)}
                  className={`text-left bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                    isConnected 
                      ? "border-green-200 hover:border-green-300" 
                      : hasError 
                        ? "border-red-200 hover:border-red-300" 
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className={`w-14 h-14 rounded-xl ${logo.bg} ${logo.text} flex items-center justify-center text-xl font-bold shrink-0`}>
                      {logo.abbr}
                    </div>
                    
                    {/* Bilgiler */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{integration.provider.name}</h3>
                        {isConnected && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{integration.provider.description}</p>
                      
                      {/* Durum Badge */}
                      <div className="mt-3 flex items-center gap-2">
                        {isConnected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Plug className="w-3 h-3" />
                            Bağlı
                          </span>
                        ) : hasError ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3" />
                            Hata
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Unplug className="w-3 h-3" />
                            Bağlı Değil
                          </span>
                        )}
                        
                        {integration.connection?.lastSyncAt && (
                          <span className="text-xs text-gray-400">
                            Son: {new Date(integration.connection.lastSyncAt).toLocaleDateString("tr-TR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Yardım Kutusu */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Nasıl Çalışır?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 1. Yukarıdan kullandığınız muhasebe programını seçin</li>
                <li>• 2. API bilgilerinizi girin (Program ayarlarından bulabilirsiniz)</li>
                <li>• 3. Bağlantıyı test edin ve hazır!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADIM 2: Bağlantı Formu
  if (step === "connect" && selectedProvider) {
    const logo = PROVIDER_LOGOS[selectedProvider.provider.id] || { bg: "bg-gray-600", text: "text-white", abbr: "?" };
    
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Geri Butonu */}
          <button
            onClick={() => setStep("list")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Tüm Entegrasyonlara Dön
          </button>

          {/* Başlık */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${logo.bg} ${logo.text} flex items-center justify-center text-2xl font-bold`}>
                {logo.abbr}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedProvider.provider.name}</h1>
                <p className="text-gray-500">{selectedProvider.provider.description}</p>
              </div>
            </div>
          </div>

          {/* Bağlantı Formu */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">API Bağlantı Bilgileri</h2>
                <p className="text-sm text-gray-500">{selectedProvider.provider.name} hesabınızın bilgilerini girin</p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Anahtarı
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="örn: pk_live_..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {selectedProvider.provider.name} hesap ayarlarından API bölümünde bulabilirsiniz
                </p>
              </div>

              {/* API Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Gizli Anahtarı
                </label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Company Code (opsiyonel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Kodu <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  placeholder="örn: EZMEO2024"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Butonlar */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => setStep("list")}
                  className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleConnect}
                  disabled={busy || !apiKey || !apiSecret}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Bağlanıyor...
                    </>
                  ) : (
                    <>
                      <Plug className="w-4 h-4" />
                      Bağlan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Yardım Kutusu */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              API Bilgilerini Nasıl Bulurum?
            </h3>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>{selectedProvider.provider.name} hesabınıza giriş yapın</li>
              <li>Ayarlar veya Entegrasyonlar bölümüne gidin</li>
              <li>API veya Geliştirici sekmesini açın</li>
              <li>Yeni API anahtarı oluşturun ve bilgileri buraya yapıştırın</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // ADIM 3: Ayarlar / Durum
  if (step === "settings" && selectedProvider) {
    const logo = PROVIDER_LOGOS[selectedProvider.provider.id] || { bg: "bg-gray-600", text: "text-white", abbr: "?" };
    
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Geri Butonu */}
          <button
            onClick={() => setStep("list")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Tüm Entegrasyonlara Dön
          </button>

          {/* Başlık */}
          <div className="bg-white rounded-2xl border border-green-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${logo.bg} ${logo.text} flex items-center justify-center text-2xl font-bold`}>
                {logo.abbr}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{selectedProvider.provider.name}</h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </span>
                </div>
                <p className="text-gray-500">{selectedProvider.provider.description}</p>
              </div>
            </div>
          </div>

          {/* Durum Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900">{selectedProvider.queueStats.queued}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Hatalı</p>
              <p className={`text-2xl font-bold ${selectedProvider.queueStats.failed > 0 ? "text-red-600" : "text-gray-900"}`}>
                {selectedProvider.queueStats.failed}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Son Senkron</p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedProvider.connection?.lastSyncAt 
                  ? new Date(selectedProvider.connection.lastSyncAt).toLocaleString("tr-TR")
                  : "Henüz yapılmadı"}
              </p>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTest}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Bağlantıyı Test Et
              </button>
              <button
                onClick={handleSync}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Senkronize Et
              </button>
              <button
                onClick={handleDisconnect}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Unplug className="w-4 h-4" />
                Bağlantıyı Kes
              </button>
            </div>
          </div>

          {/* Webhook Bilgisi */}
          {selectedProvider.provider.supportsWebhook && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Webhook Desteği</h3>
                  <p className="text-sm text-blue-700">
                    Bu entegrasyon otomatik webhook desteğine sahip. Fatura durumları anında senkronize edilecektir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
