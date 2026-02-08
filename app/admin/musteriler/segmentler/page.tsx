"use client";

import { useState } from "react";
import { getCustomers } from "@/lib/customers";
import { CustomerSegment, Customer } from "@/types/customer";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Target,
  ChevronRight,
  Filter,
  BarChart3,
  Calendar,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

const SEGMENTS: CustomerSegment[] = [
  {
    id: "seg-001",
    name: "VIP Müşteriler",
    description: "5000 TL ve üzeri harcama yapan sadık müşteriler",
    condition: [
      {
        field: "totalSpent",
        operator: ">=",
        value: 5000,
      },
    ],
    customerCount: 0,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "seg-002",
    name: "Yeni Müşteriler",
    description: "Son 30 gün içinde kayıt olan potansiyeli yüksek müşteriler",
    condition: [
      {
        field: "lastOrderDays",
        operator: "<=",
        value: 30,
      },
    ],
    customerCount: 0,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "seg-003",
    name: "Kaybedilmek Üzere",
    description: "Son 90 gündür sipariş vermeyen eski müşteriler",
    condition: [
      {
        field: "lastOrderDays",
        operator: ">=",
        value: 90,
      },
    ],
    customerCount: 0,
    createdAt: new Date("2024-02-01"),
  },
];

let segmentsList: CustomerSegment[] = [...SEGMENTS];

function evaluateSegment(segment: CustomerSegment, customers: Customer[]): number {
  let count = 0;
  customers.forEach((customer) => {
    let matches = true;
    segment.condition.forEach((cond) => {
      const fieldValue = getFieldValue(customer, cond.field);
      const conditionValue = cond.value as number;

      switch (cond.operator) {
        case ">":
          matches = matches && fieldValue > conditionValue;
          break;
        case "<":
          matches = matches && fieldValue < conditionValue;
          break;
        case ">=":
          matches = matches && fieldValue >= conditionValue;
          break;
        case "<=":
          matches = matches && fieldValue <= conditionValue;
          break;
        case "=":
          matches = matches && fieldValue === conditionValue;
          break;
      }
    });
    if (matches) count++;
  });
  return count;
}

function getFieldValue(customer: Customer, field: string): number {
  switch (field) {
    case "totalSpent":
      return customer.totalSpent;
    case "totalOrders":
      return customer.totalOrders;
    case "averageOrderValue":
      return customer.averageOrderValue;
    default:
      return 0; // Simplified for demo
  }
}

function getSegments(): CustomerSegment[] {
  const customers = getCustomers();
  return segmentsList.map((seg) => ({
    ...seg,
    customerCount: evaluateSegment(seg, customers),
  }));
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>(getSegments());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  /* Segment Logic */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [newSegmentDesc, setNewSegmentDesc] = useState("");
  const [newSegmentDays, setNewSegmentDays] = useState(30);

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const newSegment: CustomerSegment = {
      id: `seg-${Date.now()}`,
      name: newSegmentName,
      description: newSegmentDesc || "Özel segment",
      condition: [
        {
          field: "lastOrderDays", // Simplified for demo
          operator: "<=",
          value: newSegmentDays,
        },
      ],
      customerCount: 0, // Will be calculated on render
      createdAt: new Date(),
    };

    // Update the module-level list (simulating persistence)
    segmentsList.push(newSegment);
    setSegments(getSegments());

    // Reset and close
    setNewSegmentName("");
    setNewSegmentDesc("");
    setShowCreateModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" segmentini silmek istediğinizden emin misiniz?`)) {
      const index = segmentsList.findIndex((s) => s.id === id);
      if (index !== -1) {
        segmentsList.splice(index, 1);
        setSegments(getSegments());
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Müşteri Segmentleri</h1>
          <p className="text-sm text-gray-500 mt-1">Müşterilerinizi davranışlarına göre gruplayın ve hedefleyin.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Segment
        </button>
      </div>

      {/* Overview Cards - A nice touch for "World Class" UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Toplam Segment</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{segments.length}</p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Target className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">En Büyü Segment</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {segments.reduce((prev, current) => (prev.customerCount > current.customerCount) ? prev : current).name}
            </p>
          </div>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Ortalama Büyüklük</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {Math.round(segments.reduce((acc, curr) => acc + curr.customerCount, 0) / (segments.length || 1))}
              <span className="text-sm font-normal text-gray-400 ml-1">müşteri</span>
            </p>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Segment ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Segments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSegments.map((segment) => (
            <div key={segment.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 group-hover:border-gray-200 transition-colors">
                      <Target className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                      <p className="text-xs text-gray-500">{new Date(segment.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(segment.id, segment.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {segment.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">
                    <Filter className="w-3 h-3" />
                    {segment.condition.length} Kriter
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">
                    <Calendar className="w-3 h-3" />
                    Otomatik Güncellenir
                  </span>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, segment.customerCount))].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] text-gray-500 font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                    {segment.customerCount > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] text-gray-500 font-bold">
                        +{segment.customerCount - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {segment.customerCount} Müşteri
                  </span>
                </div>

                <Link
                  href="#"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover/link:underline"
                >
                  Görüntüle <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {/* New Segment Card (Call to Action styled as a card) */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-300 hover:bg-gray-50 transition-all h-full min-h-[200px]"
          >
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
            </div>
            <h3 className="font-semibold text-gray-900">Yeni Segment Oluştur</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-[200px]">
              Müşterilerinizi harcama, davranış veya demografik özelliklere göre filtreleyin.
            </p>
          </button>
        </div>

        {filteredSegments.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p>Arama kriterlerinize uygun segment bulunamadı.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 text-primary hover:underline font-medium"
            >
              Yeni bir tane oluşturun
            </button>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Yeni Segment</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segment Adı</label>
                <input
                  type="text"
                  required
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  placeholder="Örn: Yüksek Cirolu Müşteriler"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={newSegmentDesc}
                  onChange={(e) => setNewSegmentDesc(e.target.value)}
                  placeholder="Bu segment kimleri kapsıyor?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Otomatik Kriter</label>
                <div className="flex items-center gap-2 text-sm">
                  <span>Son</span>
                  <input
                    type="number"
                    value={newSegmentDays}
                    onChange={(e) => setNewSegmentDays(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span>gün içinde sipariş verenler.</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
