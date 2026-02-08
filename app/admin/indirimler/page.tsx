"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDiscounts, deleteDiscount, bulkDeleteDiscounts, duplicateDiscount } from "@/lib/discounts";
import { Discount, DiscountStatus, DiscountType } from "@/types/discount";
import {
  Percent,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Users,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Grid,
  List as ListIcon,
  Tag,
  Gift,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiscountStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<DiscountType | "all">("all");
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"name" | "value" | "startDate" | "usage">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const loadDiscounts = () => {
    const data = getDiscounts();
    setDiscounts([...data]);
  };

  useEffect(() => {
    // Timeout to avoid cascading render warning in development
    const timer = setTimeout(() => {
      setDiscounts([...getDiscounts()]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Bu indirim kodunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      deleteDiscount(id);
      loadDiscounts();
      setSelectedDiscounts(prev => prev.filter(did => did !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedDiscounts.length === 0) return;
    if (confirm(`${selectedDiscounts.length} indirim kodunu silmek istediğinizden emin misiniz?`)) {
      bulkDeleteDiscounts(selectedDiscounts);
      loadDiscounts();
      setSelectedDiscounts([]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDiscounts(filteredDiscounts.map(d => d.id));
    } else {
      setSelectedDiscounts([]);
    }
  };

  const handleSelectDiscount = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDiscounts(prev => [...prev, id]);
    } else {
      setSelectedDiscounts(prev => prev.filter(did => did !== id));
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateDiscount(id);
    loadDiscounts();
  };

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || discount.status === statusFilter;
    const matchesType = typeFilter === "all" || discount.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedDiscounts = [...filteredDiscounts].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") comparison = a.name.localeCompare(b.name);
    else if (sortBy === "value") comparison = a.value - b.value;
    else if (sortBy === "startDate") comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    else if (sortBy === "usage") comparison = a.usedCount - b.usedCount;
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const stats = {
    total: discounts.length,
    active: discounts.filter(d => d.status === "active").length,
    scheduled: discounts.filter(d => d.status === "scheduled").length,
    expired: discounts.filter(d => d.status === "expired").length,
    totalUsage: discounts.reduce((sum, d) => sum + d.usedCount, 0),
    averageUsage: discounts.length > 0 ? Math.round(discounts.reduce((sum, d) => sum + d.usedCount, 0) / discounts.length) : 0,
  };

  const getStatusConfig = (status: DiscountStatus) => {
    switch (status) {
      case "active": return { label: "Aktif", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
      case "scheduled": return { label: "Planlandı", color: "text-blue-600 bg-blue-50 border-blue-100" };
      case "expired": return { label: "Süresi Doldu", color: "text-rose-600 bg-rose-50 border-rose-100" };
      case "draft": return { label: "Taslak", color: "text-slate-600 bg-slate-50 border-slate-100" };
      default: return { label: status, color: "text-slate-600 bg-slate-50 border-slate-100" };
    }
  };

  const getTypeIcon = (type: DiscountType) => {
    switch (type) {
      case "percentage": return Percent;
      case "fixed": return DollarSign;
      case "shipping": return Package;
      case "bogo": return Gift;
      default: return Percent;
    }
  };

  const isExpiringSoon = (endDate: string | Date) => {
    const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-8 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
            <Tag className="w-3.5 h-3.5" />
            İndirimler & Kampanyalar
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">İndirimleri Yönet</h1>
          <p className="text-gray-500 text-sm max-w-lg">
            Müşterileriniz için özel teklifler ve indirim kodları oluşturarak sadakati ve satışlarınızı artırın.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadDiscounts}
            className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/admin/indirimler/yeni"
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/10"
          >
            <Plus className="w-4 h-4" />
            YENİ İNDİRİM
          </Link>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: Percent, label: "Toplam", value: stats.total, color: "blue" },
          { icon: CheckCircle, label: "Aktif", value: stats.active, color: "emerald" },
          { icon: Clock, label: "Planlandı", value: stats.scheduled, color: "blue" },
          { icon: AlertTriangle, label: "Süresi Doldu", value: stats.expired, color: "rose" },
          { icon: Users, label: "Kullanım", value: stats.totalUsage, color: "amber" },
          { icon: TrendingUp, label: "Ort. Kullanım", value: stats.averageUsage, color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
            <div className={`w-10 h-10 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative z-10`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 relative z-10">{stat.value}</p>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${stat.color}-500/5 rounded-full -mr-10 -mt-10 blur-2xl`}></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="text"
              placeholder="İndirim ara (isim, kod)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-900/5 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DiscountStatus | "all")}
                className="pl-9 pr-10 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 focus:bg-white focus:border-gray-200 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">TÜM DURUMLAR</option>
                <option value="active">AKTİF</option>
                <option value="scheduled">PLANLANDI</option>
                <option value="expired">SÜRESİ DOLDU</option>
                <option value="draft">TASLAK</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative group">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as DiscountType | "all")}
                className="pl-9 pr-10 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 focus:bg-white focus:border-gray-200 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">TÜM TİPLER</option>
                <option value="percentage">YÜZDE</option>
                <option value="fixed">SABİT</option>
                <option value="shipping">KARGO</option>
                <option value="bogo">2 AL 1 ÖDE</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative group">
              <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSort, newOrder] = e.target.value.split('-') as [any, any];
                  setSortBy(newSort);
                  setSortOrder(newOrder);
                }}
                className="pl-9 pr-10 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 focus:bg-white focus:border-gray-200 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="name-asc">İSİM A-Z</option>
                <option value="name-desc">İSİM Z-A</option>
                <option value="value-asc">DEĞER ARTAN</option>
                <option value="value-desc">DEĞER AZALAN</option>
                <option value="usage-desc">KULLANIM</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  viewMode === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {selectedDiscounts.length > 0 && (
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-gray-500">
                <span className="text-gray-900">{selectedDiscounts.length}</span> İNDİRİM SEÇİLDİ
              </p>
              <button
                onClick={() => setSelectedDiscounts([])}
                className="text-xs font-black text-gray-400 hover:text-gray-900 transition-colors"
              >
                TEMİZLE
              </button>
            </div>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl hover:bg-rose-100 transition-all flex items-center gap-2 tracking-widest"
            >
              <Trash2 className="w-3.5 h-3.5" />
              TOPLU SİL
            </button>
          </div>
        )}
      </div>

      {/* Content View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedDiscounts.map((discount) => {
            const TypeIcon = getTypeIcon(discount.type);
            const statusConfig = getStatusConfig(discount.status);
            return (
              <div
                key={discount.id}
                className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  {/* Card Front */}
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                      <TypeIcon className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(discount.id)}
                        onChange={(e) => handleSelectDiscount(discount.id, e.target.checked)}
                        className="w-5 h-5 rounded-lg border-gray-300 text-gray-900 focus:ring-gray-900/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border w-fit uppercase tracking-wider ${statusConfig.color}`}>
                      {statusConfig.label}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">
                        {discount.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-1 tracking-widest">{discount.code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">İndirim</p>
                      <p className="text-xl font-bold text-gray-900">
                        {discount.type === "percentage" ? `%${discount.value}` : `₺${discount.value}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kullanım</p>
                      <p className="text-xl font-bold text-gray-900">{discount.usedCount}</p>
                    </div>
                  </div>

                  {isExpiringSoon(discount.endDate) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-600 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      YAKINDA SONA ERİYOR
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span>Kalan Limit</span>
                      <span>{discount.usageLimit ? `${Math.round((discount.usedCount / discount.usageLimit) * 100)}%` : "∞"}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full transition-all duration-1000"
                        style={{ width: discount.usageLimit ? `${(discount.usedCount / discount.usageLimit) * 100}%` : "100%" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href={`/admin/indirimler/${discount.id}/duzenle`}
                      className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      DÜZENLE
                    </Link>
                    <button
                      onClick={() => handleDuplicate(discount.id)}
                      className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={sortedDiscounts.length > 0 && selectedDiscounts.length === sortedDiscounts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-gray-300 text-gray-900 focus:ring-gray-900/5"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">KAMPANYA BİLGİSİ</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">TİP & DEĞER</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">DURUM</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">KULLANIM</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedDiscounts.map((discount) => {
                const statusConfig = getStatusConfig(discount.status);
                return (
                  <tr key={discount.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(discount.id)}
                        onChange={(e) => handleSelectDiscount(discount.id, e.target.checked)}
                        className="w-5 h-5 rounded-lg border-gray-300 text-gray-900 focus:ring-gray-900/5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{discount.name}</span>
                        <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">{discount.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">
                          {discount.type === "percentage" ? `%${discount.value}` : `₺${discount.value}`}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{discount.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-black border w-fit uppercase tracking-wider ${statusConfig.color}`}>
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{discount.usedCount} Use</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Limit: {discount.usageLimit || "∞"}</span>
                        </div>
                        {isExpiringSoon(discount.endDate) && (
                          <span title="Yakında sona eriyor">
                            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <Link
                          href={`/admin/indirimler/${discount.id}/duzenle`}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(discount.id)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {sortedDiscounts.length === 0 && (
        <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-6 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
            <Percent className="w-10 h-10 text-gray-300" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight italic">İndirim Bulunamadı</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Elediğiniz kriterlere uygun bir kampanya bulunamadı veya henüz hiç kampanya oluşturmadınız.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/indirimler/yeni")}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 flex items-center gap-3 mx-auto"
          >
            <Plus className="w-5 h-5" />
            İLK İNDİRİMİ OLUŞTUR
          </button>
        </div>
      )}
    </div>
  );
}
