"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  MoreVertical,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface PillarData {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  clusterCount: number;
  publishedClusters: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PillarsManagement() {
  const [pillars, setPillars] = useState<PillarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");

  useEffect(() => {
    loadPillars();
  }, []);

  const loadPillars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo-hub/pillars");
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setPillars([]);
      } else {
        setPillars(data.pillars || []);
      }
    } catch (error) {
      console.error("Error loading pillars:", error);
      setError("Veriler yüklenirken bir hata oluştu");
      setPillars([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPillars = pillars.filter((pillar) => {
    const matchesSearch =
      pillar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pillar.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || pillar.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Aktif
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Taslak
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
            Arşiv
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/seo-hub"
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pillar Yönetimi</h1>
                <p className="text-sm text-gray-500">Topikal otorite kategorilerini yönetin</p>
              </div>
            </div>
          </div>
          <Link
            href="/admin/seo-hub/pillars/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yeni Pillar
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Veri Yüklenemedi</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPillars}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pillar ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="draft">Taslak</option>
                <option value="archived">Arşivlenmiş</option>
              </select>
            </div>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPillars.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                    {pillar.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {pillar.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {pillar.description || "Açıklama eklenmemiş"}
                        </p>
                      </div>
                      {getStatusBadge(pillar.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-700">{pillar.clusterCount}</span>
                        <span>cluster</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium text-gray-700">{pillar.publishedClusters}</span>
                        <span>yayında</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{new Date(pillar.updated_at).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/seo/${pillar.slug}`}
                      target="_blank"
                      className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                      title="Görüntüle"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Link>

                    <Link
                      href={`/admin/seo-hub/pillars/${pillar.id}`}
                      className="w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Link>

                    <button
                      onClick={() => {/* Delete handler */}}
                      className="w-9 h-9 bg-gray-50 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPillars.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "Arama kriterlerine uygun pillar bulunamadı"
                  : "Henüz pillar oluşturulmamış"}
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Farklı arama terimleri veya filtreler deneyin"
                  : "SEO Hub'ı kullanmaya başlamak için ilk pillar kategorinizi oluşturun"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link
                  href="/admin/seo-hub/pillars/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  İlk Pillar'ı Oluştur
                </Link>
              )}
            </div>
          )}

          {/* Summary Footer */}
          {pillars.length > 0 && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">SEO Hub Özeti</h3>
                    <p className="text-gray-300 text-sm">
                      {pillars.length} pillar, {pillars.reduce((sum, p) => sum + p.clusterCount, 0)} cluster
                    </p>
                  </div>
                </div>
                <Link
                  href="/seo"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-medium text-sm hover:bg-gray-100 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  SEO Hub'ı Görüntüle
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
