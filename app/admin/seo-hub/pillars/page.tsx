// SEO Hub Pillar Management
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
  AlertTriangle,
  MoreVertical,
  ArrowLeft,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");

  useEffect(() => {
    loadPillars();
  }, []);

  const loadPillars = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seo-hub/pillars");
      const data = await response.json();
      setPillars(data.pillars || []);
    } catch (error) {
      console.error("Error loading pillars:", error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/seo-hub"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pillar Yönetimi
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Topikal otorite kategorilerini yönetin
                </p>
              </div>
            </div>
            <Link
              href="/admin/seo-hub/pillars/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Pillar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pillar ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="draft">Taslak</option>
              <option value="archived">Arşivlenmiş</option>
            </select>
          </div>
        </div>

        {/* Pillars List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPillars.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-3xl">{pillar.icon}</span>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {pillar.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          pillar.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : pillar.status === "draft"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          {pillar.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {pillar.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-4 h-4" />
                          <span>{pillar.clusterCount} cluster</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{pillar.publishedClusters} yayınlandı</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(pillar.updated_at).toLocaleDateString("tr-TR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/seo/${pillar.slug}`}
                      target="_blank"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Görüntüle"
                    >
                      <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>

                    <Link
                      href={`/admin/seo-hub/pillars/${pillar.id}`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>

                    <button
                      onClick={() => {/* Delete handler */}}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPillars.length === 0 && !loading && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== "all"
                ? "Arama kriterlerine uygun pillar bulunamadı."
                : "Henüz pillar oluşturulmamış."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
