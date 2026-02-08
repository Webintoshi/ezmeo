"use client";

import { useState, useEffect } from "react";
import { getCustomers } from "@/lib/customers";
import { Customer } from "@/types/customer";
import {
  Users,
  Mail,
  MessageCircle,
  Phone,
  BarChart3,
  TrendingUp,
  Zap,
  Star,
  ArrowRight,
  Target,
  Users2,
  PieChart,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function MarketingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const data = getCustomers();
    setCustomers([...data]);
  }, []);

  const stats = {
    totalCustomers: customers.length,
    emailCustomers: customers.filter(c => c.email).length,
    phoneCustomers: customers.filter(c => c.phone).length,
    newCustomers: customers.filter(c => c.tags?.includes("Yeni")).length,
    vipCustomers: customers.filter(c => c.tags?.includes("VIP")).length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  const marketingTools = [
    {
      title: "E-posta Kampanyaları",
      description: "Müşterilerinize toplu e-posta gönderin, şablonlar oluşturun ve kampanya başarımını takip edin.",
      icon: Mail,
      color: "blue",
      href: "/admin/pazarlama/email",
      metric: "98.4% Teslimat",
    },
    {
      title: "WhatsApp İletişim",
      description: "Anlık mesajlaşma ile müşterilerinize ulaşın, sipariş güncellemeleri ve özel teklifler gönderin.",
      icon: MessageCircle,
      color: "emerald",
      href: "/admin/pazarlama/whatsapp",
      metric: "94% Okunma",
    },
    {
      title: "Telefon & SMS",
      description: "Kritik bilgilendirmeler ve VIP müşteri görüşmeleri için doğrudan iletişim kanalınızı yönetin.",
      icon: Phone,
      color: "purple",
      href: "/admin/pazarlama/phone",
      metric: "Yüksek Dönüşüm",
    },
  ];

  const insights = [
    {
      title: "Terk Edilen Sepetler",
      value: "14",
      change: "+2",
      type: "warning",
      action: "E-posta Hatırlatması Gönder",
    },
    {
      title: "VIP Segment Artışı",
      value: "%12",
      change: "+4%",
      type: "success",
      action: "Özel Teklif Oluştur",
    },
    {
      title: "Düşük Etkileşimli Müşteriler",
      value: "86",
      change: "-5",
      type: "info",
      action: "Geri Kazanım Kampanyası",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-8 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
            <Target className="w-3.5 h-3.5" />
            Büyüme & Sadakat
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pazarlama Merkezi</h1>
          <p className="text-gray-500 text-sm max-w-lg">
            Müşteri kitlenizi analiz edin, segmentlere ayırın ve çok kanallı pazarlama stratejileri ile satışlarınızı artırın.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/musteriler/segmentler"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Users2 className="w-4 h-4" />
            SEGMENTLER
          </Link>
          <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/10">
            <Zap className="w-4 h-4" />
            YENİ KAMPANYA
          </button>
        </div>
      </div>

      {/* Stats Grid - Premium Glassmorphism Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Toplam Müşteri</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +12% artış
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">VIP Müşteriler</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.vipCustomers}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +5 yeni VIP
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Toplam Harcama</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₺{(stats.totalSpent / 1000).toFixed(1)}K</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-full">
              <PieChart className="w-3 h-3" />
              ₺4.2K Ort. Sepet
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kampanya Erişimi</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">%84.2</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 w-fit px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Premium Segment
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Marketing Tools */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pazarlama Kanalları</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketingTools.map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-14 h-14 bg-${tool.color}-50 text-${tool.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {tool.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{tool.metric}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all transform group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Campaign Insights Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Otomatik Öneriler</h2>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{insight.title}</span>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${insight.type === "warning" ? "bg-amber-50 text-amber-600" :
                    insight.type === "success" ? "bg-emerald-50 text-emerald-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                    {insight.change}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{insight.value}</span>
                  <span className="text-xs text-gray-400">müşteri</span>
                </div>
                <button className="w-full py-2.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                  {insight.action}
                </button>
              </div>
            ))}

            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">AI Kampanya Sihirbazı</h4>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  Yapay zeka müşteri verilerinizi analiz ederek size en yüksek dönüşüm sağlayacak kampanya kurgusunu hazırlasın.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                  SİHİRBAZI BAŞLAT
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
