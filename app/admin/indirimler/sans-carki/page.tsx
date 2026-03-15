"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Gift, Play, RefreshCw, Save, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LuckyWheelConfig, LuckyWheelPrize, LuckyWheelSpin, LuckyWheelStats } from "@/types/lucky-wheel";

type LuckyWheelTab = "config" | "prizes" | "spins";

type PrizeDraft = Omit<LuckyWheelPrize, "id" | "created_at" | "updated_at"> & { id?: string };

function defaultConfig(): LuckyWheelConfig {
  const now = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 12);
  return {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Şans Çarkı",
    is_active: false,
    start_date: now.toISOString(),
    end_date: end.toISOString(),
    max_total_spins: 1000,
    max_spins_per_user: 1,
    cooldown_hours: 24,
    probability_mode: "percentage",
    require_membership: false,
    require_email_verified: false,
    wheel_segments: 8,
    primary_color: "#FF6B35",
    secondary_color: "#FFE66D",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

function toDateInput(value: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function createDefaultPrize(order: number): PrizeDraft {
  return {
    config_id: "00000000-0000-0000-0000-000000000001",
    name: `Ödül ${order}`,
    description: null,
    prize_type: "coupon",
    probability_value: 0,
    stock_total: 100,
    stock_remaining: 100,
    is_unlimited_stock: false,
    color_hex: "#FFFFFF",
    icon_emoji: "🎁",
    image_url: null,
    display_order: order,
    is_active: true,
    coupon_prefix: "WHEEL",
    coupon_type: "percentage",
    coupon_value: 10,
    coupon_min_order: 0,
    coupon_validity_hours: 168,
  };
}

export default function LuckyWheelAdminPage() {
  const [activeTab, setActiveTab] = useState<LuckyWheelTab>("config");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [config, setConfig] = useState<LuckyWheelConfig>(defaultConfig());
  const [prizes, setPrizes] = useState<PrizeDraft[]>([]);
  const [spins, setSpins] = useState<LuckyWheelSpin[]>([]);
  const [stats, setStats] = useState<LuckyWheelStats | null>(null);
  const [simulationSummary, setSimulationSummary] = useState<string>("");

  const probabilityTotal = useMemo(
    () => prizes.filter((item) => item.is_active).reduce((sum, item) => sum + Number(item.probability_value || 0), 0),
    [prizes],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [configResponse, prizesResponse, spinsResponse] = await Promise.all([
        fetch("/api/admin/discounts/lucky-wheel/config", { cache: "no-store" }),
        fetch("/api/admin/discounts/lucky-wheel/prizes", { cache: "no-store" }),
        fetch("/api/admin/discounts/lucky-wheel/spins?limit=200", { cache: "no-store" }),
      ]);

      const [configResult, prizesResult, spinsResult] = await Promise.all([
        configResponse.json(),
        prizesResponse.json(),
        spinsResponse.json(),
      ]);

      if (!configResponse.ok || !configResult.success) {
        throw new Error(configResult?.error || "Şans çarkı konfigürasyonu alınamadı.");
      }
      if (!prizesResponse.ok || !prizesResult.success) {
        throw new Error(prizesResult?.error || "Şans çarkı ödülleri alınamadı.");
      }
      if (!spinsResponse.ok || !spinsResult.success) {
        throw new Error(spinsResult?.error || "Şans çarkı spin verileri alınamadı.");
      }

      if (configResult.config) {
        setConfig(configResult.config as LuckyWheelConfig);
      }
      setPrizes((prizesResult.prizes || []) as PrizeDraft[]);
      setSpins((spinsResult.spins || []) as LuckyWheelSpin[]);
      setStats((spinsResult.stats || null) as LuckyWheelStats | null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveConfig = async () => {
    const payload = {
      ...config,
      start_date: toDateInput(config.start_date),
      end_date: toDateInput(config.end_date),
    };

    const response = await fetch("/api/admin/discounts/lucky-wheel/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: payload }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result?.error || "Konfigürasyon kaydedilemedi.");
    }
    setConfig(result.config as LuckyWheelConfig);
  };

  const handleSavePrizes = async () => {
    const normalizedPrizes = prizes.map((item, index) => ({
      ...item,
      config_id: config.id,
      display_order: index + 1,
      stock_total: Number(item.stock_total || 0),
      stock_remaining: item.is_unlimited_stock ? Number(item.stock_total || 0) : Number(item.stock_remaining ?? item.stock_total ?? 0),
      probability_value: Number(item.probability_value || 0),
      coupon_value: item.prize_type === "coupon" ? Number(item.coupon_value || 0) : null,
      coupon_min_order: item.prize_type === "coupon" ? Number(item.coupon_min_order || 0) : null,
      coupon_validity_hours: item.prize_type === "coupon" ? Number(item.coupon_validity_hours || 168) : null,
      coupon_prefix: item.prize_type === "coupon" ? item.coupon_prefix || "WHEEL" : null,
      coupon_type: item.prize_type === "coupon" ? item.coupon_type || "percentage" : null,
    }));

    const response = await fetch("/api/admin/discounts/lucky-wheel/prizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configId: config.id, prizes: normalizedPrizes }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result?.error || "Ödüller kaydedilemedi.");
    }
    setPrizes((result.prizes || []) as PrizeDraft[]);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await handleSavePrizes();
      await handleSaveConfig();
      await loadData();
      toast.success("Şans çarkı ayarları kaydedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kayıt işlemi başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setSimulationSummary("");
    try {
      const response = await fetch("/api/admin/discounts/lucky-wheel/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: config.id, spinCount: 1000 }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Simülasyon çalıştırılamadı.");
      }

      const simulation = result.simulation;
      const winners = (simulation.prizeResults || [])
        .filter((item: { prizeName: string }) => !item.prizeName.toLowerCase().includes("şansını"))
        .reduce((sum: number, item: { won: number }) => sum + Number(item.won || 0), 0);
      const summary = `1000 spin simülasyonu tamamlandı. Kazanan spin: ${winners}, kazanma oranı: ${Number(simulation.winnerRate || 0).toFixed(2)}%`;
      setSimulationSummary(summary);
      toast.success("Simülasyon tamamlandı.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Simülasyon hatası.");
    } finally {
      setSimulating(false);
    }
  };

  const updatePrize = (index: number, field: keyof PrizeDraft, value: unknown) => {
    setPrizes((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removePrize = (index: number) => {
    setPrizes((current) => current.filter((_, itemIndex) => itemIndex !== index).map((item, order) => ({ ...item, display_order: order + 1 })));
  };

  const addPrize = () => {
    setPrizes((current) => [...current, createDefaultPrize(current.length + 1)]);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Şans Çarkı Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">İndirimler kapsamında tekil kupon üreten şans çarkı paneli.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {simulating ? "Simüle ediliyor..." : "1000 Spin Simüle Et"}
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "config", title: "Yapılandırma", icon: Settings },
          { id: "prizes", title: "Ödüller", icon: Gift },
          { id: "spins", title: "Spinler", icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as LuckyWheelTab)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.title}
          </button>
        ))}
      </div>

      {simulationSummary && <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">{simulationSummary}</div>}

      {activeTab === "config" && (
        <div className="grid gap-5 md:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Genel Ayarlar</h2>
            <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <span>Aktif</span>
              <input type="checkbox" checked={config.is_active} onChange={(event) => setConfig((prev) => ({ ...prev, is_active: event.target.checked }))} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-600">Kampanya Adı</span>
              <input className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.name} onChange={(event) => setConfig((prev) => ({ ...prev, name: event.target.value }))} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Başlangıç</span>
                <input type="date" className="w-full rounded-xl border border-gray-200 px-3 py-2" value={toDateInput(config.start_date)} onChange={(event) => setConfig((prev) => ({ ...prev, start_date: event.target.value }))} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Bitiş</span>
                <input type="date" className="w-full rounded-xl border border-gray-200 px-3 py-2" value={toDateInput(config.end_date)} onChange={(event) => setConfig((prev) => ({ ...prev, end_date: event.target.value }))} />
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Kurallar ve Görünüm</h2>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Toplam Spin</span>
                <input type="number" className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.max_total_spins} onChange={(event) => setConfig((prev) => ({ ...prev, max_total_spins: Number(event.target.value || 0) }))} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Kişi Başı</span>
                <input type="number" className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.max_spins_per_user} onChange={(event) => setConfig((prev) => ({ ...prev, max_spins_per_user: Number(event.target.value || 0) }))} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Cooldown (saat)</span>
                <input type="number" className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.cooldown_hours} onChange={(event) => setConfig((prev) => ({ ...prev, cooldown_hours: Number(event.target.value || 0) }))} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Olasılık Modu</span>
                <select className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.probability_mode} onChange={(event) => setConfig((prev) => ({ ...prev, probability_mode: event.target.value as LuckyWheelConfig["probability_mode"] }))}>
                  <option value="percentage">Yüzde</option>
                  <option value="weight">Ağırlık</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Segment Sayısı</span>
                <input type="number" min={2} max={24} className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.wheel_segments} onChange={(event) => setConfig((prev) => ({ ...prev, wheel_segments: Number(event.target.value || 2) }))} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Ana Renk</span>
                <input className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.primary_color} onChange={(event) => setConfig((prev) => ({ ...prev, primary_color: event.target.value }))} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">İkinci Renk</span>
                <input className="w-full rounded-xl border border-gray-200 px-3 py-2" value={config.secondary_color} onChange={(event) => setConfig((prev) => ({ ...prev, secondary_color: event.target.value }))} />
              </label>
            </div>
          </section>
        </div>
      )}

      {activeTab === "prizes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Aktif ödül olasılık toplamı: <strong>{probabilityTotal.toFixed(2)}%</strong>
              {config.probability_mode === "percentage" && Math.abs(probabilityTotal - 100) > 0.001 && <span className="ml-2 text-red-600">Yüzde modunda 100 olmalıdır.</span>}
            </p>
            <button onClick={addPrize} className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
              Ödül Ekle
            </button>
          </div>
          <div className="space-y-4">
            {prizes.map((prize, index) => (
              <article key={prize.id || `draft-${index}`} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-6">
                  <input className="rounded-xl border border-gray-200 px-3 py-2 md:col-span-2" value={prize.name} onChange={(event) => updatePrize(index, "name", event.target.value)} placeholder="Ödül adı" />
                  <select className="rounded-xl border border-gray-200 px-3 py-2" value={prize.prize_type} onChange={(event) => updatePrize(index, "prize_type", event.target.value as PrizeDraft["prize_type"])}>
                    <option value="coupon">Kupon</option>
                    <option value="none">Ödül Yok</option>
                  </select>
                  <input type="number" step="0.01" className="rounded-xl border border-gray-200 px-3 py-2" value={prize.probability_value} onChange={(event) => updatePrize(index, "probability_value", Number(event.target.value || 0))} placeholder="Olasılık" />
                  <input type="number" className="rounded-xl border border-gray-200 px-3 py-2" value={prize.stock_total} onChange={(event) => updatePrize(index, "stock_total", Number(event.target.value || 0))} placeholder="Toplam stok" />
                  <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm">
                    <span>Aktif</span>
                    <input type="checkbox" checked={prize.is_active} onChange={(event) => updatePrize(index, "is_active", event.target.checked)} />
                  </label>
                </div>

                {prize.prize_type === "coupon" && (
                  <div className="grid gap-3 md:grid-cols-5">
                    <input className="rounded-xl border border-gray-200 px-3 py-2" value={prize.coupon_prefix || ""} onChange={(event) => updatePrize(index, "coupon_prefix", event.target.value)} placeholder="Kupon prefix" />
                    <select className="rounded-xl border border-gray-200 px-3 py-2" value={prize.coupon_type || "percentage"} onChange={(event) => updatePrize(index, "coupon_type", event.target.value as PrizeDraft["coupon_type"])}>
                      <option value="percentage">Yüzde</option>
                      <option value="fixed">Sabit</option>
                    </select>
                    <input type="number" step="0.01" className="rounded-xl border border-gray-200 px-3 py-2" value={prize.coupon_value || 0} onChange={(event) => updatePrize(index, "coupon_value", Number(event.target.value || 0))} placeholder="Kupon değeri" />
                    <input type="number" step="0.01" className="rounded-xl border border-gray-200 px-3 py-2" value={prize.coupon_min_order || 0} onChange={(event) => updatePrize(index, "coupon_min_order", Number(event.target.value || 0))} placeholder="Min sipariş" />
                    <input type="number" className="rounded-xl border border-gray-200 px-3 py-2" value={prize.coupon_validity_hours || 168} onChange={(event) => updatePrize(index, "coupon_validity_hours", Number(event.target.value || 168))} placeholder="Geçerlilik saati" />
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-4">
                  <input className="rounded-xl border border-gray-200 px-3 py-2" value={prize.color_hex} onChange={(event) => updatePrize(index, "color_hex", event.target.value)} placeholder="#FFFFFF" />
                  <input className="rounded-xl border border-gray-200 px-3 py-2" value={prize.icon_emoji || ""} onChange={(event) => updatePrize(index, "icon_emoji", event.target.value)} placeholder="Emoji" />
                  <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm">
                    <span>Sınırsız stok</span>
                    <input type="checkbox" checked={prize.is_unlimited_stock} onChange={(event) => updatePrize(index, "is_unlimited_stock", event.target.checked)} />
                  </label>
                  <button onClick={() => removePrize(index)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === "spins" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase text-gray-500">Toplam Spin</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.totalSpins || 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase text-gray-500">Tekil Kullanıcı</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.uniqueUsers || 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase text-gray-500">Kazanan</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.winners || 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase text-gray-500">Kazanma Oranı</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{(stats?.winRate || 0).toFixed(2)}%</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tarih</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kullanıcı</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Ödül</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kupon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {spins.map((spin) => (
                  <tr key={spin.id}>
                    <td className="px-4 py-3 text-gray-600">{new Date(spin.created_at).toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3 text-gray-700">{spin.user_name || spin.user_email || spin.user_phone || "Anonim"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-1 text-xs font-medium", spin.is_winner ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                        {spin.prize_name || "Ödül yok"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{spin.coupon_code || "-"}</td>
                  </tr>
                ))}
                {spins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      Henüz spin kaydı bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
