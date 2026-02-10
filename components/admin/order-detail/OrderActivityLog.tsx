"use client";

import { useState } from "react";
import { OrderActivityLog, OrderActivityAction } from "@/types/order";
import { History, ChevronDown, Filter, X } from "lucide-react";

interface OrderActivityLogComponentProps {
  activities: OrderActivityLog[];
  className?: string;
}

const ACTION_LABELS: Record<OrderActivityAction, string> = {
  order_created: "Sipariş oluşturuldu",
  status_changed: "Durum değişti",
  payment_status_changed: "Ödeme durumu değişti",
  shipping_updated: "Kargo güncellendi",
  note_added: "Not eklendi",
  note_updated: "Not güncellendi",
  note_deleted: "Not silindi",
  customer_notified: "Bildirim gönderildi",
};

const ACTION_ICONS: Record<OrderActivityAction, { icon: string; color: string; bg: string }> = {
  order_created: { icon: "🟢", color: "text-emerald-600", bg: "bg-emerald-50" },
  status_changed: { icon: "🔄", color: "text-blue-600", bg: "bg-blue-50" },
  payment_status_changed: { icon: "💳", color: "text-purple-600", bg: "bg-purple-50" },
  shipping_updated: { icon: "📦", color: "text-indigo-600", bg: "bg-indigo-50" },
  note_added: { icon: "📝", color: "text-amber-600", bg: "bg-amber-50" },
  note_updated: { icon: "✏️", color: "text-amber-600", bg: "bg-amber-50" },
  note_deleted: { icon: "🗑️", color: "text-red-600", bg: "bg-red-50" },
  customer_notified: { icon: "📧", color: "text-cyan-600", bg: "bg-cyan-50" },
};

type FilterType = "all" | OrderActivityAction;

function formatTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "Bilinmiyor";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dk`;
  if (diffHours < 24) return `${diffHours} sa`;
  if (diffDays < 7) return `${diffDays} gün`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export function OrderActivityLogComponent({ activities, className = "" }: OrderActivityLogComponentProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredActivities = filter === "all"
    ? activities
    : activities.filter(a => a.action === filter);

  const uniqueActions = Array.from(
    new Set(activities.map(a => a.action))
  ) as OrderActivityAction[];

  // Status translations
  const statusLabels: Record<string, string> = {
    pending: "Beklemede",
    confirmed: "Onaylandı",
    preparing: "Hazırlanıyor",
    shipped: "Kargolandı",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
    refunded: "İade Edildi",
  };

  const paymentStatusLabels: Record<string, string> = {
    pending: "Beklemede",
    processing: "İşleniyor",
    completed: "Tamamlandı",
    failed: "Başarısız",
    refunded: "İade Edildi",
  };

  const formatActivityDescription = (activity: OrderActivityLog): string => {
    switch (activity.action) {
      case "status_changed":
        return `"${statusLabels[activity.oldValue] || activity.oldValue}" → "${statusLabels[activity.newValue] || activity.newValue}"`;
      case "payment_status_changed":
        return `"${paymentStatusLabels[activity.oldValue] || activity.oldValue}" → "${paymentStatusLabels[activity.newValue] || activity.newValue}"`;
      case "shipping_updated":
        return activity.newValue?.trackingNumber
          ? `${activity.newValue.trackingNumber}`
          : "Kargo bilgisi güncellendi";
      case "note_added":
      case "note_updated":
        return activity.newValue?.text || "";
      case "customer_notified":
        return activity.newValue?.type === "email"
          ? "E-posta gönderildi"
          : "SMS gönderildi";
      default:
        return "";
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Compact Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">Sipariş Geçmişi</h3>
            <span className="text-xs text-gray-400">({activities.length})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          {uniqueActions.length > 1 && (
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="bg-transparent text-xs font-bold text-gray-600 border-0 focus:ring-0 cursor-pointer py-0"
              >
                <option value="all">Tümü</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{ACTION_LABELS[action]}</option>
                ))}
              </select>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Activity List - Compact */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <p className="text-xs">Kayıt bulunmuyor.</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const actionConfig = ACTION_ICONS[activity.action];
                const description = formatActivityDescription(activity);

                return (
                  <div key={activity.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${actionConfig.bg} ${actionConfig.color}`}>
                      {actionConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm">
                          {ACTION_LABELS[activity.action]}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatTime(activity.createdAt)}
                        </span>
                      </div>
                      
                      {description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {description}
                        </p>
                      )}
                      
                      {activity.adminName && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {activity.adminName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { OrderActivityLogComponent as OrderActivityLog };
