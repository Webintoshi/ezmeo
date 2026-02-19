"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Eye,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertCircle,
  Globe,
  Target,
  Zap,
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
  freshContent: number;
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div 
        className={`h-full transition-all duration-500 ${
          percent >= 80 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ScoreBadge({ score, text }: { score: number; text: string }) {
  let color = "bg-red-500";
  if (score >= 80) color = "bg-emerald-500";
  else if (score >= 60) color = "bg-amber-500";
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold text-xl`}>
        {score}
      </div>
      <div>
        <div className="font-semibold text-gray-900">{text}</div>
        <div className="text-xs text-gray-500">SEO Hub Puanı</div>
      </div>
    </div>
  );
}

export default function SEOHubDashboard() {
  const [stats, setStats] = useState<HubDashboardStats>({
    totalPillars: 0,
    totalClusters: 0,
    publishedClusters: 0,
    avgWordCount: 0,
    freshContent: 0,
  });
  const [pillars, setPillars] = useState<PillarStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPillarData();
  }, []);

  const loadPillarData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo-hub/pillars");
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setPillars([]);
      } else if (data.pillars) {
        setPillars(data.pillars);

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
      setError("Veriler yüklenirken bir hata oluştu");
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
        loadPillarData();
      }
    } catch (error) {
      console.error("Revalidate error:", error);
    }
  };

  const overallScore = stats.totalPillars > 0 
    ? Math.round((stats.publishedClusters / Math.max(stats.totalClusters, 1)) * 100)
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SEO Hub</h1>
              <p className="text-sm text-gray-500">Topikal otorite ve içerik stratejisi yönetimi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRevalidate}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
            <Link
              href="/seo"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Eye className="w-4 h-4" />
              Görüntüle
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-xl mx-auto mb-4 animate-bounce" />
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Veri Yüklenemedi</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPillarData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <ScoreBadge score={overallScore} text={overallScore >= 80 ? "Harika!" : overallScore >= 60 ? "İyi" : "Geliştirilmeli"} />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-purple-600">{stats.totalPillars}</div>
              <div className="text-gray-500 text-sm">Toplam Pillar</div>
              <div className="text-xs text-emerald-600 mt-1">{pillars.filter(p => p.status === "active").length} aktif</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-blue-600">{stats.totalClusters}</div>
              <div className="text-gray-500 text-sm">Toplam Cluster</div>
              <div className="text-xs text-emerald-600 mt-1">{stats.publishedClusters} yayında</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-amber-600">{stats.avgWordCount.toLocaleString("tr-TR")}</div>
              <div className="text-gray-500 text-sm">Ort. Kelime</div>
              <div className="text-xs text-gray-400 mt-1">içerik başına</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-emerald-600">{stats.freshContent}</div>
              <div className="text-gray-500 text-sm">Güncel İçerik</div>
              <div className="text-xs text-gray-400 mt-1">3 ay içinde</div>
            </div>
          </div>

          {/* Actions Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Neyi Düzenlemek İstiyorsun?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Pillars Card */}
              <Link href="/admin/seo-hub/pillars" className="group block">
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                      <FolderOpen className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pillar Kategorileri</h3>
                  <p className="text-gray-500 text-sm mb-6">Topikal otorite kategorilerini yönetin</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Aktif</span>
                      <span className="font-semibold text-gray-900">{pillars.filter(p => p.status === "active").length} / {stats.totalPillars}</span>
                    </div>
                    <ProgressBar 
                      completed={pillars.filter(p => p.status === "active").length} 
                      total={stats.totalPillars || 1} 
                    />
                    <div className="text-right text-xs text-gray-400">
                      %{stats.totalPillars > 0 ? Math.round((pillars.filter(p => p.status === "active").length / stats.totalPillars) * 100) : 0} tamamlandı
                    </div>
                  </div>
                </div>
              </Link>

              {/* Clusters Card */}
              <Link href="/admin/seo-hub/pillars" className="group block">
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Cluster İçerikler</h3>
                  <p className="text-gray-500 text-sm mb-6">Detaylı SEO içeriklerini düzenleyin</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Yayında</span>
                      <span className="font-semibold text-gray-900">{stats.publishedClusters} / {stats.totalClusters}</span>
                    </div>
                    <ProgressBar 
                      completed={stats.publishedClusters} 
                      total={stats.totalClusters || 1} 
                    />
                    <div className="text-right text-xs text-gray-400">
                      %{stats.totalClusters > 0 ? Math.round((stats.publishedClusters / stats.totalClusters) * 100) : 0} tamamlandı
                    </div>
                  </div>
                </div>
              </Link>

              {/* Content Quality Card */}
              <Link href="/seo" target="_blank" className="group block">
                <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">İçerik Kalitesi</h3>
                  <p className="text-gray-500 text-sm mb-6">Ortalama kelime sayısı ve güncellik</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hedef (2500+)</span>
                      <span className="font-semibold text-gray-900">{stats.avgWordCount >= 2500 ? "✓" : "Devam"}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min((stats.avgWordCount / 3000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {stats.avgWordCount.toLocaleString("tr-TR")} kelime ort.
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Stats / Recent Activity */}
          {pillars.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Pillar Özeti
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pillars.slice(0, 6).map((pillar) => (
                  <Link
                    key={pillar.id}
                    href={`/admin/seo-hub/pillars`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {pillar.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{pillar.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {pillar.clusterCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {pillar.publishedClusters}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(pillar.lastUpdated).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {pillars.length === 0 && !loading && !error && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Henüz Pillar Oluşturulmamış
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    SEO Hub'ı kullanmaya başlamak için önce pillar kategorileri oluşturun. 
                    Her pillar, ilgili SEO konularının kapsamlı bir rehberi olacak.
                  </p>
                </div>
                <Link
                  href="/admin/seo-hub/pillars"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-lg"
                >
                  Pillar Yönetimi
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
