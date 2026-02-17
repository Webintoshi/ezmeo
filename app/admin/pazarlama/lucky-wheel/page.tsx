"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Settings, Gift, BarChart3, Save, Play, 
  Plus, Trash2, Eye, EyeOff, RefreshCw,
  TrendingUp, Users, Trophy, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Prize {
  id?: string;
  name: string;
  description: string;
  prize_type: string;
  coupon_code?: string;
  coupon_discount_percent?: number;
  coupon_discount_amount?: number;
  probability_value: number;
  stock_total: number;
  stock_remaining: number;
  is_unlimited_stock: boolean;
  color_hex: string;
  icon_emoji: string;
  display_order: number;
  is_active: boolean;
}

interface Config {
  id: string;
  name: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  max_total_spins: number;
  max_spins_per_user: number;
  cooldown_hours: number;
  probability_mode: string;
  require_membership: boolean;
  require_email_verified: boolean;
  wheel_segments: number;
  primary_color: string;
  secondary_color: string;
}

interface Stats {
  totalSpins: number;
  uniqueUsers: number;
  winners: number;
  winRate: number;
  prizeDistribution: { prizeName: string; count: number; percentage: number }[];
  dailySpins: { date: string; count: number }[];
}

export default function LuckyWheelAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'config' | 'prizes' | 'stats'>('config');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  
  const [config, setConfig] = useState<Config>({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Ezmeo Şans Çarkı',
    is_active: false,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    max_total_spins: 1000,
    max_spins_per_user: 1,
    cooldown_hours: 24,
    probability_mode: 'percentage',
    require_membership: false,
    require_email_verified: false,
    wheel_segments: 12,
    primary_color: '#FF6B35',
    secondary_color: '#FFE66D'
  });
  
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configRes, prizesRes, statsRes] = await Promise.all([
        fetch('/api/lucky-wheel/admin'),
        fetch('/api/lucky-wheel/admin?action=prizes'),
        fetch('/api/lucky-wheel/admin?action=stats')
      ]);

      const [configData, prizesData, statsData] = await Promise.all([
        configRes.json(),
        prizesRes.json(),
        statsRes.json()
      ]);

      if (configData.success && configData.configs?.length > 0) {
        const c = configData.configs[0];
        setConfig({
          ...c,
          start_date: c.start_date?.split('T')[0] || '',
          end_date: c.end_date?.split('T')[0] || ''
        });
      }

      if (prizesData.success && prizesData.prizes) {
        setPrizes(prizesData.prizes);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Load data error:", error);
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/lucky-wheel/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          config,
          prizes
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Şans çarkı yapılandırması kaydedildi');
        loadData();
      } else {
        toast.error(data.error || 'Kaydetme sırasında hata oluştu');
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/lucky-wheel/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate',
          configId: config.id
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Simülasyon tamamlandı (1000 spin)');
        console.log('Simulation results:', data.simulation);
      } else {
        toast.error(data.error || 'Simülasyon sırasında hata oluştu');
      }
    } catch (error) {
      console.error("Simulate error:", error);
      toast.error('Simülasyon sırasında hata oluştu');
    } finally {
      setSimulating(false);
    }
  };

  const addPrize = () => {
    const newPrize: Prize = {
      name: 'Yeni Ödül',
      description: '',
      prize_type: 'coupon',
      probability_value: 0,
      stock_total: 10,
      stock_remaining: 10,
      is_unlimited_stock: false,
      color_hex: '#FFFFFF',
      icon_emoji: '🎁',
      display_order: prizes.length + 1,
      is_active: true
    };
    setPrizes([...prizes, newPrize]);
  };

  const updatePrize = (index: number, field: string, value: any) => {
    const updated = [...prizes];
    (updated[index] as any)[field] = value;
    setPrizes(updated);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const totalProbability = prizes.reduce((sum, p) => sum + (p.probability_value || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Şans Çarkı Yönetimi</h1>
          <p className="text-gray-500">Kampanya ayarlarınızı buradan yapılandırın</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {simulating ? 'Simüle Ediliyor...' : 'Simüle Et'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('config')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
            activeTab === 'config'
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <Settings className="w-4 h-4" />
          Yapılandırma
        </button>
        <button
          onClick={() => setActiveTab('prizes')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
            activeTab === 'prizes'
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <Gift className="w-4 h-4" />
          Ödüller
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
            activeTab === 'stats'
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <BarChart3 className="w-4 h-4" />
          İstatistikler
        </button>
      </div>

      {activeTab === 'config' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-900">Genel Ayarlar</h3>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">Aktif</span>
              <button
                onClick={() => setConfig({ ...config, is_active: !config.is_active })}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  config.is_active ? "bg-green-500" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                  config.is_active ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Adı</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                <input
                  type="date"
                  value={config.start_date}
                  onChange={(e) => setConfig({ ...config, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                <input
                  type="date"
                  value={config.end_date}
                  onChange={(e) => setConfig({ ...config, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-900">Spin Limitleri</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toplam</label>
                <input
                  type="number"
                  value={config.max_total_spins}
                  onChange={(e) => setConfig({ ...config, max_total_spins: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Başı</label>
                <input
                  type="number"
                  value={config.max_spins_per_user}
                  onChange={(e) => setConfig({ ...config, max_spins_per_user: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bekleme (saat)</label>
                <input
                  type="number"
                  value={config.cooldown_hours}
                  onChange={(e) => setConfig({ ...config, cooldown_hours: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Olasılık Modu</label>
              <select
                value={config.probability_mode}
                onChange={(e) => setConfig({ ...config, probability_mode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl"
              >
                <option value="percentage">Yüzde (%)</option>
                <option value="weight">Ağırlık</option>
              </select>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.require_membership}
                  onChange={(e) => setConfig({ ...config, require_membership: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Üyelik zorunlu</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.require_email_verified}
                  onChange={(e) => setConfig({ ...config, require_email_verified: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">Email onayı zorunlu</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-900">Görsel Ayarlar</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segment Sayısı</label>
                <input
                  type="number"
                  value={config.wheel_segments}
                  onChange={(e) => setConfig({ ...config, wheel_segments: parseInt(e.target.value) || 8 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  min={4}
                  max={12}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ana Renk</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İkinci Renk</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prizes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Ödüller</h3>
              <p className="text-sm text-gray-500">
                Toplam olasılık: {totalProbability.toFixed(1)}% 
                {totalProbability !== 100 && (
                  <span className="text-red-500 ml-2">(100% olmalı)</span>
                )}
              </p>
            </div>
            <button
              onClick={addPrize}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ödül Ekle
            </button>
          </div>

          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 border border-gray-200 flex gap-4 items-start"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: prize.color_hex + '20' }}
                >
                  {prize.icon_emoji}
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => updatePrize(index, 'name', e.target.value)}
                    placeholder="Ödül adı"
                    className="px-3 py-2 border border-gray-200 rounded-lg font-medium"
                  />
                  <input
                    type="text"
                    value={prize.description}
                    onChange={(e) => updatePrize(index, 'description', e.target.value)}
                    placeholder="Açıklama"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={prize.probability_value}
                      onChange={(e) => updatePrize(index, 'probability_value', parseFloat(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg"
                      placeholder="%"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={prize.stock_total}
                      onChange={(e) => updatePrize(index, 'stock_total', parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg"
                      placeholder="Stok"
                    />
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={prize.is_unlimited_stock}
                        onChange={(e) => updatePrize(index, 'is_unlimited_stock', e.target.checked)}
                        className="w-3 h-3"
                      />
                      Sınırsız
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updatePrize(index, 'is_active', !prize.is_active)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      prize.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {prize.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removePrize(index)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Toplam Spin</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSpins}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Tekil Kullanıcı</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.uniqueUsers}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Kazanan</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.winners}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Kazanma Oranı</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.winRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Ödül Dağılımı</h3>
            <div className="space-y-3">
              {stats.prizeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium truncate">{item.prizeName}</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-sm text-gray-600">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
