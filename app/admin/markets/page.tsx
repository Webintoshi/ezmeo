"use client";

import { useState, useEffect } from "react";
import {
  getMarketplaces,
  addMarketplace,
  deleteMarketplace,
  testMarketplaceConnection,
  syncProductsToMarketplace,
  syncOrdersFromMarketplace,
  syncInventory,
  getOverallMarketplaceStats,
} from "@/lib/marketplaces";
import {
  MARKETPLACES,
  MarketplaceConfig,
  MarketplaceType,
  MarketplaceStatus,
  SyncType,
} from "@/types/marketplace";
import {
  Plus,
  Link2,
  RefreshCw,
  Package,
  ShoppingBag,
  Warehouse,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  TestTube,
  ExternalLink,
  Clock,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function MarketsPage() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceType | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [syncSettings, setSyncSettings] = useState({
    autoSyncProducts: true,
    autoSyncOrders: true,
    autoSyncInventory: true,
  });
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, any>>({});
  const [overallStats, setOverallStats] = useState<ReturnType<typeof getOverallMarketplaceStats> | null>(null);

  useEffect(() => {
    const data = getMarketplaces();
    setMarketplaces([...data]);
    setOverallStats(getOverallMarketplaceStats());
  }, []);

  const handleAddMarketplace = async () => {
    if (!selectedMarketplace) return;

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const marketplaceInfo = MARKETPLACES.find(m => m.type === selectedMarketplace)!;
    const newMarketplace = addMarketplace({
      type: selectedMarketplace,
      name: marketplaceInfo.name,
      logo: marketplaceInfo.logo,
      color: marketplaceInfo.color,
      status: "connected", // Force connected for demo purposes
      credentials,
      syncSettings: {
        autoSyncProducts: syncSettings.autoSyncProducts,
        autoSyncOrders: syncSettings.autoSyncOrders,
        autoSyncInventory: syncSettings.autoSyncInventory,
        syncInterval: 60,
      },
    });

    setMarketplaces([...marketplaces, newMarketplace]);
    setShowAddModal(false);
    setSelectedMarketplace(null);
    setCredentials({});
    setSyncSettings({
      autoSyncProducts: true,
      autoSyncOrders: true,
      autoSyncInventory: true,
    });
    setSaving(false);
  };

  const handleTestConnection = async (id: string) => {
    setTesting(id);
    const result = await testMarketplaceConnection(id);
    setTesting(null);

    if (result.success) {
      alert("Bağlantı başarılı!");
    } else {
      alert(`Hata: ${result.error}`);
    }
  };

  const handleSync = async (id: string, type: SyncType) => {
    setSyncing(id);

    let result;
    switch (type) {
      case "products":
        result = await syncProductsToMarketplace(id);
        break;
      case "orders":
        result = await syncOrdersFromMarketplace(id);
        break;
      case "inventory":
        result = await syncInventory(id);
        break;
      default:
        result = await syncProductsToMarketplace(id);
    }

    setSyncResults({ ...syncResults, [id]: result });
    setSyncing(null);

    const updated = getMarketplaces();
    setMarketplaces(updated);
    setOverallStats(getOverallMarketplaceStats());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu pazar yerini silmek istediğinize emin misiniz?")) {
      return;
    }

    deleteMarketplace(id);
    const updated = getMarketplaces();
    setMarketplaces(updated);
    setOverallStats(getOverallMarketplaceStats());
  };

  const getStatusBadge = (status: MarketplaceStatus) => {
    const statusConfig: Record<
      MarketplaceStatus,
      { label: string; color: string; icon: any }
    > = {
      connected: { label: "Bağlı", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle },
      disconnected: { label: "Bağlı Değil", color: "bg-gray-50 text-gray-600 border-gray-100", icon: XCircle },
      error: { label: "Hata", color: "bg-red-50 text-red-700 border-red-100", icon: AlertCircle },
      syncing: { label: "Senkronize", color: "bg-blue-50 text-blue-700 border-blue-100", icon: RefreshCw },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
        <Icon className={`w-3 h-3 ${status === "syncing" ? "animate-spin" : ""}`} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pazar Yeri Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Mağazalarınızı tek noktadan senkronize edin ve yönetin.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Mağaza Entegre Et
        </button>
      </div>

      {/* Stats Cards */}
      {overallStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Entegrasyonlar", value: overallStats.totalMarketplaces, icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Aktif Bağlantı", value: overallStats.connected, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Toplam Ürün", value: overallStats.totalProducts, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Gelen Sipariş", value: overallStats.totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Marketplaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MARKETPLACES.map((marketplace) => {
          const connected = marketplaces.find(m => m.type === marketplace.type);
          return (
            <div
              key={marketplace.type}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col h-full"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${marketplace.color} flex items-center justify-center text-3xl shadow-sm transform group-hover:scale-110 transition-transform`}>
                    {marketplace.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{marketplace.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{marketplace.description}</p>
                  </div>
                </div>
                {connected && getStatusBadge(connected.status)}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 space-y-6">
                {connected ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Senkronize Ürün</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{connected.stats.syncedProducts}</p>
                      </div>
                      <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Toplam Sipariş</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{connected.stats.totalOrders}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hızlı İşlemler</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSync(connected.id, "products")}
                          disabled={syncing === connected.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all text-xs font-medium disabled:opacity-50"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Ürünleri Gönder
                        </button>
                        <button
                          onClick={() => handleSync(connected.id, "orders")}
                          disabled={syncing === connected.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-all text-xs font-medium disabled:opacity-50"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Siparişleri Al
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {connected.lastSyncAt ? format(connected.lastSyncAt, "d MMM HH:mm", { locale: tr }) : "Henüz senkronize edilmedi"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                      <Link2 className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Entegrasyon Hazır</p>
                      <p className="text-xs text-gray-500 mt-1 px-4">Mağazanızı bağlayarak satışlarınızı otomatize edin.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMarketplace(marketplace.type);
                        setShowAddModal(true);
                      }}
                      className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-bold"
                    >
                      ŞİMDİ BAĞLA
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              {connected && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSync(connected.id, "all")}
                      disabled={syncing === connected.id}
                      className={`p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all ${syncing === connected.id ? "animate-spin" : ""}`}
                      title="Tam Senkronizasyon"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleTestConnection(connected.id)}
                      disabled={testing === connected.id}
                      className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                      title="Bağlantıyı Test Et"
                    >
                      <TestTube className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => window.open(marketplace.website, "_blank")}
                      className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                      title="Pazaryeri Paneli"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(connected.id)}
                      className="p-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all"
                      title="Entegrasyonu Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && selectedMarketplace && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-br ${MARKETPLACES.find(m => m.type === selectedMarketplace)?.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-4xl shadow-inner">
                    {MARKETPLACES.find(m => m.type === selectedMarketplace)?.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">{MARKETPLACES.find(m => m.type === selectedMarketplace)?.name} Entegrasyonu</h3>
                    <p className="text-white/80 text-xs font-medium">Lütfen API bilgilerinizi eksiksiz giriniz.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedMarketplace(null);
                    setCredentials({});
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  <XCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Credentials Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-gray-900 rounded-full"></div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">API Bilgileri</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {MARKETPLACES.find(m => m.type === selectedMarketplace)?.requires.map(field => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                        {field === "apiKey" ? "API Anahtarı" :
                          field === "apiSecret" ? "API Secret (Gizli)" :
                            field === "merchantId" ? "Mağaza (Merchant) ID" :
                              field === "sellerId" ? "Satıcı ID" :
                                field === "accessKey" ? "Access Key" :
                                  field === "secretKey" ? "Secret Key" :
                                    field === "shopId" ? "Mağaza ID" :
                                      field === "appId" ? "Uygulama (App) ID" :
                                        field === "certId" ? "Certificate ID" :
                                          field === "devId" ? "Developer ID" :
                                            field === "token" ? "Erişim Tokenı" :
                                              field === "appKey" ? "App Key" :
                                                field === "appSecret" ? "App Secret" :
                                                  field === "storeUrl" ? "Mağaza URL" :
                                                    field === "username" ? "Kullanıcı Adı" :
                                                      field === "password" ? "Şifre" :
                                                        field}
                      </label>
                      <input
                        type={field === "password" || field === "apiSecret" || field === "secretKey" || field === "appSecret" || field === "token" ? "password" : "text"}
                        value={credentials[field] || ""}
                        onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all text-sm font-medium"
                        placeholder={`${field} bilgisi...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-gray-900 rounded-full"></div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Senkronizasyon Ayarları</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { key: "autoSyncProducts", label: "Ürünleri otomatik aktar", icon: Package },
                    { key: "autoSyncOrders", label: "Siparişleri anlık takip et", icon: ShoppingBag },
                    { key: "autoSyncInventory", label: "Stok adetlerini eşitle", icon: Warehouse },
                  ].map((setting) => (
                    <label key={setting.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <setting.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                        <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={syncSettings[setting.key as keyof typeof syncSettings]}
                        onChange={(e) => setSyncSettings({ ...syncSettings, [setting.key]: e.target.checked })}
                        className="w-5 h-5 rounded-md border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedMarketplace(null);
                    setCredentials({});
                  }}
                  className="flex-1 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all text-sm font-bold"
                >
                  VAZGEÇ
                </button>
                <button
                  onClick={handleAddMarketplace}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-bold shadow-lg shadow-gray-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {saving ? "BAĞLANILIYOR..." : "ENTEGRASYONU TAMAMLA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
