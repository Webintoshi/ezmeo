// SEO Hub Admin Dashboard
"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  TrendingUp,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface PillarStats {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  clusterCount: number;
  publishedClusters: number;
  avgWordCount: number;
  lastUpdated: string;
  status: "active" | "draft" | "archived";
}

interface HubDashboardStats {
  totalPillars: number;
  totalClusters: number;
  publishedClusters: number;
  avgWordCount: number;
  freshContent: number; // 3 ay içinde güncellenen
}

export default function SEOHubDashboard() {
  const [stats, setStats] = useState<HubDashboardStats>({
    totalPillars: 10,
    totalClusters: 14,
    publishedClusters: 14,
    avgWordCount: 2500,
    freshContent: 14,
  });
  const [pillars, setPillars] = useState<PillarStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPillarData();
  }, []);

  const loadPillarData = async () => {
    setLoading(true);
    try {
      // MDX dosyalarını doğrudan oku
      const response = await fetch("/api/seo-hub/pillars");
      const data = await response.json();

      if (data.pillars) {
        setPillars(data.pillars);

        // İstatistikleri hesapla
        const totalClusters = data.pillars.reduce((sum: number, p: PillarStats) => sum + p.clusterCount, 0);
        const publishedClusters = data.pillars.reduce((sum: number, p: PillarStats) => sum + p.publishedClusters, 0);
        const avgWordCount = data.pillars.length > 0
          ? Math.round(data.pillars.reduce((sum: number, p: PillarStats) => sum + p.avgWordCount, 0) / data.pillars.length)
          : 0;
        const now = new Date();
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        const freshContent = data.pillars.filter((p: PillarStats) =>
          new Date(p.lastUpdated) > threeMonthsAgo
        ).length;

        setStats({
          totalPillars: data.pillars.length,
          totalClusters,
          publishedClusters,
          avgWordCount,
          freshContent,
        });
      }
    } catch (error) {
      console.error("Error loading pillar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevalidate = async () => {
    try {
      const response = await fetch("/api/seo-hub/revalidate", {
        method: "POST",
      });
      if (response.ok) {
        alert("İçerik başarıyla yenilendi");
        loadPillarData();
      }
    } catch (error) {
      console.error("Revalidate error:", error);
      alert("İçerik yenileme başarısız");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SEO Hub
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Topikal otorite ve içerik stratejisi yönetimi
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRevalidate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Yenile
              </button>
              <Link
                href="/seo"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Eye className="w-4 h-4" />
                Görüntüle
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Pillar</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalPillars}</p>
              </div>
              <FolderOpen className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Cluster</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalClusters}</p>
              </div>
              <FileText className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ortalama Kelime</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.avgWordCount}</p>
              </div>
              <BookOpen className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Güncel İçerik</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.freshContent}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">3 ay içinde</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Pillars Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pillar Kategorileri
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-48"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pillars.map((pillar) => (
                <Link
                  key={pillar.id}
                  href={`/admin/seo-hub/pillars`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{pillar.icon}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pillar.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                    }`}>
                      {pillar.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {pillar.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {pillar.clusterCount} içerik
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {pillar.publishedClusters} yayınlandı
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(pillar.lastUpdated).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}